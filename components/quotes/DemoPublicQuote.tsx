"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { PublicQuote } from "./PublicQuote";
import { SAMPLE_BUSINESS } from "@/lib/demo/seed";
export function DemoPublicQuote({ token }: { token: string }) {
  const { workspace, demoRespond } = useWorkspace();
  const quote = workspace.quotes.find((q) => q.public_token === token);
  useEffect(() => {
    if (quote?.status === "sent") demoRespond(token, "viewed");
  }, [token, quote?.status, demoRespond]);
  if (!quote)
    return (
      <main className="missing-quote">
        <h1>Este enlace de demostración no está disponible.</h1>
        <p>
          Los datos de la demo se guardan únicamente en el navegador donde la
          creaste.
        </p>
        <Link href="/demo" className="btn btn-primary">
          Volver a la demostración
        </Link>
      </main>
    );
  return (
    <PublicQuote
      key={quote.id}
      initial={quote}
      token={token}
      business={
        quote.business_snapshot ?? workspace.business ?? SAMPLE_BUSINESS
      }
      demo
      onDemoResponse={(action) => demoRespond(token, action)}
    />
  );
}
