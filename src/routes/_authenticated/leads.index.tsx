import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Download, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { leadsQuery } from "@/lib/queries";
import { STATUSES, STATUS_LABEL, leadsToCsv, todayISO, type LeadStatus } from "@/lib/crm";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { LeadCard } from "@/components/LeadBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Search = { q?: string; status?: LeadStatus };

export const Route = createFileRoute("/_authenticated/leads/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    status: STATUSES.includes(s.status as LeadStatus) ? (s.status as LeadStatus) : undefined,
  }),
  head: () => ({ meta: [{ title: "Leads — FollowUp Kit" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQuery),
  component: LeadsPage,
});

function LeadsPage() {
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const { q = "", status } = Route.useSearch();
  const navigate = useNavigate({ from: "/leads/" });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    return leads.filter(
      (l) =>
        (!status || l.status === status) &&
        (!needle ||
          l.customer_name.toLowerCase().includes(needle) ||
          l.service.toLowerCase().includes(needle) ||
          l.notes.toLowerCase().includes(needle) ||
          (digits.length > 0 && l.phone.includes(digits))),
    );
  }, [leads, q, status]);

  function exportCsv() {
    if (filtered.length === 0) return toast.error("No leads to export");
    const blob = new Blob(["\uFEFF" + leadsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `followup-kit-leads-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} lead${filtered.length === 1 ? "" : "s"}`);
  }

  const chips: (LeadStatus | undefined)[] = [undefined, ...STATUSES];

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} total`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download /> CSV</Button>
            <Button asChild className="hidden md:inline-flex"><Link to="/leads/new"><Plus /> Add lead</Link></Button>
          </div>
        }
      />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <label htmlFor="lead-search" className="sr-only">Search leads</label>
        <Input
          id="lead-search"
          type="search"
          placeholder="Search name, phone, service…"
          className="h-11 bg-card pl-9 text-base"
          value={q}
          onChange={(e) => navigate({ search: (p) => ({ ...p, q: e.target.value || undefined }), replace: true })}
        />
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by status">
        {chips.map((s) => {
          const active = s === status;
          return (
            <button
              key={s ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => navigate({ search: (p) => ({ ...p, status: s }), replace: true })}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s ? STATUS_LABEL[s] : "All"}
              <span className="ml-1.5 opacity-70">{s ? leads.filter((l) => l.status === s).length : leads.length}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {leads.length === 0 ? (
          <EmptyState icon={Users} title="No leads yet" text="Every enquiry you add will show up here." action={<Button asChild><Link to="/leads/new"><Plus /> Add lead</Link></Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="No matches" text="Try a different search or status filter." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((l) => <LeadCard key={l.id} lead={l} />)}
          </div>
        )}
      </div>
    </>
  );
}
