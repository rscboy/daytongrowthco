import { isService, validTimezone, type Scenario } from "@/src/scheduling/catalog";
import { CalProvider, digest, object, SchedulingError } from "@/lib/scheduling/provider";
import { PreviewProvider } from "@/lib/scheduling/preview";
import { PreviewAttemptStore, RedisAttemptStore } from "@/lib/scheduling/store";
import { SchedulingEngine, validateFit } from "@/lib/scheduling/engine";

export const runtime = "nodejs";
export const maxDuration = 60;
let previewStore = new PreviewAttemptStore();
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex" } });
const previewEnabled = () => process.env.NODE_ENV === "development" && !process.env.CAL_API_KEY;
function publicMeeting(meeting: Awaited<ReturnType<CalProvider["meeting"]>>) {
  // Provider location settings can contain an unpublished address or phone number.
  const { location: privateLocation, ...visible } = meeting;
  void privateLocation;
  return visible;
}
function infrastructure(scenario: unknown) {
  const preview = previewEnabled();
  const validScenarios: Scenario[] = ["ready", "empty", "error", "stale", "uncertain", "requested"];
  const provider = preview ? new PreviewProvider(validScenarios.includes(scenario as Scenario) ? scenario as Scenario : "ready") : new CalProvider();
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const store = preview ? previewStore : url && token ? new RedisAttemptStore(url, token) : undefined;
  return { provider, store, preview };
}
export async function GET(request: Request) {
  const service = new URL(request.url).searchParams.get("service");
  if (!service) return json({ mode: previewEnabled() ? "preview" : "live" });
  if (!isService(service)) return json({ code: "invalid-service", message: "Choose a service." }, 400);
  const { provider, store, preview } = infrastructure("ready");
  try {
    const meeting = await provider.meeting(service);
    if (!store) { meeting.canBook = false; meeting.reason = "The calendar connection is being completed. Please use the existing booking option below."; }
    return json({ meeting: publicMeeting(meeting), mode: preview ? "preview" : "live" });
  } catch (error) { return failure(error, preview); }
}
function failure(error: unknown, preview: boolean) {
  return error instanceof SchedulingError ? json({ code: error.code, message: error.message, mode: preview ? "preview" : "live" }, error.status) : json({ code: "unavailable", message: "We couldn’t reach the calendar. Please try again or use the existing booking option.", mode: preview ? "preview" : "live" }, 503);
}
export async function POST(request: Request) {
  // Same-origin browser requests only; no permissive CORS and no credentials in the client.
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set(["https://daytongrowth.co", "https://www.daytongrowth.co", ...(process.env.SCHEDULER_SITE_ORIGIN ? [process.env.SCHEDULER_SITE_ORIGIN] : [])]);
  if (process.env.NODE_ENV === "development" && origin) {
    try { const local = new URL(origin); if (["localhost", "127.0.0.1"].includes(local.hostname)) allowedOrigins.add(local.origin); } catch { /* Invalid origin stays rejected. */ }
  }
  if (!origin || !allowedOrigins.has(origin) || request.headers.get("sec-fetch-site") === "cross-site") return json({ code: "invalid-origin", message: "Please book from the DaytonGrowthCo website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ message: "Invalid request." }, 415);
  if (Number(request.headers.get("content-length")) > 16000) return json({ message: "Please shorten your answers." }, 413);
  const raw = await request.text();
  if (raw.length > 16000) return json({ message: "Please shorten your answers." }, 413);
  let body: Record<string, unknown>;
  try { body = object(JSON.parse(raw)); } catch { return json({ message: "Please check your booking details." }, 400); }
  const { provider, store, preview } = infrastructure(body.scenario);
  try {
    if (body.action === "reset-preview" && preview) { previewStore = new PreviewAttemptStore(); return json({ ok: true, mode: "preview" }); }
    if (store instanceof RedisAttemptStore) {
      const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const bucket = body.action === "book" ? "book" : "read";
      const count = Number(await store.command(["EVAL", "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n", 1, `dgc:scheduler:rate:${bucket}:${digest(address)}`, 3600]));
      if (count > (bucket === "book" ? 12 : 180)) return json({ code: "rate-limited", message: "Please wait a little before trying again, or email help@daytongrowth.co." }, 429);
    }
    if (body.action === "availability") {
      if (!isService(body.service) || !validTimezone(body.timezone)) throw new SchedulingError("invalid-selection", "Choose a service and timezone.");
      validateFit(body.service, body.qualification);
      const start = typeof body.start === "string" ? Date.parse(body.start) : NaN;
      const end = typeof body.end === "string" ? Date.parse(body.end) : NaN;
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > 33 * 86400000 || start < Date.now() - 2 * 86400000 || end > Date.now() + 367 * 86400000) throw new SchedulingError("invalid-range", "Choose a date within the next year.");
      const meeting = await provider.meeting(body.service);
      if (!meeting.canBook || !store) throw new SchedulingError("not-configured", meeting.reason || "The calendar is being connected. Please use the existing booking option.", 503);
      const slots = await provider.slots(meeting, new Date(start).toISOString(), new Date(end).toISOString(), body.timezone);
      return json({ slots, meeting: publicMeeting(meeting), mode: preview ? "preview" : "live" });
    }
    if (!store) throw new SchedulingError("not-configured", "The calendar is being connected. Please use the existing booking option.", 503);
    const engine = new SchedulingEngine(provider, store);
    if (body.action === "book") return json(await engine.book(body));
    if (body.action === "status") return json(await engine.status(String(body.requestId)));
    return json({ message: "Unknown scheduling action." }, 400);
  } catch (error) { return failure(error, preview); }
}
