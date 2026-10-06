"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-main max-w-lg! py-24">
      <span className="eyebrow">VOLVAMOS A INTENTAR</span>
      <h1 className="section-title">No pudimos cargar tu espacio.</h1>
      <p className="section-copy mb-7">
        Revisa tu conexión. Vuelve a intentar en un momento.
      </p>
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" onClick={reset}>
          Intentar de nuevo
        </button>
        <Link href="/" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
