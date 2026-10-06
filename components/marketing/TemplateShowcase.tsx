import Image from "next/image";

import { TemplateCatalog } from "@/components/templates/TemplateCatalog";
import { templateCount } from "@/lib/domain/templates";
import { TemplateShowcaseMotion } from "./TemplateShowcaseMotion";

export function TemplateShowcase() {
  return (
    <TemplateShowcaseMotion>
      <section
        id="plantillas"
        tabIndex={-1}
        className="templates-section section-space"
      >
        <div className="container-main">
          <div className="section-heading templates-heading">
            <div>
              <span className="eyebrow">
                03 / ENCUENTRA TU FORMA DE PROPONER
              </span>

              <h2 className="section-title">
                Tu trabajo tiene carácter.
                <br />
                <em>Tu cotización también.</em>
              </h2>

              <p className="section-copy">
                {templateCount()} composiciones para elegir. El mismo cuidado,
                con una personalidad diferente.
              </p>
            </div>

            <div className="templates-mascot-frame">
              <Image
                className="templates-mascot"
                src="/images/mascot/catalog2.png"
                alt="Mapache de Cotiza Smart presentando propuestas de diseño"
                width={420}
                height={280}
                sizes="(max-width: 700px) 120px, (max-width: 1000px) 220px, 340px"
              />
            </div>
          </div>

          <TemplateCatalog />
        </div>
      </section>
    </TemplateShowcaseMotion>
  );
}
