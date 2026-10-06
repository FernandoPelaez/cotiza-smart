"use client";

import { useRef, type ReactNode } from "react";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion/gsap";

type TemplateCatalogMotionProps = {
  children: ReactNode;
  viewKey: string;
};

export function TemplateCatalogMotion({
  children,
  viewKey,
}: TemplateCatalogMotionProps) {
  const root = useRef<HTMLDivElement>(null);
  const previousViewKey = useRef(viewKey);

  // Entrada inicial del catálogo al entrar al viewport.
  useGSAP(
    () => {
      const container = root.current;

      if (!container || reducedMotion()) {
        return;
      }

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(".catalog-item"),
      );

      const pagination = container.querySelector<HTMLElement>(
        ".catalog-pagination",
      );

      if (items.length === 0) {
        return;
      }

      // Estados iniciales de las capas de cada tarjeta.
      items.forEach((item) => {
        const stage = item.querySelector<HTMLElement>(".catalog-paper-stage");
        const paper = item.querySelector<HTMLElement>(".catalog-paper");
        const previewLabel = item.querySelector<HTMLElement>(
          ".catalog-preview-label",
        );
        const caption = item.querySelector<HTMLElement>(".catalog-caption");
        const description = item.querySelector<HTMLElement>(":scope > p");
        const action = item.querySelector<HTMLElement>(".catalog-choose");

        gsap.set(item, {
          autoAlpha: 1,
        });

        if (stage) {
          gsap.set(stage, {
            autoAlpha: 0,
            y: 34,
            z: -40,
            scale: 0.965,
            rotateX: 5,
            transformOrigin: "center top",
            transformPerspective: 1100,
            filter: "blur(6px)",
            force3D: true,
          });
        }

        if (paper) {
          gsap.set(paper, {
            autoAlpha: 0,
            y: 18,
            scale: 0.985,
            clipPath: "inset(0 0 100% 0)",
            transformOrigin: "center top",
          });
        }

        if (previewLabel) {
          gsap.set(previewLabel, {
            autoAlpha: 0,
            y: 8,
          });
        }

        if (caption) {
          gsap.set(caption, {
            autoAlpha: 0,
            y: 16,
          });
        }

        if (description) {
          gsap.set(description, {
            autoAlpha: 0,
            y: 12,
            filter: "blur(4px)",
          });
        }

        if (action) {
          gsap.set(action, {
            autoAlpha: 0,
            x: -12,
          });
        }
      });

      if (pagination) {
        gsap.set(pagination, {
          autoAlpha: 0,
          y: 18,
        });
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 88%",
          once: true,
        },
      });

      // Secuencia escalonada: escenario, documento, etiqueta y contenido.
      items.forEach((item, index) => {
        const stage = item.querySelector<HTMLElement>(".catalog-paper-stage");
        const paper = item.querySelector<HTMLElement>(".catalog-paper");
        const previewLabel = item.querySelector<HTMLElement>(
          ".catalog-preview-label",
        );
        const caption = item.querySelector<HTMLElement>(".catalog-caption");
        const description = item.querySelector<HTMLElement>(":scope > p");
        const action = item.querySelector<HTMLElement>(".catalog-choose");

        const start = index * 0.13;

        if (stage) {
          timeline.to(
            stage,
            {
              autoAlpha: 1,
              y: 0,
              z: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 0.68,
              ease: "power4.out",
            },
            start,
          );
        }

        if (paper) {
          timeline.to(
            paper,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.72,
              ease: "expo.out",
              clearProps: "transform,clipPath",
            },
            start + 0.12,
          );
        }

        if (previewLabel) {
          timeline.to(
            previewLabel,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.36,
              ease: "power3.out",
            },
            start + 0.32,
          );
        }

        if (caption) {
          timeline.to(
            caption,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.46,
              ease: "power3.out",
            },
            start + 0.38,
          );
        }

        if (description) {
          timeline.to(
            description,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.46,
              ease: "power3.out",
              clearProps: "transform,filter",
            },
            start + 0.46,
          );
        }

        if (action) {
          timeline.to(
            action,
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.42,
              ease: "expo.out",
              clearProps: "transform",
            },
            start + 0.54,
          );
        }
      });

      if (pagination) {
        timeline.to(
          pagination,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            ease: "power3.out",
          },
          Math.max(0.5, items.length * 0.13),
        );
      }

      return () => {
        timeline.kill();
      };
    },
    {
      scope: root,
    },
  );

  // Cambio de filtro o página.
  useGSAP(
    () => {
      const container = root.current;

      if (!container) {
        return;
      }

      const previous = previousViewKey.current;

      if (viewKey === previous) {
        return;
      }
      previousViewKey.current = viewKey;

      if (reducedMotion()) {
        return;
      }

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(".catalog-item"),
      );

      if (items.length === 0) {
        return;
      }

      gsap.killTweensOf(items);

      const timeline = gsap.timeline({
        defaults: {
          overwrite: "auto",
        },
      });

      items.forEach((item, index) => {
        const stage = item.querySelector<HTMLElement>(".catalog-paper-stage");
        const paper = item.querySelector<HTMLElement>(".catalog-paper");
        const previewLabel = item.querySelector<HTMLElement>(
          ".catalog-preview-label",
        );
        const caption = item.querySelector<HTMLElement>(".catalog-caption");
        const description = item.querySelector<HTMLElement>(":scope > p");
        const action = item.querySelector<HTMLElement>(".catalog-choose");

        const start = index * 0.085;

        if (stage) {
          timeline.fromTo(
            stage,
            {
              autoAlpha: 0,
              y: 24,
              z: -28,
              scale: 0.975,
              rotateX: 3,
              filter: "blur(5px)",
              transformPerspective: 1000,
              transformOrigin: "center top",
              force3D: true,
            },
            {
              autoAlpha: 1,
              y: 0,
              z: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 0.54,
              ease: "power4.out",
            },
            start,
          );
        }

        if (paper) {
          timeline.fromTo(
            paper,
            {
              autoAlpha: 0.2,
              y: 12,
              scale: 0.99,
              clipPath: "inset(0 0 16% 0)",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.5,
              ease: "expo.out",
              clearProps: "transform,clipPath",
            },
            start + 0.08,
          );
        }

        if (previewLabel) {
          timeline.fromTo(
            previewLabel,
            {
              autoAlpha: 0,
              y: 6,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              ease: "power3.out",
            },
            start + 0.2,
          );
        }

        if (caption) {
          timeline.fromTo(
            caption,
            {
              autoAlpha: 0,
              y: 10,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.36,
              ease: "power3.out",
            },
            start + 0.24,
          );
        }

        if (description) {
          timeline.fromTo(
            description,
            {
              autoAlpha: 0,
              y: 8,
              filter: "blur(3px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.38,
              ease: "power3.out",
              clearProps: "transform,filter",
            },
            start + 0.3,
          );
        }

        if (action) {
          timeline.fromTo(
            action,
            {
              autoAlpha: 0,
              x: -8,
            },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.34,
              ease: "expo.out",
              clearProps: "transform",
            },
            start + 0.36,
          );
        }
      });

      return () => {
        timeline.kill();
      };
    },
    {
      dependencies: [viewKey],
      scope: root,
    },
  );

  return <div ref={root}>{children}</div>;
}
