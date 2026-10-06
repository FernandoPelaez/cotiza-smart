"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion, MOTION } from "@/lib/motion/gsap";

export function useDisclosureMotion(
  open: boolean | undefined,
  defaultOpen: boolean | undefined,
  onChange?: (open: boolean) => void,
) {
  const [local, setLocal] = useState(defaultOpen ?? false);
  const requested = open ?? local;
  const [retained, setRetained] = useState(requested);
  const id = useId();

  useEffect(() => {
    let active = true;

    if (requested) {
      queueMicrotask(() => {
        if (active) {
          setRetained(true);
        }
      });

      return () => {
        active = false;
      };
    }

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-disclosure="${id}"]`,
      ),
    );

    if (targets.length === 0 || reducedMotion()) {
      queueMicrotask(() => {
        if (active) {
          setRetained(false);
        }
      });

      return () => {
        active = false;
      };
    }

    const tween = gsap.to(targets, {
      opacity: 0,
      duration: MOTION.exit,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        if (active) {
          setRetained(false);
        }
      },
    });

    return () => {
      active = false;
      tween.kill();
    };
  }, [requested, id]);

  return {
    id,
    open: requested || retained,
    change: (next: boolean) => {
      setLocal(next);
      onChange?.(next);
    },
  };
}

export function useSurfaceEntrance(
  backdrop = false,
  side?: string,
) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;

      if (!element) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const initialState = backdrop
            ? {
                opacity: 0,
              }
            : side
              ? {
                  opacity: 0,
                  x:
                    side === "left"
                      ? -24
                      : side === "right"
                        ? 24
                        : 0,
                  y:
                    side === "top"
                      ? -24
                      : side === "bottom"
                        ? 24
                        : 0,
                }
              : {
                  opacity: 0,
                  scale: 0.975,
                };

          const tween = gsap.fromTo(element, initialState, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: MOTION.enter,
            ease: MOTION.ease,
            overwrite: "auto",
            clearProps: "opacity,transform",
          });

          return () => {
            tween.kill();
          };
        },
      );

      return () => {
        media.revert();
      };
    },
    {
      dependencies: [backdrop, side],
      revertOnUpdate: true,
    },
  );

  return ref;
}
