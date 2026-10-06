"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, UserRound } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { useSectionNavigation } from "@/hooks/useSectionNavigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

const links = [
  ["beneficios", "Beneficios"],
  ["como-funciona", "Cómo funciona"],
  ["plantillas", "Plantillas"],
  ["planes", "Planes"],
  ["preguntas-frecuentes", "Preguntas frecuentes"],
];

export function MarketingHeader() {
  const { header, active, navigate } = useSectionNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.location.assign("/");
  }

  return (
    <header ref={header} className="marketing-header">
      <div className="container-main marketing-nav">
        <Brand href="/" onClick={handleBrandClick} />

        <nav
          className="desktop-links"
          aria-label="Navegación principal"
        >
          {links.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={navigate}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="marketing-actions">
          <Link href="/login" className="marketing-login-link">
            <span className="marketing-login-icon" aria-hidden="true">
              <UserRound size={17} strokeWidth={2} />
            </span>

            <span>Iniciar sesión</span>
          </Link>

          <Link
            href="/register"
            className="marketing-register-button"
          >
            <span>Comenzar gratis</span>

            <span
              className="marketing-register-icon"
              aria-hidden="true"
            >
              <ArrowUpRight size={18} strokeWidth={2.2} />
            </span>
          </Link>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="icon-btn mobile-menu"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
          </SheetTrigger>

          <SheetContent className="p-7">
            <SheetTitle>Cotiza Smart</SheetTitle>

            <SheetDescription>
              Tu próxima propuesta empieza aquí.
            </SheetDescription>

            <nav
              className="mobile-nav"
              aria-label="Navegación móvil"
            >
              {links.map(([id, label]) => (
                <SheetClose asChild key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      setMenuOpen(false);
                      navigate(event);
                    }}
                    aria-current={
                      active === id ? "location" : undefined
                    }
                  >
                    {label}
                  </a>
                </SheetClose>
              ))}

              <div className="mobile-nav-actions">
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="marketing-login-link"
                  >
                    <span
                      className="marketing-login-icon"
                      aria-hidden="true"
                    >
                      <UserRound size={18} strokeWidth={2} />
                    </span>

                    <span>Iniciar sesión</span>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href="/register"
                    className="marketing-register-button"
                  >
                    <span>Comenzar gratis</span>

                    <span
                      className="marketing-register-icon"
                      aria-hidden="true"
                    >
                      <ArrowUpRight size={18} strokeWidth={2.2} />
                    </span>
                  </Link>
                </SheetClose>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
