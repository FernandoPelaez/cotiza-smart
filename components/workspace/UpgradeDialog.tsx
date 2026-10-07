"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useWorkspace } from "./WorkspaceProvider";

export function UpgradeDialog() {
  const { limitOpen, setLimitOpen, base } = useWorkspace();

  return (
    <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
      <DialogContent className="upgrade-dialog">
        <DialogHeader className="upgrade-header">
          <span className="upgrade-icon">
            <Sparkles size={22} />
          </span>

          <DialogTitle>
            Ya utilizaste tus 3 cotizaciones gratuitas.
          </DialogTitle>

          <DialogDescription>
            Tus cotizaciones y datos siguen disponibles. Elige un plan para
            continuar creando.
          </DialogDescription>
        </DialogHeader>

        <div className="upgrade-options">
          {[
            {
              name: "Pro",
              price: 99,
              detail: "Plantillas Free + Pro",
            },
            {
              name: "Premium",
              price: 199,
              detail: "Todas las plantillas",
            },
          ].map((plan) => (
            <div key={plan.name} className="upgrade-option">
              <h3>{plan.name}</h3>

              <div className="upgrade-price">
                <span className="upgrade-price-value">${plan.price}</span>

                <span className="upgrade-price-period">
                  MXN / mes
                </span>
              </div>

              <div className="upgrade-benefit">
                <span className="upgrade-benefit-icon">
                  <Check size={13} />
                </span>

                <span>{plan.detail}</span>
              </div>

              <Link
                href={`${base}/planes`}
                onClick={() => setLimitOpen(false)}
                className="btn btn-primary btn-sm upgrade-plan-button"
              >
                Ver {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="upgrade-footer">
          <button
            type="button"
            onClick={() => setLimitOpen(false)}
            className="upgrade-secondary-action"
          >
            Seguir viendo mis cotizaciones
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}