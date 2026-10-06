import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ServiceError } from "./errors";
import { readRequestText } from "./request-body";
export { ServiceError } from "./errors";
export function errorResponse(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: error.issues[0]?.message ?? "Revisa los datos enviados.",
        code: "VALIDATION_ERROR",
      },
      { status: 422 },
    );
  if (error instanceof ServiceError)
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  console.error(
    "[Cotiza Smart]",
    error instanceof Error ? error.message : "Error inesperado",
  );
  return NextResponse.json(
    {
      error: "No se pudo completar la operación. Intenta de nuevo.",
      code: "SERVER_ERROR",
    },
    { status: 500 },
  );
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new ServiceError("La solicitud no es válida.", 403, "INVALID_ORIGIN");
}
export async function readJson(request: Request): Promise<unknown> {
  const body = await readRequestText(request, 150000);
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ServiceError("La solicitud no contiene datos válidos.", 400);
  }
}
export function appOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : new URL(request.url).origin;
}
