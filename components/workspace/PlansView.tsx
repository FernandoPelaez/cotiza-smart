"use client";
import { useState } from "react";
import {
  Check,
  Sparkles,
  Loader2,
  CreditCard,
  FlaskConical,
} from "lucide-react";
import { toast } from "@/lib/services/feedback";
import { z } from "zod";
import { PLANS, FREE_CREATION_LIMIT } from "@/lib/domain/config";
import { effectivePlan, dateLabel } from "@/lib/domain/quotes";
import { apiRequest } from "@/lib/services/client-api";
import type { Plan } from "@/types/domain";
import { useWorkspace } from "./WorkspaceProvider";
export function PlansView() {
  const { workspace, setDemoPlan } = useWorkspace();
  const current = effectivePlan(workspace.subscription);
  const [loading, setLoading] = useState<string | null>(null);
  async function choose(plan: Plan) {
    if (plan === "free") return;
    setLoading(plan);
    try {
      if (workspace.mode === "demo") {
        setDemoPlan(plan);
        toast.success(
          `Vista de ${plan === "pro" ? "Pro" : "Premium"} activada en la demo. No se realizó ningún pago.`,
        );
      } else {
        const result = await apiRequest(
          "/api/billing/checkout",
          z.object({ url: z.string().url() }),
          { plan },
        );
        window.location.assign(result.url);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos abrir el pago.");
    } finally {
      setLoading(null);
    }
  }
  async function portal() {
    setLoading("portal");
    try {
      const result = await apiRequest(
        "/api/billing/portal",
        z.object({ url: z.string().url() }),
        {},
      );
      window.location.assign(result.url);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No pudimos abrir la suscripción.",
      );
    } finally {
      setLoading(null);
    }
  }
  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">CRECE A TU RITMO</span>
          <h1>Más posibilidades para tu negocio.</h1>
          <p>Elige la presentación que acompaña a tu siguiente etapa.</p>
        </div>
      </div>
      <div className="subscription-overview">
        <div>
          <span className={`plan-tag plan-${current}`}>
            {current === "free"
              ? "Free"
              : current === "pro"
                ? "Pro"
                : "Premium"}
          </span>
          <strong>Tu plan actual</strong>
          <p>
            {current === "free"
              ? `${Math.min(workspace.creations_used, FREE_CREATION_LIMIT)} de ${FREE_CREATION_LIMIT} cotizaciones gratuitas utilizadas`
              : `Acceso hasta el ${workspace.subscription.current_period_end ? dateLabel(workspace.subscription.current_period_end) : "final del periodo"}${workspace.subscription.cancel_at_period_end ? " · cancelación programada" : ""}`}
          </p>
        </div>
        {workspace.subscription.plan !== "free" &&
          workspace.mode === "live" && (
            <button
              disabled={Boolean(loading)}
              onClick={portal}
              className="btn btn-secondary btn-sm"
            >
              <CreditCard size={15} />
              Gestionar suscripción
            </button>
          )}
        {workspace.mode === "demo" && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setDemoPlan("free");
              toast.info(
                "Plan Free de demostración activado. Puedes probar el límite de creaciones.",
              );
            }}
          >
            <FlaskConical size={15} />
            Probar límite Free
          </button>
        )}
      </div>
      {workspace.mode === "live" &&
        ["past_due", "unpaid", "paused", "incomplete"].includes(
          workspace.subscription.status,
        ) && (
          <p className="form-error" role="status">
            Tu suscripción necesita atención. Gestiona el pago desde Stripe para
            recuperar el acceso a tu plan.
          </p>
        )}
      <div className="app-pricing-grid">
        {PLANS.map((plan) => (
          <section
            className={`app-pricing-plan ${plan.id === "pro" ? "app-plan-featured" : ""}`}
            key={plan.id}
          >
            <div className="flex items-center justify-between">
              <h2>{plan.name}</h2>
              {plan.id === "premium" && <Sparkles size={20} />}
            </div>
            <p>{plan.description}</p>
            <div className="app-plan-price">
              <strong>${plan.price}</strong>
              <span>MXN{plan.price > 0 ? " / mes" : ""}</span>
            </div>
            <ul>
              <li>
                <Check size={16} />
                {plan.detail}
              </li>
              <li>
                <Check size={16} />
                {plan.templates}
              </li>
              <li>
                <Check size={16} />
                Personalización de marca
              </li>
              <li>
                <Check size={16} />
                WhatsApp y enlaces públicos
              </li>
              <li>
                <Check size={16} />
                Respuestas e historial
              </li>
              <li>
                <Check size={16} />
                PDF de cada propuesta
              </li>
            </ul>
            <button
              className={`btn ${plan.id === "pro" ? "btn-primary" : "btn-secondary"} w-full`}
              disabled={
                current === plan.id || plan.id === "free" || Boolean(loading)
              }
              onClick={() => choose(plan.id)}
            >
              {loading === plan.id ? (
                <Loader2 size={17} className="loading-indicator" />
              ) : current === plan.id ? (
                <Check size={16} />
              ) : null}
              {current === plan.id
                ? "Tu plan actual"
                : plan.id === "free"
                  ? "Plan gratuito"
                  : workspace.mode === "demo"
                    ? `Explorar ${plan.name}`
                    : `Elegir ${plan.name}`}
            </button>
          </section>
        ))}
      </div>
      <p className="app-plans-note">
        Por ahora todas las categorías de plantillas están disponibles en todos
        los planes. Pro y Premium conservan sus precios y acceso durante la
        suscripción activa.
      </p>
      {workspace.mode === "demo" && (
        <p className="demo-plan-note">
          Los cambios de plan son una simulación local. No se abre Stripe ni se
          realizan cargos.
        </p>
      )}
    </>
  );
}
