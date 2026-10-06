import "server-only";
import { cache } from "react";
import { serverSupabase } from "@/lib/supabase/server";
import { ServiceError } from "./http";
export const authenticatedClient = cache(async function authenticatedClient() {
  const client = await serverSupabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new ServiceError(
      "Inicia sesión para continuar.",
      401,
      "AUTH_REQUIRED",
    );
  return { client, user: data.user };
});
