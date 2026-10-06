import { z } from "zod";
import type { Business } from "@/types/domain";
import { businessSchema } from "@/lib/schemas/quote";
const draftSchema = z.object({
  step: z.number().int().min(1).max(2),
  value: businessSchema.extend({
    name: z.string().max(160),
    email: z.string().max(254),
    website: z.string().max(300),
  }),
});
export function createBusinessDraft(initial: Business, userId: string) {
  const initialSnapshot = { value: initial, step: 1 };
  let snapshot = initialSnapshot;
  let loaded = false;
  const listeners = new Set<() => void>();
  const key = `cotiza-business-draft-v2:${userId}`;
  function read() {
    if (typeof window === "undefined") return initialSnapshot;
    if (!loaded) {
      loaded = true;
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsed = draftSchema.safeParse(JSON.parse(raw));
          if (parsed.success) snapshot = parsed.data;
        }
      } catch {
        /* Un borrador temporal no bloquea los datos confirmados del negocio. */
      }
    }
    return snapshot;
  }
  function update(next: typeof initialSnapshot) {
    snapshot = next;
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* La edición continúa en memoria si el navegador bloquea el almacenamiento. */
    }
    listeners.forEach((listener) => listener());
  }
  function clear() {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* No afecta a la información ya guardada en servidor. */
    }
  }
  return {
    read,
    update,
    clear,
    serverSnapshot: () => initialSnapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
