"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { z } from "zod";

import type {
  Workspace,
  Quote,
  QuoteInput,
  Business,
  Plan,
} from "@/types/domain";
import type { WorkspaceContextValue } from "@/types/workspace";

import { createId } from "@/lib/domain/id";
import { createDemoStore } from "@/lib/demo/store";
import {
  saveDemoQuote,
  duplicateDemoQuote,
  shareDemoQuote,
  respondDemoQuote,
} from "@/lib/demo/operations";
import { quoteSchema, businessSchema } from "@/lib/schemas/quote";
import { workspaceSchema, quoteRecordSchema } from "@/lib/schemas/workspace";
import { apiRequest, ApiError } from "@/lib/services/client-api";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const successSchema = z.object({
  ok: z.boolean(),
});

const noSubscription = () => () => {};
const CHECKOUT_REFRESH_DELAYS = [0, 800, 1800, 3200] as const;
export function WorkspaceProvider({
  initial,
  children,
}: {
  initial: Workspace;
  children: ReactNode;
}) {
  const [live, setLive] = useState(initial);

  const duplicateRequests = useRef(
    new Map<string, { id: string; pending: Promise<Quote> | null }>(),
  );

  const isDemo = initial.mode === "demo";
  const [store] = useState(() => createDemoStore(initial));

  const demo = useSyncExternalStore(
    isDemo ? store.subscribe : noSubscription,
    isDemo ? store.read : store.serverSnapshot,
    store.serverSnapshot,
  );

  const workspace = isDemo ? demo : live;
  const [limitOpen, setLimitOpen] = useState(false);
  const refreshVersion = useRef(0);
  const refresh = useCallback(async () => {
    if (isDemo) return;

    const version = ++refreshVersion.current;
    const next = await apiRequest("/api/workspace", workspaceSchema);

    if (version === refreshVersion.current) {
      setLive(next);
    }
  }, [isDemo]);

  /**
   * Stripe puede redirigir al usuario antes de que el webhook termine de
   * sincronizar la suscripción en Supabase.
   *
   * Cuando regresamos de un Checkout completado hacemos varios refresh
   * cortos y controlados para recuperar el estado definitivo del workspace.
   */
  useEffect(() => {
    if (isDemo) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "completed") return;

    const timers = CHECKOUT_REFRESH_DELAYS.map((delay) =>
      window.setTimeout(() => {
        void refresh().catch((error) => {
          console.error(
            "[Cotiza Smart] No se pudo actualizar el workspace después del Checkout.",
            error,
          );
        });
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isDemo, refresh]);

  const save = useCallback(
    async (input: QuoteInput, previous?: Quote, requestId?: string) => {
      const value = quoteSchema.parse(input);

      try {
        if (isDemo) {
          const result = saveDemoQuote(store.read(), value, previous);
          store.update(result.workspace);
          return result.quote;
        }

        const quote = await apiRequest("/api/quotes", quoteRecordSchema, {
          input: value,
          id: previous?.id,
          revision: previous?.revision,
          request_id: requestId ?? createId(),
        });

        await refresh();

        return quote;
      } catch (error) {
        if (error instanceof ApiError && error.code === "FREE_LIMIT") {
          setLimitOpen(true);
        }

        throw error;
      }
    },
    [isDemo, store, refresh],
  );

  async function remove(id: string) {
    if (isDemo) {
      const current = store.read();

      store.update({
        ...current,
        quotes: current.quotes.filter((q) => q.id !== id),
      });

      return;
    }

    await apiRequest(
      `/api/quotes/${id}`,
      successSchema,
      undefined,
      "DELETE",
    );

    await refresh();
  }

  async function duplicate(quote: Quote) {
    const existing = duplicateRequests.current.get(quote.id);
    if (existing?.pending) {
      return existing.pending;
    }

    const request = existing ?? {
      id: createId(),
      pending: null,
    };

    duplicateRequests.current.set(quote.id, request);
    const operation = async () => {
      try {
        if (isDemo) {
          const result = duplicateDemoQuote(store.read(), quote);
          store.update(result.workspace);
          duplicateRequests.current.delete(quote.id);
          return result.quote;
        }

        const result = await apiRequest(
          `/api/quotes/${quote.id}/duplicate`,
          quoteRecordSchema,
          {
            request_id: request.id,
          },
        );

        await refresh();
        duplicateRequests.current.delete(quote.id);
        return result;
      } catch (error) {
        if (error instanceof ApiError && error.code === "FREE_LIMIT") {
          setLimitOpen(true);
        }

        throw error;
      } finally {
        request.pending = null;
      }
    };

    request.pending = operation();
    return request.pending;
  }

  async function share(quote: Quote) {
    if (isDemo) {
      const result = shareDemoQuote(store.read(), quote.id);
      store.update(result.workspace);
      return result.quote;
    }

    const result = await apiRequest(
      `/api/quotes/${quote.id}/share`,
      quoteRecordSchema,
      {},
    );

    await refresh();
    return result;
  }

  async function saveBusiness(value: Business) {
    const input = businessSchema.parse(value);
    if (isDemo) {
      const current = store.read();
      store.update({
        ...current,
        business: {
          ...input,
          id: current.business?.id ?? "demo-business",
        },
      });

      return;
    }

    await apiRequest("/api/business", businessSchema, input);
    await refresh();
  }

  async function markRead(id?: string) {
    if (isDemo) {
      const current = store.read();

      store.update({
        ...current,
        notifications: current.notifications.map((notification) =>
          !id || notification.id === id
            ? {
                ...notification,
                read_at:
                  notification.read_at ?? new Date().toISOString(),
              }
            : notification,
        ),
      });

      return;
    }

    await apiRequest("/api/notifications/read", successSchema, {
      id,
    });

    await refresh();
  }

  function setDemoPlan(plan: Plan) {
    if (!isDemo) return;

    store.update({
      ...store.read(),
      subscription: {
        plan,
        status: plan === "free" ? "free" : "active",
        current_period_end:
          plan === "free"
            ? null
            : new Date(Date.now() + 30 * 86400000).toISOString(),
        cancel_at_period_end: false,
      },
    });
  }

  const value: WorkspaceContextValue = {
    workspace,
    base: isDemo ? "/demo" : "/dashboard",
    refresh,
    save,
    remove,
    duplicate,
    share,
    saveBusiness,
    markRead,
    setDemoPlan,

    demoRespond: (token, action) => {
      if (isDemo) {
        store.update(
          respondDemoQuote(store.read(), token, action),
        );
      }
    },

    resetDemo: () => {
      if (isDemo) {
        store.update(initial);
      }
    },

    demoOnboarding: () => {
      if (isDemo) {
        store.update({
          ...store.read(),
          business: null,
        });
      }
    },

    limitOpen,
    setLimitOpen,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("WorkspaceProvider es necesario.");
  }

  return context;
}
