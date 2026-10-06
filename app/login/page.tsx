import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";
import { entryDestination } from "@/lib/domain/navigation";
export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string;
    template?: string;
    next?: string;
    error?: string;
  }>;
}) {
  const query = await searchParams;
  const next = entryDestination(query);
  return (
    <AuthPage
      mode="login"
      next={next}
      notice={
        query.error === "auth_callback"
          ? "El enlace de acceso no se pudo verificar. Inicia sesión o solicita uno nuevo."
          : undefined
      }
    />
  );
}
