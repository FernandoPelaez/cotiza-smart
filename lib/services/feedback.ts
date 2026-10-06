export type FeedbackKind = "success" | "error" | "info";
export interface FeedbackMessage {
  id: number;
  kind: FeedbackKind;
  message: string;
}
const listeners = new Set<(value: FeedbackMessage) => void>();
let sequence = 0;
function emit(kind: FeedbackKind, message: string) {
  listeners.forEach((listener) => listener({ id: ++sequence, kind, message }));
}
export const toast = {
  success: (message: string) => emit("success", message),
  error: (message: string) => emit("error", message),
  info: (message: string) => emit("info", message),
};
export function subscribeFeedback(listener: (value: FeedbackMessage) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
