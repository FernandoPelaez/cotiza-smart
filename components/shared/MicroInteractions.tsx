"use client";
import { useEffect } from "react";
import { gsap, reducedMotion } from "@/lib/motion/gsap";
/** Delegación: un solo par de listeners cubre botones creados por rutas y portales. */
export function MicroInteractions() {
  useEffect(() => {
    const animated = new Set<Element>();
    const down = (event: PointerEvent) => {
      if (reducedMotion()) return;
      const target = (event.target as Element).closest(
        ".btn:not(:disabled),.icon-btn:not(:disabled)",
      );
      if (target) {
        animated.add(target);
        gsap.to(target, { scale: 0.975, duration: 0.14, overwrite: true });
      }
    };
    const release = () => {
      animated.forEach((target) => {
        gsap.to(target, {
          scale: 1,
          duration: reducedMotion() ? 0 : 0.22,
          ease: "power2.out",
          clearProps: "transform",
          overwrite: true,
        });
      });
      animated.clear();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    const papers = new Set<Element>();
    const hover = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reducedMotion()) return;
      const card = (event.target as Element).closest(".catalog-paper-stage");
      if (
        !card ||
        (event.relatedTarget instanceof Node &&
          card.contains(event.relatedTarget))
      )
        return;
      const paper = card.querySelector(".catalog-paper");
      if (!paper) return;
      papers.add(paper);
      const entering = event.type === "pointerover";
      gsap.to(paper, {
        y: entering ? -5 : 0,
        rotation: entering ? -0.25 : 0,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    };
    document.addEventListener("pointerover", hover);
    document.addEventListener("pointerout", hover);
    const spinners = new Map<Element, gsap.core.Tween>();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      for (const paper of papers) {
        if (!paper.isConnected || media.matches) {
          gsap.killTweensOf(paper);
          gsap.set(paper, { clearProps: "transform" });
          papers.delete(paper);
        }
      }
      for (const [node, tween] of spinners) {
        if (
          !node.isConnected ||
          !node.classList.contains("loading-indicator") ||
          media.matches
        ) {
          tween.kill();
          gsap.set(node, { clearProps: "transform" });
          spinners.delete(node);
        }
      }
      if (!media.matches)
        document.querySelectorAll(".loading-indicator").forEach((node) => {
          if (!spinners.has(node))
            spinners.set(
              node,
              gsap.to(node, {
                rotation: 360,
                duration: 1.2,
                repeat: -1,
                ease: "none",
                transformOrigin: "center",
              }),
            );
        });
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    media.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      spinners.forEach((t) => t.kill());
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("pointerout", hover);
      papers.forEach((paper) => gsap.killTweensOf(paper));
      animated.forEach((target) => gsap.killTweensOf(target));
    };
  }, []);
  return null;
}
