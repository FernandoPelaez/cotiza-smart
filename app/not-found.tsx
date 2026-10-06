import Link from "next/link";
import { Brand } from "@/components/shared/Brand";
export default function NotFound() {
  return (
    <main className="container-main py-20 max-w-xl!">
      <Brand />
      <h1 className="section-title mt-12!">
        Este enlace ya no está disponible.
      </h1>
      <p className="section-copy mb-7">
        Comprueba la dirección o solicita al negocio una cotización actualizada.
      </p>
      <Link href="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </main>
  );
}
