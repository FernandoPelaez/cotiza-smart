"use client";

import { useRef, type ReactNode } from "react";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion/gsap";

type TemplateShowcaseMotionProps = {
  children: ReactNode;
};

const REVEAL_DURATION = 1.45;
const HIDDEN_MASK = "linear-gradient(to top, #000 -18%, transparent 0%)";

export function TemplateShowcaseMotion({
  children,
}: TemplateShowcaseMotionProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (context) => {
      const container = root.current;

      if (!container || reducedMotion()) return;

      const section =
        container.querySelector<HTMLElement>(".templates-section");

      if (!section) return;

      const eyebrow = container.querySelector<HTMLElement>(
        ".templates-heading .eyebrow",
      );
      const title = container.querySelector<HTMLElement>(
        ".templates-heading .section-title",
      );
      const copy = container.querySelector<HTMLElement>(
        ".templates-heading .section-copy",
      );
      const mascot =
        container.querySelector<HTMLImageElement>(".templates-mascot");
      const mascotFrame = container.querySelector<HTMLElement>(
        ".templates-mascot-frame",
      );
      const filterButtons = Array.from(
        container.querySelectorAll<HTMLElement>(".catalog-filters button"),
      );
      const availability = container.querySelector<HTMLElement>(
        ".catalog-availability",
      );

      const canMask =
        CSS.supports("mask-image", HIDDEN_MASK) ||
        CSS.supports("-webkit-mask-image", HIDDEN_MASK);
      const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      let disposed = false;
      let entered = false;
      let started = false;
      let motionStopped = false;
      let mascotTween: gsap.core.Tween | null = null;
      let canvas: HTMLCanvasElement | null = null;
      let resizeObserver: ResizeObserver | null = null;
      let paintParticles: ((progress: number) => void) | null = null;

      const state = { progress: 0 };
      const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
      const random = (seed: number) => {
        const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return value - Math.floor(value);
      };

      const removeParticles = () => {
        resizeObserver?.disconnect();
        resizeObserver = null;
        canvas?.remove();
        canvas = null;
        paintParticles = null;
      };

      const finishMascot = () => {
        if (mascot) {
          mascot.style.maskImage = "none";
          mascot.style.webkitMaskImage = "none";
          mascot.style.willChange = "auto";
        }

        removeParticles();
      };

      if (mascot) {
        // Se anima la imagen original: nunca se sustituye por un mosaico.
        // Evita que una transición CSS añada otra entrada al mismo elemento.
        gsap.set(mascot, {
          autoAlpha: canMask ? 1 : 0,
          animation: "none",
          transition: "none",
          ...(canMask && {
            maskImage: HIDDEN_MASK,
            webkitMaskImage: HIDDEN_MASK,
            maskMode: "alpha",
            maskSize: "100% 100%",
            maskPosition: "0% 0%",
            maskRepeat: "no-repeat",
            willChange: "mask-image",
          }),
        });
      }

      const createParticles = () => {
        if (!mascot || !mascotFrame || !mascotFrame.contains(mascot)) return;

        const columns = 36;
        const rows = 36;
        const sampler = document.createElement("canvas");
        sampler.width = columns;
        sampler.height = rows;

        const sampleContext = sampler.getContext("2d", {
          willReadFrequently: true,
        });

        if (!sampleContext) return;

        let pixels: Uint8ClampedArray;

        try {
          sampleContext.drawImage(mascot, 0, 0, columns, rows);
          pixels = sampleContext.getImageData(0, 0, columns, rows).data;
        } catch {
          // Si la imagen no permite lectura de píxeles, el revelado continúa.
          return;
        }

        const candidates = [];

        for (let index = 0; index < columns * rows; index += 1) {
          const offset = index * 4;
          if (pixels[offset + 3] < 100) continue;

          candidates.push({
            x: ((index % columns) + 0.5) / columns,
            y: (Math.floor(index / columns) + 0.5) / rows,
            radius: 0.65 + random(index + 17) * 0.65,
            lift: 5 + random(index + 23) * 8,
            order: random(index + 31),
            color:
              index % 5 === 0
                ? "#14b8a6"
                : `rgb(${pixels[offset]} ${pixels[offset + 1]} ${pixels[offset + 2]})`,
          });
        }

        const particleLimit = window.innerWidth < 768 ? 60 : 100;
        const particles = candidates
          .sort((first, second) => first.order - second.order)
          .slice(0, particleLimit);

        if (particles.length === 0) return;

        const layer = document.createElement("canvas");
        const drawing = layer.getContext("2d");

        if (!drawing) return;

        layer.setAttribute("aria-hidden", "true");
        Object.assign(layer.style, {
          position: "absolute",
          pointerEvents: "none",
          zIndex: "2",
        });

        if (window.getComputedStyle(mascotFrame).position === "static") {
          gsap.set(mascotFrame, { position: "relative" });
        }

        canvas = layer;
        mascotFrame.appendChild(layer);

        let width = 0;
        let height = 0;
        let imageWidth = 0;
        let imageHeight = 0;
        let imageLeft = 0;
        let imageTop = 0;

        paintParticles = (progress) => {
          drawing.clearRect(0, 0, width, height);

          for (const particle of particles) {
            const x = imageLeft + particle.x * imageWidth;
            const y = imageTop + particle.y * imageHeight;
            const distanceFromBottom = 1 - y / Math.max(1, height);
            const local = clamp01(
              (progress * 1.2 - distanceFromBottom + 0.04) / 0.22,
            );

            if (local <= 0 || local >= 1) continue;

            drawing.globalAlpha = Math.sin(local * Math.PI) * 0.48;
            drawing.fillStyle = particle.color;
            drawing.beginPath();
            // X permanece fija: las partículas solo ascienden unos píxeles.
            drawing.arc(
              x,
              y + particle.lift * (1 - local),
              particle.radius * (1 - local * 0.4),
              0,
              Math.PI * 2,
            );
            drawing.fill();
          }

          drawing.globalAlpha = 1;
        };

        const updateSize = () => {
          const imageRect = mascot.getBoundingClientRect();
          const frameRect = mascotFrame.getBoundingClientRect();
          const scaleX = frameRect.width / (mascotFrame.offsetWidth || 1) || 1;
          const scaleY =
            frameRect.height / (mascotFrame.offsetHeight || 1) || 1;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          width = imageRect.width / scaleX;
          height = imageRect.height / scaleY;

          Object.assign(layer.style, {
            left: `${(imageRect.left - frameRect.left) / scaleX - mascotFrame.clientLeft + mascotFrame.scrollLeft}px`,
            top: `${(imageRect.top - frameRect.top) / scaleY - mascotFrame.clientTop + mascotFrame.scrollTop}px`,
            width: `${width}px`,
            height: `${height}px`,
          });

          layer.width = Math.max(1, Math.round(width * dpr));
          layer.height = Math.max(1, Math.round(height * dpr));
          drawing.setTransform(dpr, 0, 0, dpr, 0, 0);

          const style = window.getComputedStyle(mascot);
          const contain = Math.min(
            width / mascot.naturalWidth,
            height / mascot.naturalHeight,
          );
          const cover = Math.max(
            width / mascot.naturalWidth,
            height / mascot.naturalHeight,
          );
          const fit =
            style.objectFit === "contain"
              ? contain
              : style.objectFit === "cover"
                ? cover
                : style.objectFit === "scale-down"
                  ? Math.min(1, contain)
                  : 1;

          imageWidth =
            style.objectFit === "fill" ? width : mascot.naturalWidth * fit;
          imageHeight =
            style.objectFit === "fill" ? height : mascot.naturalHeight * fit;

          const [positionX = "50%", positionY = "50%"] =
            style.objectPosition.split(" ");
          const offsetFor = (value: string, space: number) =>
            value.endsWith("%")
              ? (Number.parseFloat(value) / 100) * space
              : Number.parseFloat(value) || 0;

          imageLeft = offsetFor(positionX, width - imageWidth);
          imageTop = offsetFor(positionY, height - imageHeight);
          paintParticles?.(state.progress);
        };

        updateSize();

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(updateSize);
          resizeObserver.observe(mascot);
          resizeObserver.observe(mascotFrame);
        }
      };

      const startMascot = () => {
        if (
          disposed ||
          motionStopped ||
          started ||
          !entered ||
          !mascot?.complete ||
          mascot.naturalWidth === 0
        )
          return;

        started = true;

        if (!canMask) {
          mascotTween = gsap.to(mascot, {
            autoAlpha: 1,
            duration: 0.65,
            ease: "power2.out",
          });
          return;
        }

        createParticles();

        mascotTween = gsap.to(state, {
          progress: 1,
          duration: REVEAL_DURATION,
          ease: "sine.inOut",
          onUpdate: () => {
            const front = state.progress * 120;
            const mask = `linear-gradient(to top, #000 ${front - 18}%, transparent ${front}%)`;

            mascot.style.maskImage = mask;
            mascot.style.webkitMaskImage = mask;
            paintParticles?.(state.progress);
          },
          onComplete: finishMascot,
        });
      };

      // Los callbacks de carga también quedan registrados para el cleanup.
      const onImageLoad = () => {
        if (!disposed) context.add(startMascot);
      };
      const onImageError = () => {
        finishMascot();
        if (mascot) {
          mascot.style.opacity = "1";
          mascot.style.visibility = "visible";
        }
      };

      mascot?.addEventListener("load", onImageLoad);
      mascot?.addEventListener("error", onImageError);

      // El contenido no depende de que termine de cargar el mapache.
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });

      if (eyebrow) {
        timeline.fromTo(
          eyebrow,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45 },
          0,
        );
      }
      if (title) {
        timeline.fromTo(
          title,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.75 },
          0.07,
        );
      }
      if (copy) {
        timeline.fromTo(
          copy,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          0.2,
        );
      }

      timeline.call(
        () => {
          entered = true;
          onImageLoad();
        },
        [],
        0.12,
      );

      if (filterButtons.length > 0) {
        timeline.fromTo(
          filterButtons,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.055 },
          0.42,
        );
      }
      if (availability) {
        timeline.fromTo(
          availability,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.45 },
          0.52,
        );
      }

      const onMotionPreferenceChange = () => {
        if (!motionPreference.matches) return;

        motionStopped = true;
        timeline.progress(1);
        mascotTween?.progress(1);
        finishMascot();

        if (mascot) {
          mascot.style.opacity = "1";
          mascot.style.visibility = "visible";
        }
      };

      motionPreference.addEventListener("change", onMotionPreferenceChange);

      if (mascot?.complete && mascot.naturalWidth === 0) onImageError();

      return () => {
        disposed = true;
        mascot?.removeEventListener("load", onImageLoad);
        mascot?.removeEventListener("error", onImageError);
        motionPreference.removeEventListener(
          "change",
          onMotionPreferenceChange,
        );
        removeParticles();
        // useGSAP revierte las animaciones, los estilos y el ScrollTrigger.
      };
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}

