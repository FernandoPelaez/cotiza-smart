"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  TextPlugin,
);

export { gsap, useGSAP, ScrollTrigger };

export const MOTION = {
  reveal: 0.65,
  change: 0.32,
  enter: 0.32,
  exit: 0.2,
  press: 0.14,
  ease: "power3.out",
} as const;

export function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
