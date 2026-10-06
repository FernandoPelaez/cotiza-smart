"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

type RotatingWord = {
  text: string;
  color: string;
};

type HeroMotionProps = {
  children: ReactNode;
  rotatingWords: readonly RotatingWord[];
};

export function HeroMotion({
  children,
  rotatingWords,
}: HeroMotionProps) {
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
          const header =
            document.querySelector<HTMLElement>(".marketing-header");

          const brand =
            header?.querySelector<HTMLElement>(".brand") ?? null;

          const navItems = header
            ? Array.from(
                header.querySelectorAll<HTMLElement>(
                  ".desktop-links a",
                ),
              )
            : [];

          const headerActions = header
            ? Array.from(
                header.querySelectorAll<HTMLElement>(
                  ".marketing-actions > *, .mobile-menu",
                ),
              )
            : [];

          const eyebrow =
            container.querySelector<HTMLElement>(
              ".hero-content > .eyebrow",
            );

          const staticLines = Array.from(
            container.querySelectorAll<HTMLElement>(
              ".hero-line:not(.hero-dynamic-line) > span",
            ),
          );

          const paragraph =
            container.querySelector<HTMLElement>(
              ".hero-content > p.hero-intro:not(.eyebrow)",
            );

          const actions =
            container.querySelector<HTMLElement>(".hero-actions");

          const facts = Array.from(
            container.querySelectorAll<HTMLElement>(
              ".hero-facts > span",
            ),
          );

          const word =
            container.querySelector<HTMLElement>(
              ".hero-dynamic-word",
            );

          const cursor =
            container.querySelector<HTMLElement>(
              ".hero-typewriter-cursor",
            );

          const heroArt =
            container.querySelector<HTMLElement>(".hero-art");

          const heroImage =
            container.querySelector<HTMLElement>(".hero-art img");

          if (
            !word ||
            !cursor ||
            !heroArt ||
            rotatingWords.length === 0
          ) {
            return;
          }

          if (header) {
            gsap.set(header, {
              clipPath: "inset(0 0 100% 0)",
            });
          }

          if (brand) {
            gsap.set(brand, {
              autoAlpha: 0,
              x: -18,
              scale: 0.94,
            });
          }

          if (navItems.length > 0) {
            gsap.set(navItems, {
              autoAlpha: 0,
              y: -14,
              filter: "blur(7px)",
            });
          }

          if (headerActions.length > 0) {
            gsap.set(headerActions, {
              autoAlpha: 0,
              x: 18,
              scale: 0.95,
            });
          }

          if (eyebrow) {
            gsap.set(eyebrow, {
              autoAlpha: 0,
              x: -20,
              letterSpacing: "3.5px",
            });
          }

          if (staticLines.length > 0) {
            gsap.set(staticLines, {
              yPercent: 118,
              skewY: 4,
              scaleY: 0.96,
              transformOrigin: "left bottom",
            });
          }

          if (paragraph) {
            gsap.set(paragraph, {
              autoAlpha: 0,
              x: -14,
              clipPath: "inset(0 100% 0 0)",
            });
          }

          if (actions) {
            gsap.set(actions, {
              autoAlpha: 0,
              scale: 0.94,
              transformOrigin: "left center",
            });
          }

          if (facts.length > 0) {
            gsap.set(facts, {
              autoAlpha: 0,
              y: 10,
            });
          }

          gsap.set(word, {
            text: "",
            autoAlpha: 1,
            color: rotatingWords[0].color,
          });

          gsap.set(cursor, {
            autoAlpha: 0,
            backgroundColor: rotatingWords[0].color,
          });

          /*
           * La imagen permanece oculta detrás de una máscara limpia.
           * La profundidad se recupera al mismo tiempo que se descubre.
           */
          gsap.set(heroArt, {
            clipPath: "inset(0 0 0 100%)",
          });

          if (heroImage) {
            gsap.set(heroImage, {
              scale: 1.06,
              xPercent: 4,
              filter: "blur(9px) saturate(0.9)",
              transformOrigin: "70% 50%",
            });
          }

          const cursorBlink = gsap.to(cursor, {
            opacity: 0,
            duration: 0.42,
            repeat: -1,
            yoyo: true,
            ease: "steps(1)",
            paused: true,
          });

          /*
           * Después de la entrada inicial únicamente siguen
           * rotando las palabras; el resto del Hero queda estable.
           */
          const rotation = gsap.timeline({
            repeat: -1,
            paused: true,
          });

          const nextWords =
            rotatingWords.length > 1
              ? [...rotatingWords.slice(1), rotatingWords[0]]
              : [rotatingWords[0]];

          let currentText = rotatingWords[0].text;

          nextWords.forEach(({ text, color }) => {
            rotation
              .to({}, {
                duration: 1.55,
              })
              .to(word, {
                text: {
                  value: "",
                  delimiter: "",
                },
                duration: Math.max(
                  0.25,
                  currentText.length * 0.03,
                ),
                ease: "none",
              })
              .set(word, {
                color,
              })
              .set(cursor, {
                backgroundColor: color,
              })
              .to(word, {
                text: {
                  value: text,
                  delimiter: "",
                },
                duration: Math.max(
                  0.5,
                  text.length * 0.065,
                ),
                ease: "none",
              });

            currentText = text;
          });

          const master = gsap.timeline({
            defaults: {
              ease: "power4.out",
            },
          });

          // 1. Header.
          if (header) {
            master.to(header, {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.72,
              ease: "power4.inOut",
            });
          }

          if (brand) {
            master.to(
              brand,
              {
                autoAlpha: 1,
                x: 0,
                scale: 1,
                duration: 0.48,
                ease: "expo.out",
              },
              "-=0.32",
            );
          }

          if (navItems.length > 0) {
            master.to(
              navItems,
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.46,
                stagger: 0.055,
                ease: "power3.out",
              },
              "-=0.27",
            );
          }

          if (headerActions.length > 0) {
            master.to(
              headerActions,
              {
                autoAlpha: 1,
                x: 0,
                scale: 1,
                duration: 0.48,
                stagger: 0.08,
                ease: "expo.out",
              },
              "-=0.2",
            );
          }

          // 2. Contenido fijo del Hero.
          master.addLabel("content", "+=0.08");

          if (eyebrow) {
            master.to(
              eyebrow,
              {
                autoAlpha: 1,
                x: 0,
                letterSpacing: "1.6px",
                duration: 0.55,
                ease: "expo.out",
              },
              "content",
            );
          }

          if (staticLines.length > 0) {
            master.to(
              staticLines,
              {
                yPercent: 0,
                skewY: 0,
                scaleY: 1,
                duration: 0.82,
                stagger: 0.13,
                ease: "power4.out",
              },
              "content+=0.1",
            );
          }

          if (paragraph) {
            master.to(
              paragraph,
              {
                autoAlpha: 1,
                x: 0,
                clipPath: "inset(0 0% 0 0)",
                duration: 0.68,
                ease: "power3.inOut",
              },
              "content+=0.46",
            );
          }

          if (actions) {
            master.to(
              actions,
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.3)",
              },
              "content+=0.64",
            );
          }

          if (facts.length > 0) {
            master.to(
              facts,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.09,
                ease: "power3.out",
              },
              "content+=0.78",
            );
          }

          // 3. Empieza la primera palabra cuando el contenido ya apareció.
          master.addLabel("word", "+=0.12");

          master
            .set(
              cursor,
              {
                autoAlpha: 1,
                backgroundColor: rotatingWords[0].color,
              },
              "word",
            )
            .call(
              () => {
                cursorBlink.play();
              },
              [],
              "word",
            )
            .to(
              word,
              {
                text: {
                  value: rotatingWords[0].text,
                  delimiter: "",
                },
                color: rotatingWords[0].color,
                duration: Math.max(
                  0.5,
                  rotatingWords[0].text.length * 0.065,
                ),
                ease: "none",
              },
              "word",
            );

          /*
           * 4. La imagen empieza a entrar mientras termina
           * de escribirse la primera palabra.
           */
          master.addLabel("image", "word+=0.28");

          master.to(
            heroArt,
            {
              clipPath: "inset(0 0 0 0%)",
              duration: 0.92,
              ease: "expo.inOut",
            },
            "image",
          );

          if (heroImage) {
            master.to(
              heroImage,
              {
                scale: 1,
                xPercent: 0,
                filter: "blur(0px) saturate(1)",
                duration: 1.15,
                ease: "power4.out",
              },
              "image+=0.06",
            );
          }

          master.call(
            () => {
              if (rotatingWords.length > 1) {
                rotation.play();
              }
            },
            [],
            "image+=0.95",
          );

          return () => {
            master.kill();
            rotation.kill();
            cursorBlink.kill();
          };
        },
      );

      media.add(
        "(prefers-reduced-motion: reduce)",
        () => {
          const word =
            container.querySelector<HTMLElement>(
              ".hero-dynamic-word",
            );

          const cursor =
            container.querySelector<HTMLElement>(
              ".hero-typewriter-cursor",
            );

          if (word && rotatingWords.length > 0) {
            word.textContent = rotatingWords[0].text;
            word.style.color = rotatingWords[0].color;
          }

          if (cursor) {
            cursor.style.display = "none";
          }
        },
      );

      return () => {
        media.revert();
      };
    },
    {
      scope: root,
      dependencies: [rotatingWords],
      revertOnUpdate: true,
    },
  );

  return <div ref={root}>{children}</div>;
}