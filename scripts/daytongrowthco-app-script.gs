// DaytonGrowthCo website forms. Google Apps Script web-app handler.
const TO_EMAIL = "sam@daytongrowth.co";

// Inbox identity
const FROM_NAME = "DaytonGrowthCo.";
const FROM_ALIAS = "sam@daytongrowth.co";   // must be configured in Gmail under "Send mail as"

// Brand
const LOGO_URL   = "https://github.com/rscboy/daytongrowthco/blob/main/favicon.png?raw=true";
const SITE_URL   = "https://www.daytongrowth.co/";
const REPLY_TO   = "sam@daytongrowth.co";
const PHONE      = "(937) 367-7089";
const C_BLUE     = "#2563EB";
const C_DARK     = "#0A0E1A";

// Cloudflare Turnstile
const TURNSTILE_SECRET_PROP = "TURNSTILE_SECRET";
const TURNSTILE_EXPECTED_ACTIONS = [
  "quick_recommendation",
  "free_website_redesign"
];

function doPost(e) {
  try {
    const data = getPayload_(e);

    // --- Cloudflare Turnstile verification ---
    const check = verifyTurnstile_(data.turnstileToken);
    if (check.status === "reject") {
      return jsonOut_({ ok: true }); // likely bot: drop silently
    }

    // 1) Notify the business owner (pretty HTML)
    const isRedesign = isRedesignRequest_(data);
    const flag = check.status === "ok" ? "" : "⚠️ UNVERIFIED: ";
    const inquiryLabel = isRedesign ? "Free redesign request" : "New inquiry";
    sendEmail_({
      to: TO_EMAIL,
      subject: `${flag}${inquiryLabel}: ${data.businessName || data.yourName || "Website lead"}`,
      html: buildOwnerHtml_(data, check),
      text: ownerText_(data, check),
      replyTo: data.emailAddress || REPLY_TO
    });

    // 2) Confirmation to the client (pretty HTML), only if their email looks valid
    if (isEmail_(data.emailAddress)) {
      sendEmail_({
        to: data.emailAddress,
        subject: isRedesign
          ? "We received your free website redesign request"
          : "We got your request | DaytonGrowthCo.",
        html: buildClientHtml_(data),
        text: clientText_(data),
        replyTo: REPLY_TO
      });
    }

    return jsonOut_({ ok: true });

  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

/* ───────────────────────── Email sending ───────────────────────── */

function sendEmail_(opts) {
  const options = {
    name: FROM_NAME,
    htmlBody: opts.html,
    replyTo: opts.replyTo || REPLY_TO
  };
  try {
    if (GmailApp.getAliases().indexOf(FROM_ALIAS) !== -1) options.from = FROM_ALIAS;
  } catch (err) {}
  GmailApp.sendEmail(opts.to, opts.subject, opts.text || "", options);
}

/* ───────────────────────── Shared shell ───────────────────────── */

function emailShell_(innerHtml, preheader) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0E1A;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml_(preheader || "")}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E1A;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">

        <!-- Header -->
        <tr><td style="padding:4px 6px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td><img src="${LOGO_URL}" width="40" height="40" alt="DaytonGrowthCo." style="display:block;border-radius:9px;"></td>
            <td style="padding-left:11px;font-size:19px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">Dayton<span style="color:#94a3b8;font-weight:400;">Growth</span><span style="color:#3B82F6;">Co.</span></td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.35);">
          <div style="height:4px;background:${C_BLUE};"></div>
          <div style="padding:40px 40px 34px;">
            ${innerHtml}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:26px 12px 8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
            <a href="mailto:${REPLY_TO}" style="color:#94a3b8;text-decoration:none;">${REPLY_TO}</a>
            &nbsp;·&nbsp; ${PHONE} &nbsp;·&nbsp; Dayton, OH
          </p>
          <p style="margin:0;font-size:12px;color:#475569;">
            <a href="https://www.linkedin.com/company/daytongrowthco/" style="color:#64748b;text-decoration:none;">LinkedIn</a> &nbsp;·&nbsp;
            <a href="https://www.instagram.com/daytongrowthco/" style="color:#64748b;text-decoration:none;">Instagram</a> &nbsp;·&nbsp;
            <a href="https://www.facebook.com/profile.php?id=61582225267724" style="color:#64748b;text-decoration:none;">Facebook</a>
          </p>
          <p style="margin:14px 0 0;font-size:11px;color:#334155;">© ${new Date().getFullYear()} DaytonGrowthCo. · ${SITE_URL.replace('https://','').replace(/\/$/,'')}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ───────────────────────── Client confirmation ───────────────────────── */

function buildClientHtml_(d) {
  const first = (d.yourName || "there").split(" ")[0];
  const isRedesign = isRedesignRequest_(d);
  const rows = summaryRows_([
    ["Business", d.businessName],
    ["Main goal", d.mainGoal],
    ["Interested in", d.serviceTier],
    ["Website", d.websiteUrl || d.currentDomain]
  ]);

  if (isRedesign) return buildRedesignClientHtml_(d, first, rows);

  const inner = `
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td
      style="width:54px;height:54px;background:#EFF6FF;border-radius:50%;text-align:center;
             font-size:26px;line-height:54px;color:${C_BLUE};">✓</td></tr></table>

    <h1 style="margin:22px 0 10px;font-size:26px;line-height:1.2;color:${C_DARK};font-weight:800;letter-spacing:-0.02em;">
      Thanks, ${escapeHtml_(first)}. We've got it.</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">
      Your request just landed in our inbox. We'll review what you sent and get back to you with a
      recommendation <strong style="color:${C_DARK};">within 24 hours</strong>.</p>

    ${rows ? `
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:20px 22px;margin:0 0 26px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;">What you told us</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </div>` : ``}

    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;">What happens next</p>
    ${step_("1", "We review your request and your current setup.")}
    ${step_("2", "We reply with the simplest setup that makes sense for you.")}
    ${step_("3", "If it's a fit, we get you scheduled. No monthly lock-in.")}

    <div style="text-align:center;margin:30px 0 4px;">
      <a href="${SITE_URL}" style="display:inline-block;background:${C_BLUE};color:#ffffff;text-decoration:none;
         font-weight:700;font-size:15px;padding:14px 30px;border-radius:999px;">Visit DaytonGrowthCo.</a>
    </div>
    <p style="margin:18px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
      Need to add something? Just reply to this email.</p>`;

  return emailShell_(inner, `Thanks ${first}. We got your request and will reply within 24 hours.`);
}

function buildRedesignClientHtml_(d, first, rows) {
  const inner = `
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td
      style="width:54px;height:54px;background:#EFF6FF;border-radius:50%;text-align:center;
             font-size:26px;line-height:54px;color:${C_BLUE};">✓</td></tr></table>

    <p style="margin:22px 0 6px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${C_BLUE};">
      Free website redesign
    </p>
    <h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:${C_DARK};font-weight:800;letter-spacing:-0.02em;">
      Thanks, ${escapeHtml_(first)}. Your site is in the queue.</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">
      We received your request for a free homepage redesign concept. We’ll review your current website and
      follow up by email with the next step.</p>

    ${rows ? `
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:20px 22px;margin:0 0 26px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;">Your request</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </div>` : ``}

    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;">What happens next</p>
    ${step_("1", "We review your current homepage, message, and contact path.")}
    ${step_("2", "We develop a custom homepage direction for your business.")}
    ${step_("3", "We follow up by email. There is no obligation and no automatic sales call.")}

    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:14px;padding:16px 18px;margin:26px 0 0;">
      <p style="margin:0;font-size:13px;line-height:1.55;color:#92400E;">
        The free deliverable is a custom visual concept and strategic direction, not a complete production website.
      </p>
    </div>

    <div style="text-align:center;margin:30px 0 4px;">
      <a href="${SITE_URL}" style="display:inline-block;background:${C_BLUE};color:#ffffff;text-decoration:none;
         font-weight:700;font-size:15px;padding:14px 30px;border-radius:999px;">Visit DaytonGrowthCo.</a>
    </div>
    <p style="margin:18px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
      Need to add something? Just reply to this email.</p>`;

  return emailShell_(inner, `Thanks ${first}. We received your free website redesign request.`);
}

/* ───────────────────────── Owner notification ───────────────────────── */

function buildOwnerHtml_(d, check) {
  const isRedesign = isRedesignRequest_(d);
  const rows = summaryRows_([
    ["Name", d.yourName],
    ["Business", d.businessName],
    ["Email", d.emailAddress],
    ["Website", d.websiteUrl || d.currentDomain],
    ["Request type", isRedesign ? "Free website redesign" : d.requestType],
    ["Main goal", d.mainGoal],
    ["Interested in", d.serviceTier],
    ["Notes", d.notes]
  ]);

  const inner = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${C_BLUE};">
      ${isRedesign ? "Free redesign request" : "New inquiry"}
    </p>
    <h1 style="margin:0 0 18px;font-size:25px;line-height:1.2;color:${C_DARK};font-weight:800;letter-spacing:-0.02em;">
      ${escapeHtml_(d.businessName || d.yourName || "Website lead")}</h1>

    ${verifyBadge_(check)}

    <div style="border:1px solid #E2E8F0;border-radius:16px;padding:6px 22px;margin:18px 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </div>

    <div style="text-align:center;margin:4px 0 0;">
      <a href="mailto:${escapeHtml_(d.emailAddress || '')}" style="display:inline-block;background:${C_DARK};color:#ffffff;
         text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:999px;">Reply to ${escapeHtml_((d.yourName||'lead').split(' ')[0])}</a>
    </div>`;

  return emailShell_(inner, `New inquiry from ${d.businessName || d.yourName || "a lead"}`);
}

// Prominent verification badge: green when verified, amber with the reason when not.
function verifyBadge_(check) {
  const ok = check && check.status === "ok";
  const bg     = ok ? "#ECFDF5" : "#FFFBEB";
  const border = ok ? "#A7F3D0" : "#FCD34D";
  const color  = ok ? "#047857" : "#B45309";
  const sub    = ok ? "#059669" : "#92400E";
  const icon   = ok ? "✓" : "⚠";
  const label  = ok ? "Verified human, confirmed via Cloudflare Turnstile"
                    : "Could not verify this submission";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px;">
      <tr><td style="background:${bg};border:1px solid ${border};border-radius:12px;padding:13px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:18px;line-height:20px;color:${color};padding-right:11px;vertical-align:top;">${icon}</td>
          <td style="font-size:13px;line-height:1.45;color:${color};font-weight:700;">${escapeHtml_(label)}
            <span style="display:block;font-weight:400;color:${sub};font-size:12px;margin-top:2px;">${escapeHtml_(check ? check.detail : "")}</span>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
}

/* ───────────────────────── Small builders ───────────────────────── */

function summaryRows_(pairs) {
  return pairs.filter(p => p[1] && String(p[1]).trim()).map(p => `
    <tr>
      <td style="padding:9px 0;font-size:13px;color:#94a3b8;width:120px;vertical-align:top;white-space:nowrap;">${escapeHtml_(p[0])}</td>
      <td style="padding:9px 0;font-size:14px;color:${C_DARK};font-weight:600;vertical-align:top;border-bottom:1px solid #F1F5F9;">${escapeHtml_(p[1])}</td>
    </tr>`).join("");
}

function step_(n, text) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;"><tr>
    <td style="width:26px;height:26px;background:#EFF6FF;border-radius:50%;text-align:center;line-height:26px;
               font-size:13px;font-weight:700;color:${C_BLUE};">${n}</td>
    <td style="padding-left:12px;font-size:14px;line-height:1.5;color:#475569;">${escapeHtml_(text)}</td>
  </tr></table>`;
}

/* ───────────────────────── Plain-text fallbacks ───────────────────────── */

function clientText_(d) {
  const first = (d.yourName || "there").split(" ")[0];
  if (isRedesignRequest_(d)) {
    return `Thanks, ${first}. Your site is in the redesign queue.\n\nWe received your request for a free homepage redesign concept for ${d.businessName || "your business"}.\n\nWebsite: ${d.websiteUrl || d.currentDomain || "-"}\n\nWe'll review your current homepage and follow up by email with the next step. There is no obligation and no automatic sales call.\n\nThe free deliverable is a custom visual concept and strategic direction, not a complete production website.\n\nDaytonGrowthCo.  ${REPLY_TO}  ${PHONE}`;
  }
  return `Thanks, ${first}. We've got it.\n\nYour request just landed in our inbox. We'll get back to you within 24 hours.\n\nBusiness: ${d.businessName || "-"}\nGoal: ${d.mainGoal || "-"}\nInterested in: ${d.serviceTier || "-"}\n\nDaytonGrowthCo.  ${REPLY_TO}  ${PHONE}`;
}

function ownerText_(d, check) {
  const status = (check && check.status === "ok") ? "VERIFIED" : "NOT VERIFIED";
  const label = isRedesignRequest_(d) ? "Free website redesign request" : "New inquiry";
  return `${label}: ${d.businessName}\n\nVerification: ${status} (${check ? check.detail : ""})\n\nName: ${d.yourName}\nBusiness: ${d.businessName}\nEmail: ${d.emailAddress}\nWebsite: ${d.websiteUrl || d.currentDomain}\nRequest type: ${d.requestType}\nGoal: ${d.mainGoal}\nInterested in: ${d.serviceTier}\nNotes: ${d.notes}`;
}

/* ───────────────────────── Turnstile + payload ───────────────────────── */

function verifyTurnstile_(token) {
  if (!token) return { status: "unverified", detail: "no token reached the server" };
  const secret = (PropertiesService.getScriptProperties().getProperty(TURNSTILE_SECRET_PROP) || "").trim();
  if (!secret) return { status: "unverified", detail: "TURNSTILE_SECRET script property is not set" };
  try {
    const resp = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "post", payload: { secret: secret, response: token }, muteHttpExceptions: true
    });
    const r = JSON.parse(resp.getContentText() || "{}");
    if (!r.success) return { status: "reject", detail: "verification failed: " + (r["error-codes"] || []).join(",") };
    if (r.action && TURNSTILE_EXPECTED_ACTIONS.indexOf(r.action) === -1) {
      return { status: "reject", detail: "action mismatch: " + r.action };
    }
    const bits = [];
    if (r.hostname) bits.push("host " + r.hostname);
    if (r.action) bits.push("action " + r.action);
    if (r.challenge_ts) bits.push(r.challenge_ts);
    return { status: "ok", detail: bits.join(" · ") || "passed" };
  } catch (err) {
    return { status: "unverified", detail: "verify error: " + String(err) };
  }
}

function getPayload_(e) {
  return clean_(readParams_(e));
}

// Robustly read fields whether the body is urlencoded, JSON, or multipart/form-data.
// Apps Script does not reliably populate e.parameter for multipart bodies, so we
// fall back to parsing e.postData.contents ourselves.
function readParams_(e) {
  const params = {};
  if (e && e.parameter) {
    for (const k in e.parameter) params[k] = e.parameter[k];
  }
  if (e && e.postData && e.postData.contents) {
    const type = (e.postData.type || "").toLowerCase();
    const body = e.postData.contents;
    try {
      if (type.indexOf("application/json") !== -1) {
        const j = JSON.parse(body || "{}");
        for (const k in j) if (params[k] == null || params[k] === "") params[k] = j[k];
      } else if (type.indexOf("multipart/form-data") !== -1) {
        const m = type.match(/boundary=(?:"([^"]+)"|([^;]+))/);
        const boundary = m ? (m[1] || m[2]).trim() : null;
        if (boundary) {
          body.split("--" + boundary).forEach(function (seg) {
            const nameM = seg.match(/name="([^"]+)"/);
            const split = seg.indexOf("\r\n\r\n");
            if (!nameM || split === -1) return;
            let val = seg.substring(split + 4);
            val = val.replace(/\r\n--\s*$/, "").replace(/\r\n$/, "");
            const key = nameM[1];
            if (params[key] == null || params[key] === "") params[key] = val;
          });
        }
      } else if (type.indexOf("application/x-www-form-urlencoded") !== -1) {
        body.split("&").forEach(function (pair) {
          const i = pair.indexOf("=");
          const k = decodeURIComponent((i === -1 ? pair : pair.slice(0, i)).replace(/\+/g, " "));
          const v = decodeURIComponent((i === -1 ? "" : pair.slice(i + 1)).replace(/\+/g, " "));
          if (k && (params[k] == null || params[k] === "")) params[k] = v;
        });
      }
    } catch (err) {}
  }
  return params;
}

function clean_(p) {
  return {
    yourName: (p.yourName || "").trim(),
    businessName: (p.businessName || "").trim(),
    emailAddress: (p.emailAddress || p.customerEmail || p.email || "").trim(),
    currentDomain: (p.currentDomain || "").trim(),
    websiteUrl: (p.websiteUrl || p.currentDomain || "").trim(),
    mainGoal: (p.mainGoal || "").trim(),
    serviceTier: (p.serviceTier || "").trim(),
    requestType: (p.requestType || "").trim(),
    sendCustomerConfirmation: (p.sendCustomerConfirmation || "").trim(),
    customerConfirmationTemplate: (p.customerConfirmationTemplate || "").trim(),
    notes: (p.notes || "").trim(),
    turnstileToken: (p["cf-turnstile-response"] || p.turnstileToken || "").trim()
  };
}

/* ───────────────────────── Utils ───────────────────────── */

function isRedesignRequest_(d) {
  return d && (
    d.requestType === "free_website_redesign" ||
    d.mainGoal === "Free website redesign" ||
    d.customerConfirmationTemplate === "free_website_redesign_received"
  );
}

function isEmail_(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || ""); }

function escapeHtml_(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ───────────────────────── One-time authorization ─────────────────────────
   Run this ONCE from the editor (select authorizeOnce → Run) and approve the
   consent screen. It grants the external-request scope (for Cloudflare) and the
   Gmail scope (for sending), which is what was missing and caused "UNVERIFIED".
   Safe to leave in the file; it does nothing on form submissions. */

function authorizeOnce() {
  UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "post",
    payload: { secret: "test", response: "test" },
    muteHttpExceptions: true
  });
  const aliases = GmailApp.getAliases();
  Logger.log("Authorized. Available send-as aliases: " + aliases.join(", "));
  if (aliases.indexOf(FROM_ALIAS) === -1) {
    throw new Error(
      FROM_ALIAS +
      ' is not configured as a Gmail "Send mail as" alias for the account running this script.'
    );
  }
  Logger.log("Authorized and sender alias confirmed: " + FROM_ALIAS);
}
