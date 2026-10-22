import { NextResponse } from "next/server";
import { auth, origin } from "@/lib/academy/server";
import { safeNext } from "@/lib/academy/policy";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await (await auth()).auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(url.searchParams.get("next")), origin()),
      );
  }
  return NextResponse.redirect(
    new URL(
      "/ingresar?message=El+enlace+no+es+válido+o+ha+caducado.",
      origin(),
    ),
  );
}
