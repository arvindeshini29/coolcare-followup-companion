import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquareText, Plus } from "lucide-react";
import { leadsQuery, profileQuery } from "@/lib/queries";
import { STATUS_LABEL } from "@/lib/crm";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({ meta: [{ title: "Message templates — FollowUp Kit" }] }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(leadsQuery),
      context.queryClient.ensureQueryData(profileQuery),
    ]),
  component: Templates,
});

function Templates() {
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const [id, setId] = useState(leads[0]?.id ?? "");
  const lead = leads.find((l) => l.id === id);

  return (
    <>
      <PageHeader
        title="Message templates"
        subtitle="Pick a customer and template, then open WhatsApp to send it yourself."
      />
      {!profile?.technician_name && (
        <p className="mb-4 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning-foreground">
          Add your name and business name in{" "}
          <Link to="/settings" className="font-semibold underline">
            Profile
          </Link>{" "}
          so messages are signed correctly.
        </p>
      )}
      {leads.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No customers yet"
          text="Add a lead to start sending messages."
          action={
            <Button asChild>
              <Link to="/leads/new">
                <Plus /> Add lead
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="cust" className="font-semibold">
              Customer
            </Label>
            <select
              id="cust"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.customer_name} · {l.phone} · {STATUS_LABEL[l.status]}
                </option>
              ))}
            </select>
          </div>
          {lead && <WhatsAppComposer key={lead.id} lead={lead} profile={profile} />}
        </div>
      )}
    </>
  );
}
