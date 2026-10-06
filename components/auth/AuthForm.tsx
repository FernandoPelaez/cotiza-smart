"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { useAuthForm } from "@/hooks/useAuthForm";
import type { AuthDestination } from "@/lib/domain/navigation";

import { GoogleMark } from "./GoogleMark";

export function AuthForm({
  mode,
  next = "/dashboard",
  configured = true,
  notice = "",
}: {
  mode: "login" | "register" | "forgot" | "reset";
  next?: AuthDestination;
  configured?: boolean;
  demoAvailable?: boolean;
  notice?: string;
}) {
  const {
    loading,
    error,
    success,
    visible,
    setVisible,
    title,
    description,
    submit,
    google,
  } = useAuthForm(mode, next, notice);

  return (
    <div className="auth-form">
      {mode === "login" || mode === "register" ? (
        <h1>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
      ) : (
        <>
          <span className="eyebrow">TU ESPACIO</span>

          <h1>{title}</h1>

          <p className="auth-description">{description}</p>
        </>
      )}

      {!configured && (
        <p className="auth-setup-notice" role="status">
          El acceso a cuentas aún no está habilitado. Vuelve a intentarlo más
          tarde.
        </p>
      )}

      {success ? (
        <div className="auth-success" role="status">
          <CheckCircle2 size={25} />

          <p>{success}</p>

          <Link className="text-link" href="/login">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="auth-fields">
            <div className="space-y-5">
              {mode === "register" && (
                <div className="field">
                  <label htmlFor="name">Tu nombre</label>

                  <input
                    id="name"
                    name="name"
                    placeholder="¿Cómo te llamas?"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={160}
                  />
                </div>
              )}

              {mode !== "reset" && (
                <div className="field">
                  <label htmlFor="email">Correo electrónico</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nombre@tunegocio.com"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </div>
              )}

              {mode !== "forgot" && (
                <div className="field">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password">Contraseña</label>

                    {mode === "login" && (
                      <Link
                        href="/forgot-password"
                        className="text-link text-xs!"
                      >
                        ¿La olvidaste?
                      </Link>
                    )}
                  </div>

                  <div className="password-field">
                    <input
                      id="password"
                      name="password"
                      type={visible ? "text" : "password"}
                      placeholder={
                        mode === "login"
                          ? "Tu contraseña"
                          : "Mínimo 8 caracteres"
                      }
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      required
                      minLength={8}
                      maxLength={128}
                    />

                    <button
                      type="button"
                      aria-label={
                        visible
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              disabled={loading || !configured}
              className="btn btn-primary w-full"
              type="submit"
            >
              {loading && (
                <Loader2
                  size={17}
                  className="loading-indicator"
                />
              )}

              {mode === "login"
                ? "Iniciar sesión"
                : mode === "register"
                  ? "Crear mi cuenta"
                  : mode === "forgot"
                    ? "Enviar enlace"
                    : "Guardar contraseña"}
            </button>
          </form>

          {(mode === "login" || mode === "register") && (
            <>
              <div className="auth-divider">
                <span>o continúa con</span>
              </div>

              <button
                className="btn btn-secondary w-full"
                disabled={loading || !configured}
                onClick={google}
              >
                <GoogleMark />
                Continuar con Google
              </button>
            </>
          )}
        </>
      )}

      {!success && (
        <p className="auth-switch">
          {mode === "login" ? (
            <>
              ¿Aún no tienes cuenta?{" "}
              <Link href={`/register?next=${encodeURIComponent(next)}`}>
                Regístrate gratis
              </Link>
            </>
          ) : mode === "register" ? (
            <>
              ¿Ya tienes cuenta?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`}>
                Inicia sesión
              </Link>
            </>
          ) : (
            <Link href="/login">
              Volver a iniciar sesión
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
