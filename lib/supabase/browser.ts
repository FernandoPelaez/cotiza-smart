"use client";
import { isPublicSupabaseKey } from "./key-validation";
import { createBrowserClient } from "@supabase/ssr";
export function browserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !isPublicSupabaseKey(key))
    throw new Error(
      "El acceso a cuentas estará disponible al configurar Supabase. Puedes explorar la demostración.",
    );
  return createBrowserClient(url, key);
}
