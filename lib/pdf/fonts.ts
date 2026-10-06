import { Font } from "@react-pdf/renderer";
import { DOCUMENT_FONTS } from "@/lib/domain/design";
const registered = new Set<string>();
export function registerPdfFonts(origin: string) {
  if (registered.has(origin)) return;
  for (const font of DOCUMENT_FONTS)
    Font.register({
      family: font.family,
      fonts: [
        { src: `${origin}/fonts/${font.regular}`, fontWeight: 400 },
        { src: `${origin}/fonts/${font.bold}`, fontWeight: 700 },
      ],
    });
  // Nombres sin espacios y URLs largas también deben poder dividirse dentro del documento.
  Font.registerHyphenationCallback((word: string) =>
    word.length > 24 ? (word.match(/.{1,18}/gu) ?? [word]) : [word],
  );
  registered.add(origin);
}
