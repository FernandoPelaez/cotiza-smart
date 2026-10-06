"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BusinessForm } from "./BusinessForm";
import { useWorkspace } from "./WorkspaceProvider";
export function Onboarding() {
  const { workspace } = useWorkspace();
  return (
    <Dialog open={!workspace.business}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="onboarding-dialog"
      >
        <DialogHeader>
          <span className="eyebrow">HAGÁMOSLO TUYO</span>
          <DialogTitle className="text-2xl! tracking-tight leading-tight! mt-2">
            Primero, tu negocio.
          </DialogTitle>
          <DialogDescription className="leading-6!">
            Estos datos aparecerán en tus cotizaciones. Puedes actualizarlos
            cuando quieras.
          </DialogDescription>
        </DialogHeader>
        <BusinessForm onboarding />
      </DialogContent>
    </Dialog>
  );
}
