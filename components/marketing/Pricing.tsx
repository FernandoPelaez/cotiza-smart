import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Check,
  Crown,
  Gift,
  Zap,
} from "lucide-react";

import { templateCount } from "@/lib/domain/templates";
import { PLANS } from "@/lib/domain/config";

import { PricingMotion } from "./PricingMotion";

export function Pricing() {
  const availableTemplates =
    templateCount();

  return (
    <PricingMotion>
      <div
        className="pricing-mascot pricing-mascot-left"
        aria-hidden="true"
      >
        <Image
          className="pricing-raccoon"
          src="/images/mascot/plans.png"
          alt=""
          width={1374}
          height={1145}
          sizes="(min-width: 1400px) 480px, 160px"
          draggable={false}
        />
      </div>

      <div
        className="pricing-mascot pricing-mascot-right"
        aria-hidden="true"
      >
        <Image
          className="pricing-raccoon"
          src="/images/mascot/plans.png"
          alt=""
          width={1374}
          height={1145}
          sizes="(min-width: 1400px) 480px, 160px"
          draggable={false}
        />
      </div>

      <div className="container-main pricing-inner">
        <header className="pricing-heading">
          <h2
            id="pricing-title"
            className="pricing-kicker"
          >
            PLANES
          </h2>
        </header>

        <div className="pricing-grid">
          {PLANS.map((plan) => {
            const PlanIcon =
              plan.id === "free"
                ? Gift
                : plan.id === "pro"
                  ? Zap
                  : Crown;

            const features = [
              plan.detail,
              `${availableTemplates} plantillas disponibles`,
              "Tu marca, PDF y enlace público",
              "WhatsApp, respuestas e historial",
            ];

            return (
              <article
                key={plan.id}
                className={`pricing-card${
                  plan.id === "pro"
                    ? " pricing-featured"
                    : ""
                }`}
                aria-labelledby={`pricing-plan-${plan.id}`}
              >
                <div className="pricing-plan-heading">
                  <span
                    className="pricing-plan-icon"
                    aria-hidden="true"
                  >
                    <PlanIcon
                      size={23}
                      strokeWidth={1.8}
                    />
                  </span>

                  <h3
                    id={`pricing-plan-${plan.id}`}
                  >
                    {plan.name}
                  </h3>
                </div>

                <p className="pricing-description">
                  {plan.description}
                </p>

                <div className="pricing-price">
                  ${plan.price}

                  <span>
                    MXN
                    {plan.id !== "free" && (
                      <small> / mes</small>
                    )}
                  </span>
                </div>

                <ul>
                  {features.map(
                    (feature) => (
                      <li key={feature}>
                        <span
                          className="pricing-check"
                          aria-hidden="true"
                        >
                          <Check
                            size={14}
                            strokeWidth={2.2}
                          />
                        </span>

                        <span className="pricing-feature-text">
                          {feature}
                        </span>
                      </li>
                    ),
                  )}
                </ul>

                <Link
                  href={
                    plan.id === "free"
                      ? "/register"
                      : "/register?next=/dashboard/planes"
                  }
                  className="btn btn-primary pricing-cta"
                >
                  {plan.id === "free"
                    ? "Comenzar gratis"
                    : `Elegir ${plan.name}`}

                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </article>
            );
          })}
        </div>

        <p className="pricing-note">
          Tus cotizaciones siguen siendo
          tuyas. Alcanzar el límite Free no
          elimina tu información.
        </p>
      </div>
    </PricingMotion>
  );
}
