import { isPublicSupabaseKey } from "./key-validation";
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    isPublicSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}
// La demostración usa exclusivamente datos locales, aunque las cuentas reales estén habilitadas.
export function demoEnabled(): boolean {
  return process.env.DEMO_ENABLED !== "false";
}
