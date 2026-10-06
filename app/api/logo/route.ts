import { normalizeLogo } from "@/lib/storage/logo";
import { NextResponse } from "next/server";
import { authenticatedClient } from "@/lib/services/auth";
import { checkOrigin, errorResponse, ServiceError } from "@/lib/services/http";
import { rateLimit } from "@/lib/services/rate-limit";
import { readRequestBytes } from "@/lib/services/request-body";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { client, user } = await authenticatedClient();
    await rateLimit(request, "logo", 8, 60, user.id);
    const payload = await readRequestBytes(request, 2200000);
    let form: FormData;
    try {
      form = await new Response(payload, {
        headers: { "content-type": request.headers.get("content-type") ?? "" },
      }).formData();
    } catch {
      throw new ServiceError("El archivo enviado no es válido.", 400);
    }
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 2097152 || file.size === 0)
      throw new ServiceError("Elige un logo de hasta 2 MB.", 422);
    let bytes: Uint8Array;
    try {
      bytes = await normalizeLogo(new Uint8Array(await file.arrayBuffer()));
    } catch (error) {
      throw new ServiceError(
        error instanceof Error ? error.message : "Imagen inválida.",
        422,
      );
    }
    const path = `${user.id}/${crypto.randomUUID()}.png`;
    const { error } = await client.storage
      .from("business-logos")
      .upload(path, bytes, {
        contentType: "image/png",
        upsert: false,
      });
    if (error) throw new ServiceError("No se pudo subir el logotipo.", 500);
    const { data } = client.storage.from("business-logos").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    return errorResponse(e);
  }
}
