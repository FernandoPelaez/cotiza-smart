"use client";

import { useRef, type ReactNode } from "react";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion/gsap";

type HowItWorksMotionProps = {
  children: ReactNode;
  step: number;
};

const TOTAL_STEPS = 7;

export function HowItWorksMotion({ children, step }: HowItWorksMotionProps) {
  const root = useRef<HTMLDivElement>(null);
  const entranceStarted = useRef(false);
  const previousStep = useRef(step);
  const updateProgress = useRef<
    ((element: HTMLElement, value: number, animate: boolean) => void) | null
  >(null);

  // La barra tiene su propio tween reutilizable. Revertir la tarjeta no
  // interrumpe ni reinicia el avance que ya está viendo el usuario.
  useGSAP(
    () => {
      const state = {
        value: Math.min(1, Math.max(0, (step + 1) / TOTAL_STEPS)),
      };
      let element: HTMLElement | null = null;
      let originalWidth = "";
      let originalPriority = "";

      const restoreWidth = () => {
        if (!element) return;
        if (originalWidth) {
          element.style.setProperty("width", originalWidth, originalPriority);
        } else {
          element.style.removeProperty("width");
        }
      };

      const draw = () => {
        element?.style.setProperty("width", `${state.value * 100}%`);
      };

      const moveTo = gsap.quickTo(state, "value", {
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate: draw,
      });

      updateProgress.current = (nextElement, value, animate) => {
        if (element !== nextElement) {
          restoreWidth();
          element = nextElement;
          originalWidth = element.style.getPropertyValue("width");
          originalPriority = element.style.getPropertyPriority("width");
        }

        if (animate) {
          draw();
          moveTo(value);
        } else {
          moveTo.tween.pause();
          state.value = value;
          draw();
        }
      };

      return () => {
        updateProgress.current = null;
        restoreWidth();
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const container = root.current;

      if (!container) return;

      const section = container.querySelector<HTMLElement>(".workflow-section");

      if (!section) return;

      const eyebrow = container.querySelector<HTMLElement>(
        ".section-heading .eyebrow",
      );
      const headingTitle = container.querySelector<HTMLElement>(
        ".section-heading .section-title",
      );
      const headingCopy = container.querySelector<HTMLElement>(
        ".section-heading .section-copy",
      );
      const tabs = Array.from(
        container.querySelectorAll<HTMLElement>('.workflow-tabs [role="tab"]'),
      );
      const number = container.querySelector<HTMLElement>(".workflow-number");
      const title = container.querySelector<HTMLElement>(".workflow-copy h3");
      const description =
        container.querySelector<HTMLElement>(".workflow-copy p");
      const action = container.querySelector<HTMLElement>(".workflow-copy a");
      const preview = container.querySelector<HTMLElement>(".workflow-preview");
      const controls =
        container.querySelector<HTMLElement>(".workflow-controls");
      const progress = container.querySelector<HTMLElement>(
        ".workflow-progress > span",
      );
      const activeTab = container.querySelector<HTMLElement>(
        '.workflow-tabs [role="tab"][data-state="active"]',
      );

      const hasChanged = previousStep.current !== step;
      previousStep.current = step;

      const targetProgress = Math.min(1, Math.max(0, (step + 1) / TOTAL_STEPS));
      const isEntrance = !entranceStarted.current;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const distance = isMobile ? 0.7 : 1;
      const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      const elements = [
        eyebrow,
        headingTitle,
        headingCopy,
        ...tabs,
        number,
        title,
        description,
        action,
        preview,
        controls,
      ].filter((element): element is HTMLElement => element !== null);

      const showStatic = () => {
        if (elements.length > 0) {
          gsap.set(elements, { autoAlpha: 1 });
        }

        if (progress) {
          updateProgress.current?.(progress, targetProgress, false);
        }

        entranceStarted.current = true;
      };

      if (reducedMotion() || motionPreference.matches) {
        showStatic();
        return;
      }

      // Un render sin cambio de paso no vuelve a animar el módulo.
      if (!isEntrance && !hasChanged) {
        showStatic();
        return;
      }

      if (progress) {
        updateProgress.current?.(progress, targetProgress, !isEntrance);
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto" },
        ...(isEntrance && {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
          onStart: () => {
            entranceStarted.current = true;
          },
        }),
      });

      const reveal = (
        element: HTMLElement | null,
        position: number,
        lift: number,
        duration: number,
      ) => {
        if (!element) return;

        timeline.fromTo(
          element,
          { autoAlpha: 0, y: lift * distance },
          { autoAlpha: 1, y: 0, duration },
          position,
        );
      };

      if (isEntrance) {
        // Entrada única: encabezado, navegación y contenido se encadenan.
        reveal(eyebrow, 0, 10, 0.42);
        reveal(headingTitle, 0.06, 24, 0.72);
        reveal(headingCopy, 0.16, 14, 0.58);

        if (tabs.length > 0) {
          timeline.fromTo(
            tabs,
            { autoAlpha: 0, y: 10 * distance },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.42,
              stagger: { amount: isMobile ? 0.18 : 0.26, from: "start" },
            },
            0.22,
          );
        }

        reveal(number, 0.3, 12, 0.48);
        reveal(title, 0.36, 22, 0.68);
        reveal(description, 0.45, 14, 0.56);
        reveal(action, 0.54, 10, 0.46);
        reveal(controls, 0.62, 8, 0.42);
      } else {
        // Cada paso nuevo entra verticalmente; los controles quedan estables.
        reveal(number, 0, 7, 0.34);
        reveal(title, 0.025, 14, 0.46);
        reveal(description, 0.09, 10, 0.42);
        reveal(action, 0.15, 7, 0.36);

        if (activeTab) {
          timeline.fromTo(
            activeTab,
            { scale: 0.985 },
            { scale: 1, duration: 0.3, ease: "power2.out" },
            0,
          );
        }
      }

      if (preview) {
        // Una sola superficie: sin desplazarla en X ni alterar sus hijos.
        // La inclinación se reduce en móvil para mantener legible la tarjeta.
        timeline.fromTo(
          preview,
          {
            autoAlpha: isEntrance ? 0 : 0.35,
            y: (isEntrance ? 30 : 14) * distance,
            scale: isEntrance ? (isMobile ? 0.985 : 0.972) : 0.989,
            rotationX: isMobile ? 0 : isEntrance ? 3.5 : 1.5,
            transformOrigin: "50% 70%",
            transformPerspective: 1200,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: isEntrance ? 0.9 : 0.56,
            ease: "power3.out",
          },
          isEntrance ? 0.28 : 0,
        );
      }

      const onMotionPreferenceChange = () => {
        if (!motionPreference.matches) return;

        // Respeta también un cambio de preferencia durante la animación.
        timeline.totalProgress(1).pause();
        timeline.scrollTrigger?.kill(false);
        if (progress) {
          updateProgress.current?.(progress, targetProgress, false);
        }
        entranceStarted.current = true;
      };

      motionPreference.addEventListener("change", onMotionPreferenceChange);

      return () => {
        motionPreference.removeEventListener(
          "change",
          onMotionPreferenceChange,
        );
        // useGSAP revierte el timeline y su ScrollTrigger antes del siguiente
        // paso y al desmontar. No quedan animaciones antiguas sobre la tarjeta.
      };
    },
    { scope: root, dependencies: [step], revertOnUpdate: true },
  );

  return <div ref={root}>{children}</div>;
}
