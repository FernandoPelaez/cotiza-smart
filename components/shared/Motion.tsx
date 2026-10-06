"use client";
import { useRef, type ReactNode } from "react";
import { gsap, MOTION, useGSAP } from "@/lib/motion/gsap";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(root.current, {
          clipPath: "inset(0 0 12% 0)",
          opacity: 0.3,
          duration: MOTION.reveal,
          delay,
          ease: MOTION.ease,
          scrollTrigger: {
            trigger: root.current,
            start: "top 94%",
            once: true,
          },
          clearProps: "all",
        });
      });

      return () => media.revert();
    },
    {
      scope: root,
    },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

export function ViewMotion({
  children,
  id,
  variant = "default",
}: {
  children: ReactNode;
  id: string;
  variant?: "default" | "auth";
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = root.current;

      if (!container) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (variant === "auth") {
          const card =
            container.querySelector<HTMLElement>(".auth-form");

          if (!card) return;

          const content = Array.from(
            card.querySelectorAll<HTMLElement>(
              [
                ":scope > .eyebrow",
                ":scope > h1",
                ":scope > .auth-description",
                ":scope > .auth-setup-notice",
                ":scope > .auth-fields",
                ":scope > .auth-success",
                ":scope > .auth-divider",
                ":scope > .btn-secondary",
                ":scope > .auth-switch",
              ].join(", "),
            ),
          );

          const timeline = gsap.timeline({
            defaults: {
              ease: "power2.out",
            },
          });

          timeline.fromTo(
            card,
            {
              autoAlpha: 0,
            },
            {
              autoAlpha: 1,
              duration: 0.42,
              clearProps: "opacity,visibility",
            },
          );

          if (content.length > 0) {
            timeline.fromTo(
              content,
              {
                autoAlpha: 0,
                y: 6,
              },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.38,
                stagger: 0.045,
                clearProps: "transform,opacity,visibility",
              },
              "-=0.18",
            );
          }

          return;
        }

        gsap.from(container, {
          opacity: 0.25,
          x: 8,
          duration: MOTION.change,
          ease: MOTION.ease,
          clearProps: "all",
        });
      });

      return () => media.revert();
    },
    {
      scope: root,
      dependencies: [id, variant],
      revertOnUpdate: true,
    },
  );

  return <div ref={root}>{children}</div>;
}