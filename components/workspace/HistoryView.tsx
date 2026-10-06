"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FilePenLine,
  Send,
  Eye,
  Check,
  X,
  Clock,
  Copy,
  Search,
  History,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "./WorkspaceProvider";
import { EVENT_LABELS } from "@/lib/domain/config";
import { dateLabel, BUSINESS_TIME_ZONE } from "@/lib/domain/quotes";
const icons = {
  created: FilePenLine,
  updated: FilePenLine,
  sent: Send,
  viewed: Eye,
  accepted: Check,
  rejected: X,
  expired: Clock,
  duplicated: Copy,
};
export function HistoryView() {
  const { workspace, base } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const events = workspace.events.filter(
    (event) =>
      (filter === "all" ||
        (filter === "responses"
          ? event.kind === "accepted" || event.kind === "rejected"
          : ["sent", "viewed"].includes(event.kind))) &&
      `${event.title} ${event.customer_name} ${event.quote_number}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const groups = new Map<string, typeof events>();
  events.forEach((event) => {
    const day = new Date(event.created_at).toLocaleDateString("es-MX", {
      timeZone: BUSINESS_TIME_ZONE,
    });
    groups.set(day, [...(groups.get(day) ?? []), event]);
  });
  const [now] = useState(() => new Date());
  const today = now.toLocaleDateString("es-MX", {
    timeZone: BUSINESS_TIME_ZONE,
  });
  const yesterday = new Date(now.getTime() - 86400000).toLocaleDateString(
    "es-MX",
    { timeZone: BUSINESS_TIME_ZONE },
  );
  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">CADA PASO DEJA UNA HUELLA</span>
          <h1>Tu historial.</h1>
          <p>Lo que has propuesto. Lo que han visto. Lo que está por venir.</p>
        </div>
      </div>
      <div className="history-toolbar">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList variant="line">
            <TabsTrigger value="all">Toda la actividad</TabsTrigger>
            <TabsTrigger value="responses">Respuestas</TabsTrigger>
            <TabsTrigger value="shared">Enviadas y vistas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="search-control">
          <Search size={16} />
          <input
            aria-label="Buscar en el historial"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar una propuesta"
          />
        </div>
      </div>
      <div className="timeline">
        {Array.from(groups.entries()).map(([day, items]) => (
          <section key={day} className="timeline-group">
            <h2>
              {day === today
                ? "Hoy"
                : day === yesterday
                  ? "Ayer"
                  : dateLabel(items[0].created_at)}
            </h2>
            <div>
              {items.map((event) => {
                const Icon = icons[event.kind];
                const exists = workspace.quotes.some(
                  (q) => q.id === event.quote_id,
                );
                return (
                  <div key={event.id} className="timeline-event">
                    <span className={`timeline-icon event-${event.kind}`}>
                      <Icon size={16} />
                    </span>
                    <div className="timeline-copy">
                      <h3>{EVENT_LABELS[event.kind]}</h3>
                      {exists ? (
                        <Link href={`${base}/cotizaciones/${event.quote_id}`}>
                          {event.title}
                        </Link>
                      ) : (
                        <span>{event.title} · eliminada</span>
                      )}
                      <p>
                        {event.quote_number} · {event.customer_name}
                      </p>
                    </div>
                    <time dateTime={event.created_at}>
                      {new Date(event.created_at).toLocaleTimeString("es-MX", {
                        timeZone: BUSINESS_TIME_ZONE,
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {!events.length && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>Tu historia empieza con una propuesta.</EmptyTitle>
            <EmptyDescription>
              Las creaciones, los envíos y las respuestas aparecerán aquí.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}
