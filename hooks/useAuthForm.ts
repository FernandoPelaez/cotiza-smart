"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { browserSupabase } from "@/lib/supabase/browser";
import type { AuthDestination } from "@/lib/domain/navigation";
export function useAuthForm(
  mode: "login" | "register" | "forgot" | "reset",
  next: AuthDestination,
  notice: string,
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState(notice);
  const [success, setSuccess] = useState("");
  const [visible, setVisible] = useState(false);
  const title = {
    login: "Qué bueno verte de nuevo.",
    register: "Tu próxima propuesta empieza aquí.",
    forgot: "Recupera tu acceso.",
    reset: "Una nueva contraseña.",
  }[mode];
  const description = {
    login: "Inicia sesión y vuelve a tus cotizaciones.",
    register: "Crea tu cuenta. Dale un nuevo comienzo a tus cotizaciones.",
    forgot: "Te enviaremos un enlace para cambiar tu contraseña.",
    reset: "Elige una contraseña segura para tu cuenta.",
  }[mode];
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");
    try {
      const client = browserSupabase();
      if (mode === "register") {
        const { data, error: e } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(values.get("name")) },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (e) throw e;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else
          setSuccess("Revisa tu correo y confirma tu cuenta para continuar.");
      } else if (mode === "login") {
        const { error: e } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (e) throw e;
        router.push(next);
        router.refresh();
      } else if (mode === "forgot") {
        const { error: e } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (e) throw e;
        setSuccess(
          "Si ese correo está registrado, recibirás un enlace de recuperación.",
        );
      } else {
        const { error: e } = await client.auth.updateUser({ password });
        if (e) throw e;
        router.push(next);
        router.refresh();
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "No pudimos completar la solicitud.";
      setError(
        message.includes("Invalid login credentials")
          ? "El correo o la contraseña no coinciden."
          : message.includes("already registered")
            ? "Este correo ya tiene una cuenta. Inicia sesión."
            : message,
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }
  async function google() {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    try {
      const { error: e } = await browserSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (e) throw e;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo iniciar sesión con Google.",
      );
      submitting.current = false;
      setLoading(false);
    }
  }
  return {
    loading,
    error,
    success,
    visible,
    setVisible,
    title,
    description,
    submit,
    google,
  };
}
