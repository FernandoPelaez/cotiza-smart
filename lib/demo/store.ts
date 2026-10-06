import type { Workspace } from "@/types/domain";
import { workspaceSchema } from "@/lib/schemas/workspace";
const KEY = "cotiza-smart-local-demo-v1";
/** Datos de demostración explícitamente locales. Nunca sustituye el repositorio Supabase en modo live. */
export function createDemoStore(initial: Workspace) {
  let value = initial;
  let loaded = false;
  const listeners = new Set<() => void>();
  function read() {
    if (typeof window === "undefined") return initial;
    if (!loaded) {
      loaded = true;
      try {
        const saved = localStorage.getItem(KEY);
        if (saved) {
          const parsed = workspaceSchema.safeParse(JSON.parse(saved));
          if (parsed.success) value = { ...parsed.data, mode: "demo" };
        }
      } catch {
        /* Una preferencia local dañada no debe impedir explorar el producto. */
      }
    }
    return value;
  }
  function update(next: Workspace) {
    value = next;
    loaded = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* La demostración sigue funcionando durante la sesión si el almacenamiento está bloqueado. */
    }
    listeners.forEach((fn) => fn());
  }
  function subscribe(fn: () => void) {
    listeners.add(fn);
    const handler = (event: StorageEvent) => {
      if (event.key === KEY) {
        loaded = false;
        read();
        fn();
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      listeners.delete(fn);
      window.removeEventListener("storage", handler);
    };
  }
  return { read, update, subscribe, serverSnapshot: () => initial };
}
