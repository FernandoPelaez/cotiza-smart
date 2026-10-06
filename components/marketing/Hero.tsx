import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Play } from "lucide-react";
import { HeroMotion } from "./HeroMotion";
import { templateCount } from "@/lib/domain/templates";

const rotatingWords = [
  {
    text: "destaque.",
    color: "#087d75",
  },
  {
    text: "convenza.",
    color: "#0b6f9f",
  },
  {
    text: "venda.",
    color: "#167b62",
  },
] as const;

export function Hero({
  demoAvailable = true,
}: {
  demoAvailable?: boolean;
}) {
  return (
    <HeroMotion rotatingWords={rotatingWords}>
      <section
        id="hero"
        tabIndex={-1}
        className="hero-section"
        aria-labelledby="hero-title"
      >
        <div className="hero-art">
          <Image
            src="/images/mascot/hero.png"
            alt="Mapache de Cotiza Smart preparando una cotización profesional"
            fill
            sizes="100vw"
            priority
          />
        </div>

        <div className="hero-wash" />

        <div className="container-main hero-content">
          <p className="eyebrow hero-intro">
            COTIZA CON TU MARCA. VENDE CON MÁS CLARIDAD.
          </p>

          <h1 id="hero-title">
            <span className="hero-line">
              <span>Haz que tu</span>
            </span>

            <span className="hero-line">
              <span>propuesta</span>
            </span>

            <span className="hero-line hero-dynamic-line">
              <span>
                <span className="hero-dynamic-word">
                  {rotatingWords[0].text}
                </span>

                <span
                  className="hero-typewriter-cursor"
                  aria-hidden="true"
                />
              </span>
            </span>
          </h1>

          <p className="hero-intro">
            Crea cotizaciones profesionales con tu marca, compártelas por
            WhatsApp y sigue cada respuesta de tus clientes desde un solo lugar.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="hero-primary-cta">
              <span>Crear mi primera cotización</span>

              <span className="hero-primary-icon" aria-hidden="true">
                <ArrowUpRight size={18} strokeWidth={2.2} />
              </span>
            </Link>

            {demoAvailable && (
              <Link href="/demo" className="hero-secondary">
                <span aria-hidden="true">
                  <Play size={14} fill="currentColor" />
                </span>

                Ver demo
              </Link>
            )}
          </div>

          <div className="hero-facts">
            <span>
              <Check size={14} />
              3 cotizaciones gratis
            </span>

            <span>{templateCount()} diseños para explorar</span>
          </div>
        </div>
      </section>
    </HeroMotion>
  );
}
