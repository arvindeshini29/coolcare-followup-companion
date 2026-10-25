import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Inbox, CalendarCheck2, FileClock, AlarmClock, AlertTriangle, Plus } from "lucide-react";
import { leadsQuery, profileQuery } from "@/lib/queries";
import { dashboardStats, groupFollowUps, todayISO } from "@/lib/crm";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { LeadCard } from "@/components/LeadBits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { showNativeBanner } from "@/lib/ads";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FollowUp Kit" }] }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(leadsQuery),
      context.queryClient.ensureQueryData(profileQuery),
    ]),
  component: Dashboard,
});

function Dashboard() {
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    void showNativeBanner(window.location.pathname).then((fn) => {
      if (cancelled) fn();
      else cleanup = fn;
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const today = todayISO();
  const s = dashboardStats(leads, today);
  const g = groupFollowUps(leads, today);
  const urgent = [...g.overdue, ...g.today].slice(0, 5);

  const cards = [
    {
      label: "Total enquiries",
      value: s.total,
      icon: Inbox,
      tone: "primary",
      to: "/leads" as const,
    },
    {
      label: "Bookings",
      value: s.bookings,
      icon: CalendarCheck2,
      tone: "success",
      to: "/leads" as const,
      search: { status: "booked" },
    },
    {
      label: "Quotes pending",
      value: s.quotesPending,
      icon: FileClock,
      tone: "warning",
      to: "/leads" as const,
      search: { status: "quote_sent" },
    },
    {
      label: "Due today",
      value: s.dueToday,
      icon: AlarmClock,
      tone: "warning",
      to: "/follow-ups" as const,
    },
    {
      label: "Overdue",
      value: s.overdue,
      icon: AlertTriangle,
      tone: "destructive",
      to: "/follow-ups" as const,
    },
  ];
  const toneCls: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success-foreground",
    warning: "bg-warning-soft text-warning-foreground",
    destructive: "bg-destructive-soft text-destructive",
  };

  return (
    <>
      <PageHeader
        title={
          profile?.technician_name
            ? `Namaste, ${profile.technician_name.split(" ")[0]}`
            : "Dashboard"
        }
        subtitle={profile?.business_name || "Your enquiries at a glance"}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <Link
            key={c.label}
            to={c.to}
            search={c.search as never}
            className={cn(
              "rounded-xl border border-border bg-card p-4 shadow-card transition hover:border-primary/40",
              i === 0 && "col-span-2 sm:col-span-1",
            )}
          >
            <span className={cn("grid h-9 w-9 place-items-center rounded-lg", toneCls[c.tone])}>
              <c.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 text-3xl font-extrabold tabular-nums text-foreground">{c.value}</p>
            <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="urgent-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="urgent-h" className="text-lg font-bold text-foreground">
            Needs attention
          </h2>
          <Link to="/follow-ups" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        {leads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No enquiries yet"
            text="Add your first customer enquiry to start tracking quotes and follow-ups."
            action={
              <Button asChild>
                <Link to="/leads/new">
                  <Plus /> Add first lead
                </Link>
              </Button>
            }
          />
        ) : urgent.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="All caught up"
            text="No follow-ups due today or overdue."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {urgent.map((l) => (
              <LeadCard
                key={l.id}
                lead={l}
                tone={l.follow_up_date! < today ? "overdue" : "today"}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
