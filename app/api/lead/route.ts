import { NextResponse } from "next/server";
import { readLead } from "@/lib/lead";
export async function POST(req: Request) {
  const origin = process.env.APP_URL;
  if (!origin || req.headers.get("origin") !== new URL(origin).origin) return NextResponse.json({ ok:false }, { status:403 });
  const webhookUrl = process.env.LEAD_FORM_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({ ok:false, error:"contact_unavailable" }, { status:503 });
  try {
    const raw = await req.text();
    if (raw.length > 8192) return NextResponse.json({ ok:false }, { status:413 });
    const lead = readLead(JSON.parse(raw));
    if (!lead) return NextResponse.json({ ok:false, error:"invalid_fields" }, { status:400 });
    const result = await fetch(webhookUrl, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(lead), signal:AbortSignal.timeout(10000) });
    if (!result.ok) return NextResponse.json({ ok:false, error:"delivery_failed" }, { status:502 });
    return NextResponse.json({ ok:true, forwarded:true });
  } catch (error) {
    return NextResponse.json({ ok:false, error:error instanceof SyntaxError ? "invalid_json" : "delivery_failed" }, { status:error instanceof SyntaxError ? 400 : 502 });
  }
}
