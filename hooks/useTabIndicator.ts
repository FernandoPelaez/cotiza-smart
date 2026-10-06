"use client";
import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/motion/gsap";
export function useTabIndicator() {
  const root = useRef<HTMLDivElement>(null),
    indicator = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const node = root.current;
      if (!node) return;
      const line = indicator.current;
      let initial = true;
      const update = () => {
        const active = node.querySelector<HTMLElement>(
          '[role="tab"][data-state="active"]',
        );
        if (!active || !indicator.current) return;
        const horizontal = node.getAttribute("aria-orientation") !== "vertical";
        gsap.to(indicator.current, {
          x: active.offsetLeft,
          y: horizontal
            ? active.offsetTop + active.offsetHeight - 2
            : active.offsetTop,
          width: horizontal ? active.offsetWidth : 2,
          height: horizontal ? 2 : active.offsetHeight,
          opacity: 1,
          duration: initial || reducedMotion() ? 0 : 0.32,
          ease: "power3.out",
          overwrite: true,
        });
        initial = false;
      };
      const state = new MutationObserver(update);
      state.observe(node, {
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state"],
      });
      const resize = new ResizeObserver(update);
      resize.observe(node);
      update();
      return () => {
        state.disconnect();
        resize.disconnect();
        if (line) gsap.killTweensOf(line);
      };
    },
    { scope: root },
  );
  return { root, indicator };
}
