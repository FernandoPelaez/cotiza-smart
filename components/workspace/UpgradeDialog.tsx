"use client";
import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useWorkspace } from "./WorkspaceProvider";
export function UpgradeDialog() {
  const { limitOpen, setLimitOpen, base } = useWorkspace();
  return (
    <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
      <DialogContent className="upgrade-dialog">
        <DialogHeader>
          <span className="upgrade-icon">
            <Sparkles size={24} />
          </span>
          <DialogTitle className="text-2xl! tracking-tight leading-tight! mt-3">
            Ya utilizaste tus 3 cotizaciones gratuitas.
          </DialogTitle>
          <DialogDescription className="leading-7! mt-2!">
            Tus cotizaciones y datos siguen disponibles. Elige un plan para
            continuar creando.
          </DialogDescription>
        </DialogHeader>
        <div className="upgrade-options">
          {[
            { name: "Pro", price: 99, detail: "Plantillas Free + Pro" },
            { name: "Premium", price: 199, detail: "Todas las plantillas" },
          ].map((plan) => (
            <div key={plan.name} className="upgrade-option">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-2xl font-semibold mt-4">
                ${plan.price}
                <span className="text-xs text-muted-foreground ml-1">
                  MXN / mes
                </span>
              </p>
              <p className="text-sm flex items-center gap-2 mt-4 text-muted-foreground">
                <Check size={15} />
                {plan.detail}
              </p>
              <Link
                href={`${base}/planes`}
                onClick={() => setLimitOpen(false)}
                className="btn btn-primary btn-sm w-full mt-5"
              >
                Ver {plan.name}
              </Link>
            </div>
          ))}
        </div>
        <button
          onClick={() => setLimitOpen(false)}
          className="btn btn-ghost text-sm!"
        >
          Seguir viendo mis cotizaciones
        </button>
      </DialogContent>
    </Dialog>
  );
}
