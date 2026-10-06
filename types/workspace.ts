import type { Business, Plan, Quote, QuoteInput, Workspace } from "./domain";
export interface WorkspaceContextValue {
  workspace: Workspace;
  base: string;
  refresh: () => Promise<void>;
  save: (
    input: QuoteInput,
    quote?: Quote,
    requestId?: string,
  ) => Promise<Quote>;
  remove: (id: string) => Promise<void>;
  duplicate: (quote: Quote) => Promise<Quote>;
  share: (quote: Quote) => Promise<Quote>;
  saveBusiness: (business: Business) => Promise<void>;
  markRead: (id?: string) => Promise<void>;
  setDemoPlan: (plan: Plan) => void;
  demoRespond: (
    token: string,
    action: "accepted" | "rejected" | "viewed",
  ) => void;
  resetDemo: () => void;
  demoOnboarding: () => void;
  limitOpen: boolean;
  setLimitOpen: (open: boolean) => void;
}
