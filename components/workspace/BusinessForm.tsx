"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Upload,
  Building2,
  Loader2,
  Check,
  Package,
  Wrench,
  Layers,
  LockKeyhole,
  Pencil,
  X,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ViewMotion } from "@/components/shared/Motion";
import { useBusinessForm } from "@/hooks/useBusinessForm";

export function BusinessForm({
  onboarding = false,
  onComplete,
}: {
  onboarding?: boolean;
  onComplete?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(onboarding);

  const handleComplete = () => {
    if (!onboarding) setIsEditing(false);
    onComplete?.();
  };

  const {
    value,
    step,
    setStep,
    loading,
    error,
    upload,
    field,
    fileChanged,
    submit,
    reset,
  } = useBusinessForm(onboarding, handleComplete);

  function handleEdit() {
    setStep(1);
    setIsEditing(true);
  }

  function handleCancel() {
    reset();
    setIsEditing(false);
  }

  return (
    <form onSubmit={submit} className="business-form">
      <div className="business-form-progress">
        <span>PASO {step} DE 2</span>
        <span>{step === 1 ? "Tu identidad" : "Datos de contacto"}</span>
      </div>

      <Progress value={step * 50} className="h-1 mb-7" />

      <ViewMotion id={`business-step-${step}`}>
        {step === 1 ? (
          <>
            <div className="logo-upload">
              <button
                type="button"
                className="logo-upload-trigger"
                aria-label="Logotipo del negocio"
                disabled={!isEditing || loading}
                onClick={() => upload.current?.click()}
              >
                {value.logo_url ? (
                  <Image
                    src={value.logo_url}
                    width={72}
                    height={72}
                    alt="Logotipo del negocio"
                    unoptimized
                  />
                ) : (
                  <Building2 size={25} strokeWidth={1.4} />
                )}
              </button>

              <div>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="text-link flex gap-2 items-center"
                      disabled={loading}
                      onClick={() => upload.current?.click()}
                    >
                      <Upload size={14} />
                      {value.logo_url ? "Cambiar logotipo" : "Añadir tu logotipo"}
                    </button>

                    <span>PNG, JPG o WebP · hasta 2 MB</span>

                    {value.logo_url && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground mt-2"
                        disabled={loading}
                        onClick={() => field("logo_url", "")}
                      >
                        Quitar logo
                      </button>
                    )}
                  </>
                ) : (
                  <span>Logotipo de tu negocio</span>
                )}
              </div>

              <input
                ref={upload}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={!isEditing || loading}
                onChange={(e) => void fileChanged(e.target.files?.[0])}
              />
            </div>

            <div className="field">
              <label htmlFor="business-name">Nombre de tu negocio</label>
              <input
                id="business-name"
                required
                minLength={2}
                maxLength={160}
                placeholder="El nombre que aparecerá en tus cotizaciones"
                value={value.name}
                disabled={!isEditing || loading}
                onChange={(e) => field("name", e.target.value)}
              />
            </div>

            <div className="activity-picker">
              <label>¿Qué ofreces?</label>
              <RadioGroup
                value={value.activity}
                disabled={!isEditing || loading}
                onValueChange={(v) => {
                  if (v === "products" || v === "services" || v === "both") {
                    field("activity", v);
                  }
                }}
                className="activity-options"
              >
                {[
                  { id: "products", label: "Productos", icon: Package },
                  { id: "services", label: "Servicios", icon: Wrench },
                  { id: "both", label: "Ambos", icon: Layers },
                ].map((option) => (
                  <label
                    htmlFor={`activity-${option.id}`}
                    key={option.id}
                    className={value.activity === option.id ? "selected" : ""}
                  >
                    <option.icon size={21} strokeWidth={1.5} />
                    <span>{option.label}</span>
                    <RadioGroupItem
                      id={`activity-${option.id}`}
                      value={option.id}
                      className="sr-only"
                    />
                  </label>
                ))}
              </RadioGroup>
            </div>
          </>
        ) : (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="business-email">Correo de contacto</label>
              <input
                id="business-email"
                type="email"
                value={value.email}
                disabled={!isEditing || loading}
                onChange={(e) => field("email", e.target.value)}
                placeholder="hola@tunegocio.com"
              />
            </div>

            <div className="field">
              <label htmlFor="business-phone">Teléfono</label>
              <input
                id="business-phone"
                type="tel"
                value={value.phone}
                disabled={!isEditing || loading}
                onChange={(e) => field("phone", e.target.value)}
                placeholder="Con código de país"
                maxLength={30}
              />
            </div>

            <div className="field full-width">
              <label htmlFor="business-address">
                Dirección <span className="muted font-normal">(opcional)</span>
              </label>
              <input
                id="business-address"
                value={value.address}
                disabled={!isEditing || loading}
                onChange={(e) => field("address", e.target.value)}
                placeholder="Ciudad, estado o dirección comercial"
                maxLength={400}
              />
            </div>

            <div className="field">
              <label htmlFor="business-site">
                Sitio web <span className="muted font-normal">(opcional)</span>
              </label>
              <input
                id="business-site"
                type="url"
                value={value.website}
                disabled={!isEditing || loading}
                onChange={(e) => field("website", e.target.value)}
                placeholder="https://"
                maxLength={300}
              />
            </div>

            <div className="field">
              <label htmlFor="business-rfc">
                RFC <span className="muted font-normal">(opcional)</span>
              </label>
              <input
                id="business-rfc"
                value={value.rfc}
                disabled={!isEditing || loading}
                onChange={(e) => field("rfc", e.target.value.toUpperCase())}
                maxLength={20}
                placeholder="RFC de tu negocio"
              />
            </div>
          </div>
        )}
      </ViewMotion>

      {error && (
        <p className="form-error mt-5" role="alert">
          {error}
        </p>
      )}

      <p className="security-note">
        <LockKeyhole size={12} />
        Solo tu cuenta puede editar este negocio. Tus datos de contacto y tu
        logo serán visibles en las cotizaciones que compartas.
      </p>

      <div className="business-form-actions">
        {isEditing && step === 2 && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={loading}
            onClick={() => setStep(1)}
          >
            Anterior
          </button>
        )}

        {!isEditing && !onboarding ? (
          <>
            {step === 1 && (
              <button
                type="button"
                className="btn btn-ghost ml-auto"
                onClick={() => setStep(2)}
              >
                Ver datos de contacto
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep(1)}
              >
                Anterior
              </button>
            )}

            <button
              type="button"
              className={
                step === 1 ? "btn btn-primary" : "btn btn-primary ml-auto"
              }
              onClick={handleEdit}
            >
              <Pencil size={16} />
              Editar negocio
            </button>
          </>
        ) : (
          <>
            {!onboarding && (
              <button
                type="button"
                className="btn btn-ghost business-cancel-button"
                disabled={loading}
                onClick={handleCancel}
              >
                <X size={16} />
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary ml-auto"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="loading-indicator" />
              ) : step === 2 ? (
                <Check size={16} />
              ) : null}

              {step === 1
                ? "Continuar"
                : onboarding
                  ? "Preparar mi espacio"
                  : "Guardar cambios"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

