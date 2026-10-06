import Image from "next/image";
import {
  BadgeCheck,
  Clock3,
  FolderKanban,
  ListChecks,
} from "lucide-react";
import { BenefitsMotion } from "./BenefitsMotion";

const benefits = [
  {
    icon: Clock3,
    title: "Cotiza en menos tiempo.",
    text: "Deja de empezar cada propuesta desde cero. Organiza conceptos, precios, IVA y datos del cliente en un flujo pensado para crear cotizaciones con menos pasos.",
  },
  {
    icon: BadgeCheck,
    title: "Proyecta una imagen más profesional.",
    text: "Cada propuesta se siente cuidada y lista para presentar. Elige entre distintos diseños y entrega documentos que transmiten más confianza desde el primer vistazo.",
  },
  {
    icon: ListChecks,
    title: "Ten el control de cada oportunidad.",
    text: "Sabe qué pasó con cada cotización sin depender de tu memoria. Consulta su estado, historial y respuesta para identificar cuáles siguen pendientes y cuáles ya avanzaron.",
  },
  {
    icon: FolderKanban,
    title: "Mantén tu trabajo organizado.",
    text: "Cotizaciones, clientes y documentos permanecen en un mismo espacio. Encuentra lo que necesitas más rápido y evita perder información entre archivos, mensajes y versiones.",
  },
];

export function Benefits() {
  return (
    <BenefitsMotion>
      <section
        id="beneficios"
        tabIndex={-1}
        className="benefits-section section-space"
        aria-labelledby="benefits-title"
      >
        <div className="container-main benefits-layout">
          <div className="benefits-intro">
            <span className="eyebrow benefits-eyebrow">
              01 / MENOS VUELTAS. MÁS CLARIDAD.
            </span>

            <h2 id="benefits-title" className="section-title">
              <span className="benefits-title-line">
                <span>Tú haces el trabajo.</span>
              </span>

              <span className="benefits-title-line">
                <em>Nosotros, el orden.</em>
              </span>
            </h2>

            <p className="section-copy">
              Menos tiempo armando cotizaciones. Más claridad para trabajar y
              mantener cada oportunidad bajo control.
            </p>

            <div className="benefits-scene">
              <Image
                src="/images/mascot/benefits.png"
                alt="Mascota de Cotiza Smart compartiendo una cotización con un cliente"
                width={2048}
                height={2048}
                sizes="(max-width: 760px) 92vw, 45vw"
              />
            </div>
          </div>

          <div className="benefits-list">
            <span
              className="benefits-list-line"
              aria-hidden="true"
            />

            {benefits.map(({ icon: Icon, title, text }, index) => (
              <article className="benefit-item" key={title}>
                <span className="benefit-number">
                  0{index + 1}
                </span>

                <div>
                  <Icon size={26} strokeWidth={1.5} />

                  <h3>{title}</h3>

                  <p>{text}</p>
                </div>

                <span
                  className="benefit-separator"
                  aria-hidden="true"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    </BenefitsMotion>
  );
}
