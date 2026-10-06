"use client";
import { useEffect, useRef, useState } from "react";
import { CircleCheck, CircleX, Info, X } from "lucide-react";
import {
  subscribeFeedback,
  type FeedbackMessage,
} from "@/lib/services/feedback";
import { gsap, reducedMotion } from "@/lib/motion/gsap";
export function ActionFeedback() {
  const [message, setMessage] = useState<FeedbackMessage | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => subscribeFeedback(setMessage), []);
  useEffect(() => {
    if (!message || !panel.current) return;
    const node = panel.current;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        node,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" },
      );
    });
    // Los errores requieren cierre explícito: no se oculta información antes de poder leerla.
    const timer =
      message.kind === "error"
        ? undefined
        : window.setTimeout(() => {
            gsap.to(node, {
              opacity: 0,
              scale: 0.98,
              duration: reducedMotion() ? 0 : 0.2,
              onComplete: () => setMessage(null),
            });
          }, 3200);
    return () => {
      clearTimeout(timer);
      media.revert();
      gsap.killTweensOf(node);
    };
  }, [message]);
  if (!message) return null;
  const Icon =
    message.kind === "success"
      ? CircleCheck
      : message.kind === "error"
        ? CircleX
        : Info;
  return (
    <div className="feedback-layer">
      <div
        ref={panel}
        className={`action-feedback feedback-${message.kind}`}
        role={message.kind === "error" ? "alert" : "status"}
        aria-atomic="true"
      >
        <Icon size={34} strokeWidth={1.6} />
        <p>{message.message}</p>
        <button
          onClick={() => setMessage(null)}
          aria-label="Cerrar mensaje"
          className="feedback-close"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
