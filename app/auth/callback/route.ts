import { NextResponse } from "next/server";
import { authDestination } from "@/lib/domain/navigation";
import { appOrigin } from "@/lib/services/http";
import { serverSupabase } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = authDestination(url.searchParams.get("next"));
  if (code) {
    try {
      const { error } = await (
        await serverSupabase()
      ).auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL(next, appOrigin(request)));
    } catch {
      /* El formulario permite volver a intentar sin exponer detalles privados. */
    }
  }
  return NextResponse.redirect(
    new URL("/login?error=auth_callback", appOrigin(request)),
  );
}
