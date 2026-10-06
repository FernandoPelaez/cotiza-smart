"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

export function BenefitsMotion({
  children,
}: {
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = root.current;

      if (!container) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const section =
            container.querySelector<HTMLElement>(".benefits-section");

          const eyebrow =
            container.querySelector<HTMLElement>(".benefits-eyebrow");

          const titleLines = Array.from(
            container.querySelectorAll<HTMLElement>(
              ".benefits-title-line > *",
            ),
          );

          const copy =
            container.querySelector<HTMLElement>(
              ".benefits-intro .section-copy",
            );

          const scene =
            container.querySelector<HTMLElement>(".benefits-scene");

          const image =
            container.querySelector<HTMLElement>(
              ".benefits-scene img",
            );

          const listLine =
            container.querySelector<HTMLElement>(
              ".benefits-list-line",
            );

          const items = Array.from(
            container.querySelectorAll<HTMLElement>(
              ".benefit-item",
            ),
          );

          if (!section) {
            return;
          }

          if (eyebrow) {
            gsap.set(eyebrow, {
              autoAlpha: 0,
              x: -22,
              letterSpacing: "3px",
            });
          }

          if (titleLines.length > 0) {
            gsap.set(titleLines, {
              yPercent: 115,
              rotate: 1.8,
              transformOrigin: "left bottom",
            });
          }

          if (copy) {
            gsap.set(copy, {
              autoAlpha: 0,
              clipPath: "inset(0 100% 0 0)",
              x: -12,
            });
          }

          if (scene) {
            gsap.set(scene, {
              clipPath: "inset(0 100% 0 0)",
            });
          }

          if (image) {
            gsap.set(image, {
              scale: 1.08,
              xPercent: -4,
              rotate: -1.2,
              filter: "blur(7px) saturate(0.88)",
              transformOrigin: "45% 55%",
            });
          }

          if (listLine) {
            gsap.set(listLine, {
              scaleX: 0,
              transformOrigin: "left center",
            });
          }

          items.forEach((item) => {
            const number =
              item.querySelector<HTMLElement>(".benefit-number");

            const icon = item.querySelector<SVGElement>("svg");

            const title = item.querySelector<HTMLElement>("h3");

            const text = item.querySelector<HTMLElement>("p");

            const separator =
              item.querySelector<HTMLElement>(
                ".benefit-separator",
              );

            if (number) {
              gsap.set(number, {
                autoAlpha: 0,
                x: -14,
                scale: 0.82,
              });
            }

            if (title) {
              gsap.set(title, {
                autoAlpha: 0,
                x: 24,
                clipPath: "inset(0 100% 0 0)",
              });
            }

            if (text) {
              gsap.set(text, {
                autoAlpha: 0,
                x: 16,
                filter: "blur(4px)",
              });
            }

            if (icon) {
              gsap.set(icon, {
                autoAlpha: 0,
                scale: 0.6,
                rotate: -32,
                transformOrigin: "center",
              });
            }

            if (separator) {
              gsap.set(separator, {
                scaleX: 0,
                transformOrigin: "left center",
              });
            }
          });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              once: true,
            },
          });

          timeline.addLabel("intro");

          if (eyebrow) {
            timeline.to(
              eyebrow,
              {
                autoAlpha: 1,
                x: 0,
                letterSpacing: "1.6px",
                duration: 0.58,
                ease: "expo.out",
              },
              "intro",
            );
          }

          if (titleLines.length > 0) {
            timeline.to(
              titleLines,
              {
                yPercent: 0,
                rotate: 0,
                duration: 0.88,
                stagger: 0.11,
                ease: "power4.out",
              },
              "intro+=0.12",
            );
          }

          if (copy) {
            timeline.to(
              copy,
              {
                autoAlpha: 1,
                x: 0,
                clipPath: "inset(0 0% 0 0)",
                duration: 0.68,
                ease: "power3.inOut",
              },
              "intro+=0.45",
            );
          }

          timeline.addLabel("visual", "intro+=0.58");

          if (scene) {
            timeline.to(
              scene,
              {
                clipPath: "inset(0 0% 0 0)",
                duration: 0.9,
                ease: "expo.inOut",
              },
              "visual",
            );
          }

          if (image) {
            timeline.to(
              image,
              {
                scale: 1,
                xPercent: 0,
                rotate: 0,
                filter: "blur(0px) saturate(1)",
                duration: 1.15,
                ease: "power4.out",
              },
              "visual+=0.06",
            );
          }

          timeline.addLabel("list", "visual+=0.18");

          if (listLine) {
            timeline.to(
              listLine,
              {
                scaleX: 1,
                duration: 0.72,
                ease: "power3.inOut",
              },
              "list",
            );
          }

          items.forEach((item, index) => {
            const number =
              item.querySelector<HTMLElement>(".benefit-number");

            const icon = item.querySelector<SVGElement>("svg");

            const title = item.querySelector<HTMLElement>("h3");

            const text = item.querySelector<HTMLElement>("p");

            const separator =
              item.querySelector<HTMLElement>(
                ".benefit-separator",
              );

            const position = `list+=${0.1 + index * 0.16}`;

            if (number) {
              timeline.to(
                number,
                {
                  autoAlpha: 1,
                  x: 0,
                  scale: 1,
                  duration: 0.42,
                  ease: "back.out(1.7)",
                },
                position,
              );
            }

            if (title) {
              timeline.to(
                title,
                {
                  autoAlpha: 1,
                  x: 0,
                  clipPath: "inset(0 0% 0 0)",
                  duration: 0.58,
                  ease: "power4.out",
                },
                position,
              );
            }

            if (icon) {
              timeline.to(
                icon,
                {
                  autoAlpha: 1,
                  scale: 1,
                  rotate: 0,
                  duration: 0.5,
                  ease: "back.out(1.8)",
                },
                `${position}+=0.06`,
              );
            }

            if (text) {
              timeline.to(
                text,
                {
                  autoAlpha: 1,
                  x: 0,
                  filter: "blur(0px)",
                  duration: 0.52,
                  ease: "power3.out",
                },
                `${position}+=0.11`,
              );
            }

            if (separator) {
              timeline.to(
                separator,
                {
                  scaleX: 1,
                  duration: 0.62,
                  ease: "power3.inOut",
                },
                `${position}+=0.17`,
              );
            }
          });

          return () => {
            timeline.kill();
          };
        },
      );

      return () => {
        media.revert();
      };
    },
    {
      scope: root,
    },
  );

  return <div ref={root}>{children}</div>;
}
