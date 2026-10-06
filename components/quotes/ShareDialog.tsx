"use client";
import { MessageCircle, Loader2 } from "lucide-react";
import { useQuoteShare } from "@/hooks/useQuoteShare";
import { ShareModal } from "./ShareModal";
import type { Quote } from "@/types/domain";
export function ShareDialog({ quote }: { quote: Quote }) {
  const state = useQuoteShare(quote);
  return (
    <>
      <button
        className="btn btn-primary btn-sm"
        disabled={state.busy}
        onClick={state.prepare}
      >
        {state.busy ? (
          <Loader2 size={15} className="loading-indicator" />
        ) : (
          <MessageCircle size={16} />
        )}
        Compartir propuesta
      </button>
      <ShareModal state={state} />
    </>
  );
}
