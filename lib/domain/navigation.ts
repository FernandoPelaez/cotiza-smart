import { TEMPLATES } from "./templates";
import type { TemplateId } from "@/types/domain";
export type AuthDestination =
  | "/dashboard"
  | "/dashboard/planes"
  | "/reset-password"
  | `/dashboard/nueva?template=${TemplateId}`;
/** Solo se permiten destinos construidos con rutas e identificadores de nuestro catálogo. */
export function authDestination(value: unknown): AuthDestination {
  if (value === "/dashboard/planes" || value === "/reset-password")
    return value;
  const template = TEMPLATES.find(
    (entry) => value === `/dashboard/nueva?template=${entry.id}`,
  );
  return template ? `/dashboard/nueva?template=${template.id}` : "/dashboard";
}
export function entryDestination(query: {
  plan?: string;
  template?: string;
  next?: string;
}): AuthDestination {
  const template = TEMPLATES.find((entry) => entry.id === query.template);
  if (query.plan === "pro" || query.plan === "premium")
    return "/dashboard/planes";
  return template
    ? `/dashboard/nueva?template=${template.id}`
    : authDestination(query.next);
}
