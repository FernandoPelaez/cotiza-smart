"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { toast } from "@/lib/services/feedback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWorkspace } from "./WorkspaceProvider";
import { dateLabel } from "@/lib/domain/quotes";
export function NotificationCenter() {
  const { workspace, base, markRead } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const unread = workspace.notifications.filter((n) => !n.read_at).length;
  async function read(id?: string) {
    setBusy(true);
    try {
      await markRead(id);
    } catch {
      toast.error("No se pudo marcar como leído. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="notification-trigger icon-btn"
          aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="notification-count">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="notification-panel">
        <div className="notification-heading">
          <div>
            <DialogTitle>Notificaciones</DialogTitle>
            <DialogDescription>
              Las respuestas a tus propuestas.
            </DialogDescription>
          </div>
        </div>
        {unread > 0 && (
          <button
            className="text-link notification-mark-all"
            disabled={busy}
            onClick={() => void read()}
          >
            <CheckCheck size={15} />
            Marcar todas como leídas
          </button>
        )}
        <div className="notification-list">
          {workspace.notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell size={32} strokeWidth={1.2} />
              <h3>Todo al día.</h3>
              <p>
                Cuando un cliente acepte o rechace una cotización, te avisaremos
                aquí.
              </p>
            </div>
          ) : (
            workspace.notifications.map((notification) => (
              <article
                key={notification.id}
                className={`notification-item ${notification.read_at ? "" : "unread"}`}
              >
                <span
                  className={`notification-icon event-${notification.kind}`}
                >
                  {notification.kind === "accepted" ? (
                    <Check size={18} />
                  ) : (
                    <X size={18} />
                  )}
                </span>
                <div>
                  <strong>
                    Cotización{" "}
                    {notification.kind === "accepted"
                      ? "aceptada"
                      : "rechazada"}
                  </strong>
                  <p>
                    {notification.customer_name} · {notification.quote_number}
                  </p>
                  {workspace.quotes.some(
                    (q) => q.id === notification.quote_id,
                  ) ? (
                    <Link
                      href={`${base}/cotizaciones/${notification.quote_id}`}
                      onClick={() => {
                        void read(notification.id);
                        setOpen(false);
                      }}
                    >
                      {notification.title}
                    </Link>
                  ) : (
                    <span>{notification.title} · eliminada</span>
                  )}
                  <time dateTime={notification.created_at}>
                    {dateLabel(notification.created_at, true)}
                  </time>
                  {!notification.read_at && (
                    <button
                      disabled={busy}
                      className="notification-read"
                      onClick={() => void read(notification.id)}
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
                {!notification.read_at && (
                  <span className="unread-dot" aria-label="Sin leer" />
                )}
              </article>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
