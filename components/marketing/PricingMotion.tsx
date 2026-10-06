"use client";
import { useRef, type ReactNode } from "react";
import {
  gsap,
  reducedMotion,
  useGSAP,
} from "@/lib/motion/gsap";

type PricingMotionProps = {
  children: ReactNode;
};

export function PricingMotion({
  children,
}: PricingMotionProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;

      if (!section) return;

      const kicker =
        section.querySelector<HTMLElement>(".pricing-kicker");

      const mascotLeft =
        section.querySelector<HTMLElement>(".pricing-mascot-left");

      const mascotRight =
        section.querySelector<HTMLElement>(".pricing-mascot-right");

      const cards = Array.from(
        section.querySelectorAll<HTMLElement>(".pricing-card"),
      );

      const featuredCard =
        section.querySelector<HTMLElement>(".pricing-featured");

      const sideCards = cards.filter(
        (card) => card !== featuredCard,
      );

      const note =
        section.querySelector<HTMLElement>(".pricing-note");

      const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

      const allAnimatedElements = [
        kicker,
        mascotLeft,
        mascotRight,
        ...cards,
        note,
      ].filter(
        (element): element is HTMLElement => element !== null,
      );

      const showStatic = () => {
        gsap.set(allAnimatedElements, {
          clearProps: "transform,opacity,visibility,filter",
        });

        cards.forEach((card) => {
          const content = card.querySelectorAll<HTMLElement>(
            ".pricing-plan-heading, .pricing-description, .pricing-price, li, .pricing-cta",
          );

          gsap.set(content, {
            clearProps: "transform,opacity,visibility,filter",
          });
        });
      };

      if (reducedMotion() || motionPreference.matches) {
        showStatic();
        return;
      }

      const isMobile = window.matchMedia(
        "(max-width: 767px)",
      ).matches;

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
          overwrite: "auto",
        },
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      /* Encabezado */
      if (kicker) {
        timeline.fromTo(
          kicker,
          {
            autoAlpha: 0,
            y: 12,
            filter: "blur(4px)",
          },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            clearProps: "transform,opacity,visibility,filter",
          },
          0,
        );
      }

      /* Mapaches */
      if (mascotLeft) {
        timeline.fromTo(
          mascotLeft,
          {
            autoAlpha: 0,
            x: isMobile ? -14 : -44,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.85,
            ease: "power4.out",
            clearProps: "transform,opacity,visibility",
          },
          0.08,
        );
      }

      if (mascotRight) {
        timeline.fromTo(
          mascotRight,
          {
            autoAlpha: 0,
            x: isMobile ? 14 : 44,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.85,
            ease: "power4.out",
            clearProps: "transform,opacity,visibility",
          },
          0.08,
        );
      }

      if (isMobile) {
        /* Móvil: entrada progresiva vertical */
        timeline.fromTo(
          cards,
          {
            autoAlpha: 0,
            y: 28,
            scale: 0.985,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.66,
            stagger: 0.1,
            clearProps: "transform,opacity,visibility",
          },
          0.14,
        );
      } else {
        /* Escritorio: primero entra el plan destacado */
        if (featuredCard) {
          timeline.fromTo(
            featuredCard,
            {
              autoAlpha: 0,
              y: 28,
              scale: 0.955,
              filter: "blur(5px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.72,
              ease: "power4.out",
              clearProps:
                "transform,opacity,visibility,filter",
            },
            0.16,
          );
        }

        /* Después entran las tarjetas laterales */
        sideCards.forEach((card, index) => {
          const direction =
            cards.indexOf(card) <
            cards.indexOf(featuredCard ?? card)
              ? -1
              : 1;

          timeline.fromTo(
            card,
            {
              autoAlpha: 0,
              x: 34 * direction,
              y: 18,
              scale: 0.97,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.68,
              ease: "power4.out",
              clearProps: "transform,opacity,visibility",
            },
            0.26 + index * 0.07,
          );
        });

        /* Fallback por si no existe una tarjeta destacada */
        if (!featuredCard && cards.length > 0) {
          timeline.fromTo(
            cards,
            {
              autoAlpha: 0,
              y: 24,
              scale: 0.97,
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.68,
              stagger: 0.08,
              clearProps: "transform,opacity,visibility",
            },
            0.16,
          );
        }
      }

      /* Contenido interno de cada tarjeta */
      cards.forEach((card, cardIndex) => {
        const heading = card.querySelector<HTMLElement>(
          ".pricing-plan-heading",
        );

        const description = card.querySelector<HTMLElement>(
          ".pricing-description",
        );

        const price = card.querySelector<HTMLElement>(
          ".pricing-price",
        );

        const features = Array.from(
          card.querySelectorAll<HTMLElement>("li"),
        );

        const button =
          card.querySelector<HTMLElement>(".pricing-cta");

        const cardIntro = [
          heading,
          description,
          price,
        ].filter(
          (element): element is HTMLElement => element !== null,
        );

        if (cardIntro.length > 0) {
          timeline.fromTo(
            cardIntro,
            {
              autoAlpha: 0,
              y: 10,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.045,
              clearProps: "transform,opacity,visibility",
            },
            0.5 + cardIndex * 0.04,
          );
        }

        if (features.length > 0) {
          timeline.fromTo(
            features,
            {
              autoAlpha: 0,
              x: -8,
            },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.32,
              stagger: 0.025,
              clearProps: "transform,opacity,visibility",
            },
            0.62 + cardIndex * 0.04,
          );
        }

        if (button) {
          timeline.fromTo(
            button,
            {
              autoAlpha: 0,
              y: 8,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.38,
              clearProps: "transform,opacity,visibility",
            },
            0.74 + cardIndex * 0.04,
          );
        }
      });

      /* Nota inferior */
      if (note) {
        timeline.fromTo(
          note,
          {
            autoAlpha: 0,
            y: 8,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            clearProps: "transform,opacity,visibility",
          },
          0.88,
        );
      }

      const onMotionPreferenceChange = () => {
        if (!motionPreference.matches) return;
        timeline.totalProgress(1).pause();
        timeline.scrollTrigger?.kill(false);
        showStatic();
      };

      motionPreference.addEventListener(
        "change",
        onMotionPreferenceChange,
      );

      return () => {
        motionPreference.removeEventListener(
          "change",
          onMotionPreferenceChange,
        );
      };
    },
    {
      scope: root,
    },
  );

  return (
    <section
      ref={root}
      id="planes"
      tabIndex={-1}
      className="pricing-section"
      aria-labelledby="pricing-title"
    >
      {children}
    </section>
  );
}