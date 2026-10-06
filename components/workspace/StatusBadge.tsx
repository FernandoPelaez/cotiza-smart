import {
  FilePenLine,
  Send,
  Eye,
  CircleCheck,
  CircleX,
  Clock3,
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/domain/config";
import type { QuoteStatus } from "@/types/domain";
import "./styles/status.css";
const icons = {
  draft: FilePenLine,
  sent: Send,
  viewed: Eye,
  accepted: CircleCheck,
  rejected: CircleX,
  expired: Clock3,
};
export function StatusBadge({ status }: { status: QuoteStatus }) {
  const Icon = icons[status];
  return (
    <span className={`status-badge status-${status}`}>
      <Icon size={13} strokeWidth={1.6} />
      {STATUS_LABELS[status]}
    </span>
  );
}
