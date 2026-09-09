import type { BookingResult, Meeting } from "../../src/scheduling/catalog";
import { SchedulingError, type BookingInput } from "./provider";

export type Attempt = { input: BookingInput; meeting: Meeting; result: BookingResult; createdAt: number };
export interface AttemptStore {
  claim(requestId: string, fingerprint: string, attempt: Attempt): Promise<{ created: boolean; attempt: Attempt }>;
  get(requestId: string): Promise<Attempt | undefined>;
  save(requestId: string, attempt: Attempt): Promise<void>;
}
const lifetime = 60 * 60 * 24 * 7;
const prefix = "dgc:scheduler:v2:";
export class RedisAttemptStore implements AttemptStore {
  constructor(private url: string, private token: string, private transport: typeof fetch = fetch) {}
  async command(args: (string | number)[]) {
    const response = await this.transport(this.url, { method: "POST", headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" }, body: JSON.stringify(args), cache: "no-store", signal: AbortSignal.timeout(8000) });
    const data = await response.json() as { result?: string | number | null; error?: string };
    if (!response.ok || data.error) throw new SchedulingError("store-unavailable", "We couldn’t safely verify the booking request. Please try again.", 503);
    return data.result;
  }
  async claim(requestId: string, fingerprint: string, attempt: Attempt) {
    // The slot guard points at a durable attempt. Only a definite rejection lets
    // a new, deliberate request claim that slot; uncertain outcomes stay guarded.
    const result = await this.command(["EVAL", `
      local priorKey = redis.call('GET', KEYS[1])
      if priorKey then
        local prior = redis.call('GET', priorKey)
        if not prior then return 'MISSING' end
        if cjson.decode(prior).fingerprint ~= ARGV[3] then return 'MISMATCH' end
        return prior
      end
      local guard = redis.call('GET', KEYS[2])
      if guard then
        local saved = redis.call('GET', guard)
        if not saved then return 'MISSING' end
        if cjson.decode(saved).result.state ~= 'rejected' then
          redis.call('SET', KEYS[1], guard, 'EX', ARGV[2])
          return saved
        end
      end
      redis.call('SET', KEYS[1], KEYS[3], 'EX', ARGV[2])
      redis.call('SET', KEYS[2], KEYS[3], 'EX', ARGV[2])
      redis.call('SET', KEYS[3], ARGV[1], 'EX', ARGV[2])
      return 'CLAIMED'
    `, 3, `${prefix}request:${requestId}`, `${prefix}slot:${fingerprint}`, `${prefix}attempt:${requestId}`, JSON.stringify({ ...attempt, fingerprint }), lifetime, fingerprint]);
    if (result === "MISMATCH") throw new SchedulingError("request-mismatch", "This request already belongs to another selection. Check its status before starting again.", 409);
    if (result === "CLAIMED") return { created: true, attempt };
    if (typeof result !== "string" || result === "MISSING") throw new SchedulingError("store-unavailable", "We couldn’t verify this request.", 503);
    return { created: false, attempt: JSON.parse(result) as Attempt };
  }
  async get(requestId: string) {
    const key = await this.command(["GET", `${prefix}request:${requestId}`]);
    if (typeof key !== "string") return undefined;
    const raw = await this.command(["GET", key]);
    return typeof raw === "string" ? JSON.parse(raw) as Attempt : undefined;
  }
  async save(requestId: string, attempt: Attempt) {
    const key = await this.command(["GET", `${prefix}request:${requestId}`]);
    if (typeof key !== "string") throw new SchedulingError("store-unavailable", "We couldn’t save the calendar response.", 503);
    const previous = await this.command(["GET", key]);
    if (typeof previous !== "string") throw new SchedulingError("store-unavailable", "We couldn’t verify the saved response.", 503);
    const fingerprint = (JSON.parse(previous) as { fingerprint: string }).fingerprint;
    await this.command(["SET", key, JSON.stringify({ ...attempt, fingerprint }), "EX", lifetime]);
  }
}

// Used only by the development preview and isolated tests. Never a production fallback.
export class PreviewAttemptStore implements AttemptStore {
  private requests = new Map<string, string>();
  private guards = new Map<string, string>();
  private attempts = new Map<string, Attempt & { fingerprint: string }>();
  async claim(requestId: string, fingerprint: string, attempt: Attempt) {
    const previous = this.requests.get(requestId);
    const prior = previous ? this.attempts.get(previous) : undefined;
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new SchedulingError("request-mismatch", "Check the earlier request before starting another.", 409);
      return { created: false, attempt: structuredClone(prior) };
    }
    const guarded = this.guards.get(fingerprint);
    const existing = guarded ? this.attempts.get(guarded) : undefined;
    if (guarded && existing && existing.result.state !== "rejected") {
      this.requests.set(requestId, guarded);
      return { created: false, attempt: structuredClone(existing) };
    }
    this.requests.set(requestId, requestId);
    this.guards.set(fingerprint, requestId);
    this.attempts.set(requestId, structuredClone({ ...attempt, fingerprint }));
    return { created: true, attempt };
  }
  async get(requestId: string) { const value = this.attempts.get(this.requests.get(requestId) || ""); return value ? structuredClone(value) : undefined; }
  async save(requestId: string, attempt: Attempt) {
    const key = this.requests.get(requestId); const previous = key ? this.attempts.get(key) : undefined;
    if (key && previous) this.attempts.set(key, structuredClone({ ...attempt, fingerprint: previous.fingerprint }));
  }
}
