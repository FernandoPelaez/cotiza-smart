"use client";

import { useRef } from "react";
import Link from "next/link";

import { Brand } from "@/components/shared/Brand";
import { gsap, reducedMotion, useGSAP } from "@/lib/motion/gsap";

export function MarketingFooter() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = section.current;

      if (!root || reducedMotion()) return;
      const eyebrow =
        root.querySelector<HTMLElement>(".closing-cta-eyebrow");
      const title =
        root.querySelector<HTMLElement>("#closing-footer-title");
      const description =
        root.querySelector<HTMLElement>(".closing-cta-description");
      const brand =
        root.querySelector<HTMLElement>(".footer-brand");
      const navGroups = gsap.utils.toArray<HTMLElement>(
        ".footer-nav-group",
        root,
      );

      const bottom =
        root.querySelector<HTMLElement>(".footer-bottom");
      const intro = [eyebrow, title, description].filter(
        (element): element is HTMLElement => Boolean(element),
      );

      const footerContent = [brand, bottom].filter(
        (element): element is HTMLElement => Boolean(element),
      );

      gsap.set(intro, {
        autoAlpha: 0,
        y: 22,
      });

      gsap.set(brand, {
        autoAlpha: 0,
        y: 18,
      });

      gsap.set(navGroups, {
        autoAlpha: 0,
        y: 18,
      });

      gsap.set(bottom, {
        autoAlpha: 0,
        y: 12,
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
            stagger: 0.09,
          })
          .to(
            brand,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
            },
            "-=0.25",
          )
          .to(
            navGroups,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
            },
            "-=0.4",
          )
          .to(
            bottom,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
            },
            "-=0.25",
          );
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.disconnect();
        },
        {
          threshold: 0.16,
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
      id="contacto"
      className="closing-footer-section"
      aria-labelledby="closing-footer-title"
    >
      <div className="closing-cta">
        <div className="container-main closing-cta-inner">
          <div className="closing-cta-copy">
            <p className="closing-cta-eyebrow">
              Tu negocio, bien presentado
            </p>

            <h2 id="closing-footer-title">
              Convierte cada cotización
              <em>en una mejor presentación.</em>
            </h2>

            <p className="closing-cta-description">
              Presenta tus servicios con claridad, mantén cada propuesta
              organizada y ofrece a tus clientes una experiencia más
              profesional de principio a fin.
            </p>
          </div>
        </div>
      </div>

      <footer className="marketing-footer">
        <div className="container-main footer-main">
          <div className="footer-brand">
            <Brand />

            <p>
              Todo lo que necesitas para crear, organizar y presentar
              cotizaciones que representen mejor a tu negocio.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <div className="footer-nav-group">
              <h3>Producto</h3>

              <ul>
                <li>
                  <a href="#plantillas">Plantillas</a>
                </li>
                <li>
                  <a href="#planes">Planes</a>
                </li>
                <li>
                  <a href="#preguntas-frecuentes">
                    Preguntas frecuentes
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-nav-group">
              <h3>Cuenta</h3>

              <ul>
                <li>
                  <Link href="/login">Iniciar sesión</Link>
                </li>
                <li>
                  <Link href="/register">Crear cuenta</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="container-main footer-bottom">
          <p>
            © {new Date().getFullYear()} Cotiza Smart. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </section>
  );
}