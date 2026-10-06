import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./config";
export async function serverSupabase() {
  if (!supabaseConfigured()) throw new Error("Supabase no está configurado.");
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Server Components no escriben cookies; proxy.ts renueva la sesión. */
          }
        },
      },
    },
  );
}
/** La clave administrativa solo vive en el servidor y nunca se utiliza para consultas privadas de usuarios. */
export function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret)
    throw new Error("Falta la configuración privada de Supabase.");
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
