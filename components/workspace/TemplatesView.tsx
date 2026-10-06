"use client";
import { useRouter } from "next/navigation";
import { TemplateCatalog } from "@/components/templates/TemplateCatalog";
import { templateCount } from "@/lib/domain/templates";
import { canCreate } from "@/lib/domain/quotes";
import { useWorkspace } from "./WorkspaceProvider";
export function TemplatesView() {
  const { workspace, base, setLimitOpen } = useWorkspace();
  const router = useRouter();
  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">ENCUENTRA TU FORMA DE PROPONER</span>
          <h1>Tu estilo, en una plantilla.</h1>
          <p>
            {templateCount()} diseños · {templateCount("free")} Free ·{" "}
            {templateCount("pro")} Pro · {templateCount("premium")} Premium
          </p>
        </div>
      </div>
      <TemplateCatalog
        business={workspace.business ?? undefined}
        onChoose={(template) => {
          if (!canCreate(workspace.subscription, workspace.creations_used)) {
            setLimitOpen(true);
            return;
          }
          router.push(`${base}/nueva?template=${template.id}`);
        }}
      />
    </>
  );
}
