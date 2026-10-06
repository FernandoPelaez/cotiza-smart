import type { DocumentFont } from "@/types/domain";
export const FONT_IDS = [
  "sans",
  "serif",
  "humanist",
  "mono",
  "lora",
  "dm",
  "plex",
  "baskerville",
] as const;
export const DOCUMENT_FONTS: {
  id: DocumentFont;
  label: string;
  family: string;
  regular: string;
  bold: string;
}[] = [
  {
    id: "sans",
    label: "Moderna · Manrope",
    family: "Manrope",
    regular: "manrope-latin-400-normal.woff",
    bold: "manrope-latin-700-normal.woff",
  },
  {
    id: "humanist",
    label: "Humanista · DejaVu Sans",
    family: "Humanist",
    regular: "DejaVuSans.ttf",
    bold: "DejaVuSans-Bold.ttf",
  },
  {
    id: "serif",
    label: "Editorial · DejaVu Serif",
    family: "Editorial",
    regular: "DejaVuSerif.ttf",
    bold: "DejaVuSerif-Bold.ttf",
  },
  {
    id: "mono",
    label: "Técnica · DejaVu Mono",
    family: "Technical",
    regular: "DejaVuSansMono.ttf",
    bold: "DejaVuSansMono-Bold.ttf",
  },
  {
    id: "lora",
    label: "Lora · editorial contemporánea",
    family: "Lora",
    regular: "lora-latin-400-normal.woff",
    bold: "lora-latin-700-normal.woff",
  },
  {
    id: "dm",
    label: "DM Sans · geométrica",
    family: "DMSans",
    regular: "dm-sans-latin-400-normal.woff",
    bold: "dm-sans-latin-700-normal.woff",
  },
  {
    id: "plex",
    label: "IBM Plex Sans · técnica",
    family: "Plex",
    regular: "ibm-plex-sans-latin-400-normal.woff",
    bold: "ibm-plex-sans-latin-700-normal.woff",
  },
  {
    id: "baskerville",
    label: "Libre Baskerville · clásica",
    family: "Baskerville",
    regular: "libre-baskerville-latin-400-normal.woff",
    bold: "libre-baskerville-latin-700-normal.woff",
  },
];
export const BRAND_COLORS = [
  { hex: "#06466f", name: "Azul Cotiza" },
  { hex: "#125b56", name: "Petróleo" },
  { hex: "#235449", name: "Bosque" },
  { hex: "#49633b", name: "Oliva" },
  { hex: "#734056", name: "Ciruela" },
  { hex: "#4f467c", name: "Índigo" },
  { hex: "#8a4b2b", name: "Terracota" },
  { hex: "#725a25", name: "Ocre" },
  { hex: "#913b46", name: "Borgoña" },
  { hex: "#334155", name: "Pizarra" },
  { hex: "#292844", name: "Medianoche" },
  { hex: "#34302d", name: "Grafito" },
  { hex: "#1d4e89", name: "Azul tinta" },
  { hex: "#006d77", name: "Laguna" },
  { hex: "#2d6a4f", name: "Jade" },
  { hex: "#606c38", name: "Musgo" },
  { hex: "#5f0f40", name: "Vino" },
  { hex: "#5a3b76", name: "Amatista" },
  { hex: "#965634", name: "Cobre" },
  { hex: "#806443", name: "Arena oscura" },
  { hex: "#9e3948", name: "Rosa antiguo" },
  { hex: "#28334a", name: "Nocturno" },
  { hex: "#525b56", name: "Piedra" },
  { hex: "#2d293a", name: "Carbón" },
];
function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((part) => {
      const value = parseInt(part, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    }) ?? [0, 0, 0];
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
// Un color personalizado claro conserva la marca sin sacrificar la lectura.
export function documentColors(color: string) {
  return {
    accent: color,
    ink: luminance(color) > 0.18 ? "#172d3b" : color,
    onAccent: luminance(color) > 0.18 ? "#000000" : "#ffffff",
  };
}
export function documentFont(id: DocumentFont) {
  return DOCUMENT_FONTS.find((font) => font.id === id) ?? DOCUMENT_FONTS[0];
}
