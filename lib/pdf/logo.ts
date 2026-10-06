/** React PDF necesita PNG/JPEG. También convierte logos WebP guardados anteriormente. */
export async function pdfLogo(source: string): Promise<string> {
  const response = await fetch(source, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) throw new Error("No se pudo cargar el logo del negocio.");
  const blob = await response.blob();
  if (blob.size > 2_097_152)
    throw new Error("El logotipo supera el tamaño permitido.");
  const bitmap = await createImageBitmap(blob);
  try {
    if (bitmap.width * bitmap.height > 4_000_000)
      throw new Error("El logotipo supera la resolución permitida.");
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar el logotipo.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    bitmap.close();
  }
}
