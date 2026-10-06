"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap, reducedMotion } from "@/lib/motion/gsap";

const IDS = [
  "beneficios",
  "como-funciona",
  "plantillas",
  "planes",
  "preguntas-frecuentes",
];

export function useSectionNavigation() {
  const header = useRef<HTMLElement>(null);
  const [active, setActive] = useState("");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const offset =
        (header.current?.getBoundingClientRect().height ?? 78) + 32;

      let current = "";

      for (const id of IDS) {
        const el = document.getElementById(id);

        if (el && el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }

      setActive(current);
      frame = 0;
    };

    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.current?.offsetHeight ?? 78}px`,
      );

      schedule();
    });

    if (header.current) {
      observer.observe(header.current);
    }

    for (const id of IDS) {
      const el = document.getElementById(id);

      if (el) {
        observer.observe(el);
      }
    }

    window.addEventListener("scroll", schedule, {
      passive: true,
    });

    window.addEventListener("resize", schedule);

    update();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);

      gsap.killTweensOf(window);
    };
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hash = event.currentTarget.hash;
    const target = document.getElementById(hash.slice(1));

    if (!target) {
      return;
    }

    event.preventDefault();

    history.replaceState(null, "", hash);

    gsap.to(window, {
      scrollTo: {
        y: target,
        offsetY: header.current?.offsetHeight ?? 78,
        autoKill: true,
      },
      duration: reducedMotion() ? 0 : 0.65,
      ease: "power3.inOut",
      onComplete: () => {
        target.focus({
          preventScroll: true,
        });
      },
    });
  }

  return {
    header,
    active,
    navigate,
  };
}
