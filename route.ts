import { NextRequest, NextResponse } from "next/server";

// Reenvía el lead al webhook configurado (GoHighLevel, HubSpot o webhook genérico).
// Configura LEAD_FORM_WEBHOOK_URL en tus variables de entorno.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const webhookUrl = process.env.LEAD_FORM_WEBHOOK_URL;

  if (!webhookUrl) {
    // eslint-disable-next-line no-console
    console.warn("LEAD_FORM_WEBHOOK_URL no está configurada. Lead recibido:", body);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "dealerpass-website", ...body }),
    });
    if (!res.ok) throw new Error("webhook_failed");
    return NextResponse.json({ ok: true, forwarded: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "webhook_failed" }, { status: 502 });
  }
}
