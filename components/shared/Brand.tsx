import type { MouseEventHandler } from "react";
import Link from "next/link";
import Image from "next/image";
export function Brand({
  href = "/",
  light = false,
  onClick,
}: {
  href?: string;
  light?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Cotiza Smart, inicio"
      className={`brand ${light ? "brand-light" : ""}`}
    >
      <Image src="/brand/logo.png" width={48} height={48} alt="" priority />
      <span>
        Cotiza<span className="brand-accent">Smart</span>
      </span>
    </Link>
  );
}
