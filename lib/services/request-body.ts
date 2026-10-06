import { ServiceError } from "./errors";
/** El límite se aplica al flujo real: Content-Length puede faltar o ser incorrecto. */
export async function readRequestBytes(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes)
    throw new ServiceError("La solicitud es demasiado grande.", 413);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ServiceError("La solicitud es demasiado grande.", 413);
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
export async function readRequestText(request: Request, maxBytes: number) {
  return new TextDecoder().decode(await readRequestBytes(request, maxBytes));
}
