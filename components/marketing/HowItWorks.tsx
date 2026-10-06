"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { WORKFLOW_STEPS } from "@/lib/domain/marketing";
import { HowItWorksMotion } from "./HowItWorksMotion";
import { WorkflowPreview } from "./WorkflowPreview";

export function HowItWorks({
  demoAvailable = true,
}: {
  demoAvailable?: boolean;
}) {
  const [step, setStep] = useState(0);
  const current = WORKFLOW_STEPS[step];

  const demoDisabled =
    !demoAvailable && current.href.startsWith("/demo");

  return (
    <HowItWorksMotion step={step}>
      <section
        id="como-funciona"
        tabIndex={-1}
        className="section-space workflow-section"
      >
        <div className="container-main">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                02 / DE LA IDEA A LA RESPUESTA
              </span>

              <h2 className="section-title">
                Así de claro. Paso a paso.
              </h2>
            </div>

            <p className="section-copy">
              Conoce el recorrido de tu próxima cotización.
            </p>
          </div>

          <Tabs
            value={String(step)}
            onValueChange={(value) =>
              setStep(Number(value))
            }
          >
            <TabsList
              variant="line"
              className="workflow-tabs"
              aria-label="Pasos del producto"
            >
              {WORKFLOW_STEPS.map((item, index) => (
                <TabsTrigger
                  key={item.label}
                  value={String(index)}
                  aria-controls="workflow-content"
                >
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <label className="workflow-compact">
              Paso {step + 1} de {WORKFLOW_STEPS.length}

              <select
                value={step}
                onChange={(event) =>
                  setStep(Number(event.target.value))
                }
                aria-label="Paso del recorrido"
              >
                {WORKFLOW_STEPS.map((item, index) => (
                  <option
                    key={item.label}
                    value={index}
                  >
                    {index + 1}. {item.label}
                  </option>
                ))}
              </select>
            </label>

            <TabsContent
              value={String(step)}
              id="workflow-content"
              className="workflow-body"
              aria-label={`Paso ${step + 1}: ${current.label}`}
            >
              <div className="workflow-copy">
                <span className="workflow-number">
                  {String(step + 1).padStart(2, "0")}
                  <small> / 07</small>
                </span>

                <h3>{current.title}</h3>

                <p>{current.text}</p>

                <Link
                  href={
                    demoDisabled
                      ? "/register"
                      : current.href
                  }
                  className="text-link"
                >
                  {demoDisabled
                    ? "Comenzar gratis"
                    : current.action}{" "}

                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="workflow-preview">
                <WorkflowPreview
                  step={step}
                  demoAvailable={demoAvailable}
                />
              </div>
            </TabsContent>

            <div className="workflow-controls">
              <div
                className="workflow-progress"
                role="progressbar"
                aria-label="Recorrido del producto"
                aria-valuemin={1}
                aria-valuemax={WORKFLOW_STEPS.length}
                aria-valuenow={step + 1}
              >
                <span />
              </div>

              <button
                className="icon-btn"
                aria-label="Paso anterior"
                disabled={step === 0}
                onClick={() =>
                  setStep((currentStep) =>
                    Math.max(currentStep - 1, 0),
                  )
                }
              >
                <ChevronLeft size={16} />
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setStep(
                    (currentStep) =>
                      (currentStep + 1) %
                      WORKFLOW_STEPS.length,
                  )
                }
              >
                {step === WORKFLOW_STEPS.length - 1
                  ? "Volver al inicio"
                  : "Siguiente paso"}

                <ArrowRight size={16} />
              </button>
            </div>
          </Tabs>
        </div>
      </section>
    </HowItWorksMotion>
  );
}