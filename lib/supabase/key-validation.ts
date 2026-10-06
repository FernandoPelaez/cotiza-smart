export function isPublicSupabaseKey(key: string): boolean {
  if (key.startsWith("sb_publishable_")) return key.length > 20;
  if (key.startsWith("sb_secret_")) return false;
  try {
    const payload: unknown = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return (
      typeof payload === "object" &&
      payload !== null &&
      "role" in payload &&
      payload.role === "anon"
    );
  } catch {
    return false;
  }
}
