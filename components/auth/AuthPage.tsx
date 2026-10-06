import Link from "next/link";
import { Brand } from "@/components/shared/Brand";
import { ViewMotion } from "@/components/shared/Motion";
import type { AuthDestination } from "@/lib/domain/navigation";
import { demoEnabled, supabaseConfigured } from "@/lib/supabase/config";
import { AuthForm } from "./AuthForm";
import "./auth.css";

export function AuthPage({
  mode,
  next,
  notice,
}: {
  mode: "login" | "register" | "forgot" | "reset";
  next?: AuthDestination;
  notice?: string;
}) {
  return (
    <main className="auth-page">
      <header className="auth-brand">
        <Brand />

        <Link href="/" className="auth-back">
          Volver al inicio
        </Link>
      </header>

      <section className="auth-center">
        <ViewMotion id={mode} variant="auth">
          <AuthForm
            mode={mode}
            next={next}
            notice={notice}
            configured={supabaseConfigured()}
            demoAvailable={demoEnabled()}
          />
        </ViewMotion>
      </section>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} Cotiza Smart</span>
      </footer>
    </main>
  );
}