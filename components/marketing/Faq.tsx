"use client";

import { useId, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { FAQS } from "@/lib/domain/marketing";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion/gsap";

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const icon = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!panel.current) return;

      const node = panel.current;

      gsap.to(node, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        duration: reducedMotion() ? 0 : 0.32,
        ease: "power2.inOut",
        overwrite: true,
      });

      gsap.to(icon.current, {
        rotate: open ? 45 : 0,
        duration: reducedMotion() ? 0 : 0.28,
        overwrite: true,
      });
    },
    {
      dependencies: [open],
      scope: panel,
    },
  );

  return (
    <article className="faq-item">
      <h3>
        <button
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          {question}
          <Plus ref={icon} size={21} />
        </button>
      </h3>

      <div
        id={id}
        ref={panel}
        role="region"
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!open}
        inert={!open}
        className="faq-answer"
        style={{ height: 0, overflow: "hidden" }}
      >
        <p>{answer}</p>
      </div>
    </article>
  );
}

export function Faq() {
  const [open, setOpen] = useState(-1);
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = section.current;

      if (!root || reducedMotion()) return;

      const eyebrow = root.querySelector<HTMLElement>(".eyebrow");
      const title = root.querySelector<HTMLElement>(".section-title");
      const copy = root.querySelector<HTMLElement>(".section-copy");
      const items = gsap.utils.toArray<HTMLElement>(
        ".faq-item",
        root,
      );

      const intro = [eyebrow, title, copy].filter(
        (element): element is HTMLElement => Boolean(element),
      );

      gsap.set(intro, {
        autoAlpha: 0,
        y: 18,
      });

      gsap.set(items, {
        autoAlpha: 0,
        y: 16,
      });

      const reveal = () => {
        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        timeline
          .to(intro, {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
          })
          .to(
            items,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.07,
            },
            "-=0.35",
          );
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          reveal();
          observer.disconnect();
        },
        {
          threshold: 0.18,
        },
      );

      observer.observe(root);

      return () => {
        observer.disconnect();
      };
    },
    {
      scope: section,
    },
  );

  return (
    <section
      ref={section}
      id="preguntas-frecuentes"
      tabIndex={-1}
      className="section-space faq-section"
    >
      <div className="container-main faq-layout">
        <div>
          <span className="eyebrow">05 / LAS COSAS CLARAS</span>

          <h2 className="section-title">
            Antes de tu
            <br />
            primera propuesta.
          </h2>

          <p className="section-copy">
            Respuestas concretas para empezar con confianza.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map(([question, answer], i) => (
            <FaqItem
              key={question}
              question={question}
              answer={answer}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}