import { Link } from "@tanstack/react-router";
import { Phone, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, formatDateIN, formatINR, type Lead, type LeadStatus } from "@/lib/crm";

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-primary-soft text-accent-foreground",
  quote_sent: "bg-warning-soft text-warning-foreground",
  booked: "bg-success-soft text-success-foreground",
  completed: "bg-secondary text-secondary-foreground",
  lost: "bg-destructive-soft text-destructive",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function LeadCard({ lead, tone }: { lead: Lead; tone?: "overdue" | "today" | undefined }) {
  return (
    <Link
      to="/leads/$id"
      params={{ id: lead.id }}
      className={cn(
        "block rounded-xl border border-border bg-card p-4 shadow-card transition hover:border-primary/40",
        tone === "overdue" && "border-l-4 border-l-destructive",
        tone === "today" && "border-l-4 border-l-warning",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground">{lead.customer_name}</p>
          <p className="truncate text-sm text-muted-foreground">{lead.service}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {lead.phone}
        </span>
        {lead.follow_up_date && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {formatDateIN(lead.follow_up_date)}
          </span>
        )}
        <span className="ml-auto font-semibold text-foreground">
          {formatINR(lead.quotation_amount)}
        </span>
      </div>
    </Link>
  );
}
