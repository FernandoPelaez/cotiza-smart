export interface TemplateLayout {
  header: "split" | "center" | "reverse" | "band" | "rail" | "masthead";
  title: "plain" | "rule" | "large" | "panel";
  parties: "split" | "tint" | "stack" | "line";
  table: "line" | "minimal" | "grid" | "zebra" | "ink";
  totals: "right" | "left" | "band" | "box";
  frame: "none" | "top" | "side" | "border";
  density: "compact" | "normal" | "airy";
  headingFirst: boolean;
}
