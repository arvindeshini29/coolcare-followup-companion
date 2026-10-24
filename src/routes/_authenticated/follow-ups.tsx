import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { leadsQuery } from "@/lib/queries";
import { groupFollowUps, todayISO, type Bucket } from "@/lib/crm";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { LeadCard } from "@/components/LeadBits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/follow-ups")({
  head: () => ({ meta: [{ title: "Follow-ups — FollowUp Kit" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQuery),
  component: FollowUps,
});

const SECTIONS: { key: Bucket; title: string; dot: string }[] = [
  { key: "overdue", title: "Overdue", dot: "bg-destructive" },
  { key: "today", title: "Due today", dot: "bg-warning" },
  { key: "upcoming", title: "Upcoming", dot: "bg-primary" },
];

function FollowUps() {
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const g = groupFollowUps(leads, todayISO());
  const total = g.overdue.length + g.today.length + g.upcoming.length;

  return (
    <>
      <PageHeader title="Follow-ups" subtitle="Open leads with a follow-up date. Completed and lost leads are hidden." />
      {total === 0 ? (
        <EmptyState icon={BellRing} title="No follow-ups scheduled" text="Set a follow-up date on a lead and it will appear here." />
      ) : (
        <div className="space-y-7">
          {SECTIONS.map((s) => (
            <section key={s.key} aria-labelledby={`fu-${s.key}`}>
              <h2 id={`fu-${s.key}`} className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} aria-hidden />
                {s.title}
                <span className="text-sm font-semibold text-muted-foreground">({g[s.key].length})</span>
              </h2>
              {g[s.key].length === 0 ? (
                <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">Nothing here.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {g[s.key].map((l) => (
                    <LeadCard key={l.id} lead={l} tone={s.key === "upcoming" ? undefined : s.key} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
