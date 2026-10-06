import "server-only";
import { authenticatedClient } from "./auth";
import { ServiceError } from "./http";
export async function markNotificationsRead(id?: string) {
  const { client } = await authenticatedClient();
  const { error } = await client.rpc("cs_mark_notifications_read", {
    p_id: id ?? null,
  });
  if (error)
    throw new ServiceError(
      "No se pudo actualizar la notificación.",
      error.message.includes("NOT_FOUND") ? 404 : 500,
    );
}
