import https from "https";

interface ApiRequest {
  method?: string;
  body?: any;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: any) => void;
  end: () => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // preserve body as is
      }
    }

    const { 
      to, 
      adminName, 
      eventName, 
      eventCode, 
      location, 
      startDate, 
      endDate, 
      loginUrl, 
      password, 
      permissions,
      apiKey: customApiKey,
      fromEmail: customFromEmail,
    } = body || {};

    if (!to || !eventName) {
      return res.status(400).json({ error: "Missing required fields (to, eventName)." });
    }

    const recipientName = adminName || "Event Organizer";
    const portalLink = loginUrl || "https://venue-eats.vercel.app/admin";
    const pass = password || "eventadmin2026";
    const subject = `VenueEat Access Granted: ${eventName} (${eventCode || "EVT"}) Admin Portal`;

    // 1. Resolve Resend API Key from request body, process.env.RESEND_API_KEY, or VITE_RESEND_API_KEY
    const resendApiKey = (
      customApiKey || 
      process.env.RESEND_API_KEY || 
      process.env.VITE_RESEND_API_KEY || 
      ""
    ).trim();

    if (!resendApiKey) {
      return res.status(400).json({
        success: false,
        error: "Missing Resend API Key. Please add RESEND_API_KEY to your Vercel Project Environment Variables (and redeploy), or configure it in the Super Admin Console.",
        needsApiKey: true,
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    
    <!-- Header -->
    <div style="background-color: #09090b; padding: 24px 32px; border-bottom: 1px solid #27272a; text-align: left;">
      <div style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 900; font-size: 14px; padding: 4px 8px; border-radius: 8px;">VE</div>
      <span style="font-size: 20px; font-weight: 900; color: #ffffff; margin-left: 8px; letter-spacing: -0.5px;">VenueEat Nordic</span>
      <p style="margin: 6px 0 0 0; font-size: 11px; color: #a1a1aa; font-family: monospace;">Stockholm Mobile Food Operations & Swish Portal</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px; text-align: left;">
      <h2 style="font-size: 22px; font-weight: 900; color: #ffffff; margin: 0 0 12px 0;">Hej ${recipientName}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #d4d4d8; margin: 0 0 24px 0;">
        You have been appointed as the official <strong>Event Organizer Admin</strong> for <strong>${eventName}</strong>. You now have full access to manage food vendor stalls, approve live digital menus, monitor real-time queue wait-times, and oversee festival attendee operations.
      </p>

      <!-- Event Summary Card -->
      <div style="background-color: #27272a; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 10px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-family: monospace;">Event Information</div>
        <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">${eventName}</div>
        <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 12px;">Location: <strong>${location || "Kungsträdgården, Stockholm"}</strong></div>
        <div style="font-size: 12px; color: #a1a1aa;">Dates: <strong>${startDate || "Live"} ${endDate ? `to ${endDate}` : ""}</strong></div>
      </div>

      <!-- Credentials Card -->
      <div style="background: linear-gradient(135deg, #18181b, #27272a); border: 2px solid #38bdf8; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; font-family: monospace;">Your Admin Access Credentials</div>
        
        <div style="margin-bottom: 10px;">
          <span style="font-size: 11px; color: #a1a1aa; display: block; font-family: monospace; text-transform: uppercase;">Login ID (Email):</span>
          <span style="font-size: 14px; color: #ffffff; font-weight: bold; font-family: monospace;">${to}</span>
        </div>

        <div style="margin-bottom: 14px;">
          <span style="font-size: 11px; color: #a1a1aa; display: block; font-family: monospace; text-transform: uppercase;">Temporary Password:</span>
          <span style="font-size: 15px; color: #38bdf8; font-weight: 900; font-family: monospace; letter-spacing: 0.5px;">${pass}</span>
        </div>

        ${permissions ? `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #3f3f46;">
          <span style="font-size: 11px; color: #a1a1aa; display: block; font-family: monospace; text-transform: uppercase;">Assigned Permissions:</span>
          <span style="font-size: 12px; color: #34d399; font-weight: bold;">${permissions}</span>
        </div>` : ""}
      </div>

      <!-- Direct Login CTA -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${portalLink}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
          Open Event Organizer Portal &rarr;
        </a>
        <p style="font-size: 11px; color: #71717a; margin-top: 10px; font-family: monospace;">
          You can sign in with your Email & Password or use One-Click Google Sign-In with this email address.
        </p>
      </div>

      <!-- Security Notice -->
      <p style="font-size: 11px; color: #71717a; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #27272a; padding-top: 16px;">
        This email was automatically generated by the VenueEat Master Super Admin Console. For security, please keep your login credentials confidential.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #09090b; padding: 16px 32px; text-align: center; border-top: 1px solid #27272a;">
      <p style="font-size: 10px; color: #52525b; margin: 0; font-family: monospace;">
        VenueEat Nordic AB • Kungsträdgården, 111 47 Stockholm, Sweden • support@venueeat.se
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const sender = (
      customFromEmail || 
      process.env.EMAIL_FROM || 
      "VenueEat Onboarding <onboarding@resend.dev>"
    ).trim();

    const payload = JSON.stringify({
      from: sender,
      to: [String(to).trim()],
      subject,
      html: htmlContent,
    });

    let resendResponse: Response | null = null;
    let resData: any = null;

    try {
      resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: payload,
      });
      resData = await resendResponse.json().catch(() => null);
    } catch (fetchErr: any) {
      // Fallback using https.request if global fetch encounters network issues
      resData = await new Promise((resolve, reject) => {
        const reqPost = https.request(
          {
            hostname: "api.resend.com",
            port: 443,
            path: "/emails",
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            },
          },
          (resp) => {
            let buffer = "";
            resp.on("data", (chunk) => (buffer += chunk));
            resp.on("end", () => {
              try {
                resolve({ ok: (resp.statusCode || 500) < 300, status: resp.statusCode, data: JSON.parse(buffer) });
              } catch {
                resolve({ ok: (resp.statusCode || 500) < 300, status: resp.statusCode, data: { message: buffer } });
              }
            });
          }
        );
        reqPost.on("error", (e) => reject(e));
        reqPost.write(payload);
        reqPost.end();
      });
    }

    const isOk = resendResponse ? resendResponse.ok : resData?.ok;
    const statusCode = resendResponse ? resendResponse.status : (resData?.status || 500);
    const parsedData = resendResponse ? resData : (resData?.data || resData);

    if (!isOk) {
      console.warn("[Resend API Error]:", statusCode, parsedData);
      let userFriendlyMessage = parsedData?.message || parsedData?.name || "Resend email delivery failed.";

      if (statusCode === 403 && typeof userFriendlyMessage === "string" && userFriendlyMessage.includes("testing emails")) {
        userFriendlyMessage = `Resend Sandbox Limit: In testing mode, onboarding@resend.dev can only send to the email address registered on your Resend account. To send to external addresses (${to}), verify a custom domain in your Resend Dashboard (resend.com/domains).`;
      } else if (statusCode === 401) {
        userFriendlyMessage = "Invalid Resend API Key. Please verify the RESEND_API_KEY added in Vercel or enter your key in the console.";
      }

      return res.status(statusCode).json({
        success: false,
        error: userFriendlyMessage,
        details: parsedData,
        statusCode,
      });
    }

    return res.status(200).json({
      success: true,
      mode: "live_resend",
      id: parsedData?.id,
      to,
      subject,
      timestamp: Date.now(),
      message: `Access email successfully dispatched to ${to} via Resend (ID: ${parsedData?.id || "confirmed"})!`,
    });

  } catch (err: any) {
    console.error("Error in send-email handler:", err);
    return res.status(500).json({ 
      success: false, 
      error: err?.message || "Failed to dispatch email via Resend." 
    });
  }
}
