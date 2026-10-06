import sharp from "sharp";
/** Decodificar y volver a codificar elimina metadatos y rechaza archivos disfrazados de imagen. */
export async function normalizeLogo(bytes: Uint8Array) {
  if (bytes.byteLength === 0 || bytes.byteLength > 2_097_152)
    throw new Error("Elige un logo de hasta 2 MB.");
  try {
    const image = sharp(bytes, {
      limitInputPixels: 4_000_000,
      failOn: "error",
    });
    const meta = await image.metadata();
    if (
      !meta.width ||
      !meta.height ||
      !["png", "jpeg", "webp"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) > 1
    )
      throw new Error("INVALID_IMAGE");
    return await image
      .rotate()
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
  } catch {
    throw new Error(
      "Elige un PNG, JPG o WebP estático válido, de hasta 4 megapíxeles.",
    );
  }
}
