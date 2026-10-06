import { z } from "zod";
export class ApiError extends Error {
  constructor(
    message: string,
    public code = "ERROR",
  ) {
    super(message);
  }
}
export async function apiRequest<T>(
  url: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  body?: unknown,
  method?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: method ?? (body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const result = z
      .object({ error: z.string(), code: z.string().optional() })
      .safeParse(data);
    throw new ApiError(
      result.success ? result.data.error : "No se pudo completar la solicitud.",
      result.success ? result.data.code : undefined,
    );
  }
  return schema.parse(data);
}
