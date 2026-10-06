"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  LogOut,
  UserRound,
  Settings2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { useWorkspace } from "./WorkspaceProvider";
import { NotificationCenter } from "./NotificationCenter";
import { effectivePlan, canCreate } from "@/lib/domain/quotes";
import { browserSupabase } from "@/lib/supabase/browser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "@/lib/services/feedback";
export const WORKSPACE_NAV = [
  { href: "", label: "Inicio" },
  { href: "/cotizaciones", label: "Cotizaciones" },
  { href: "/plantillas", label: "Plantillas" },
  { href: "/historial", label: "Historial" },
  { href: "/planes", label: "Planes" },
  { href: "/configuracion", label: "Configuración" },
];
export function WorkspaceHeader({ section }: { section: string }) {
  const { workspace, base, resetDemo, demoOnboarding, setLimitOpen } =
    useWorkspace();
  const router = useRouter();
  const plan = effectivePlan(workspace.subscription);
  const create = () => {
    if (!canCreate(workspace.subscription, workspace.creations_used))
      setLimitOpen(true);
    else router.push(`${base}/nueva`);
  };
  async function logout() {
    try {
      if (workspace.mode === "live") {
        const { error } = await browserSupabase().auth.signOut();
        if (error) throw error;
      }
      router.push("/");
      router.refresh();
    } catch {
      toast.error("No pudimos cerrar la sesión. Intenta de nuevo.");
    }
  }
  return (
    <header className="workspace-header">
      <div className="container-main workspace-top">
        <Brand href={base} />
        <div className="workspace-context">
          <span className="workspace-divider" />
          <span className="business-name" title={workspace.business?.name}>
            {workspace.business?.name ?? "Tu negocio"}
          </span>
          <span className={`plan-tag plan-${plan}`}>
            {plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Premium"}
          </span>
        </div>
        <div className="workspace-header-actions">
          <button
            className="btn btn-primary btn-sm"
            aria-label={
              canCreate(workspace.subscription, workspace.creations_used)
                ? "Nueva cotización"
                : "Límite Free alcanzado. Ver planes"
            }
            onClick={create}
          >
            <Plus size={16} />
            <span>
              {canCreate(workspace.subscription, workspace.creations_used)
                ? "Nueva cotización"
                : "Ampliar mi plan"}
            </span>
          </button>
          <NotificationCenter />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="profile-trigger"
                aria-label="Abrir menú de la cuenta"
              >
                <span>{workspace.user.name.slice(0, 2).toUpperCase()}</span>
                <ChevronDown size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              <div className="px-3 py-3">
                <p className="text-sm font-semibold">{workspace.user.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {workspace.user.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${base}/configuracion`}>
                  <UserRound size={15} />
                  Mi perfil y negocio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${base}/planes`}>
                  <Settings2 size={15} />
                  Mi suscripción
                </Link>
              </DropdownMenuItem>
              {workspace.mode === "demo" && (
                <DropdownMenuItem
                  onClick={() => {
                    resetDemo();
                    toast.success("Demostración reiniciada.");
                    router.push(base);
                  }}
                >
                  <RotateCcw size={15} />
                  Reiniciar demostración
                </DropdownMenuItem>
              )}
              {workspace.mode === "demo" && (
                <DropdownMenuItem onClick={demoOnboarding}>
                  <Settings2 size={15} />
                  Probar configuración inicial
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut size={15} />
                {workspace.mode === "demo"
                  ? "Salir de la demo"
                  : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="icon-btn workspace-mobile-menu"
                aria-label="Abrir navegación"
              >
                <Menu size={19} />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="mt-7 px-6">Tu espacio</SheetTitle>
              <SheetDescription className="px-6">
                {workspace.business?.name ?? "Cotiza Smart"}
              </SheetDescription>
              <nav
                className="flex flex-col gap-4 p-6 mt-3"
                aria-label="Navegación móvil"
              >
                {WORKSPACE_NAV.map((nav) => (
                  <SheetClose asChild key={nav.label}>
                    <Link
                      href={`${base}${nav.href}`}
                      className={`py-2 ${section === nav.href ? "text-primary font-bold" : "text-muted-foreground"}`}
                    >
                      {nav.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <nav
        className="container-main workspace-nav"
        aria-label="Navegación del área de trabajo"
      >
        {WORKSPACE_NAV.map((nav) => (
          <Link
            href={`${base}${nav.href}`}
            key={nav.label}
            className={section === nav.href ? "active" : ""}
            aria-current={section === nav.href ? "page" : undefined}
          >
            {nav.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
