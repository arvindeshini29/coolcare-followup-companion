import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil, Phone, Trash2, SearchX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { leadsQuery, profileQuery, useDeleteLead } from "@/lib/queries";
import { formatDateIN, formatINR, toLeadRow } from "@/lib/crm";
import { LeadForm } from "@/components/LeadForm";
import { StatusBadge } from "@/components/LeadBits";
import { EmptyState } from "@/components/AppShell";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  head: () => ({ meta: [{ title: "Lead — FollowUp Kit" }] }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(leadsQuery), context.queryClient.ensureQueryData(profileQuery)]),
  component: LeadDetail,
});

function LeadDetail() {
  const { id } = Route.useParams();
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const lead = leads.find((l) => l.id === id);
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const del = useDeleteLead();

  if (!lead)
    return <EmptyState icon={SearchX} title="Lead not found" text="It may have been deleted." action={<Button asChild variant="outline"><Link to="/leads">Back to leads</Link></Button>} />;

  if (editing)
    return (
      <>
        <h1 className="mb-4 text-2xl font-extrabold text-foreground">Edit lead</h1>
        <LeadForm
          initial={lead}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (v) => {
            const { error } = await supabase.from("leads").update(toLeadRow(v)).eq("id", lead.id);
            if (error) return void toast.error("Could not update lead. Please try again.");
            await qc.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead updated");
            setEditing(false);
          }}
        />
      </>
    );

  const rows: [string, React.ReactNode][] = [
    ["Phone", <a key="p" href={`tel:+91${lead.phone}`} className="font-semibold text-primary">{lead.phone}</a>],
    ["AC service", lead.service],
    ["Quotation", formatINR(lead.quotation_amount)],
    ["Follow-up date", formatDateIN(lead.follow_up_date)],
    ["Created", formatDateIN(lead.created_at)],
  ];

  return (
    <>
      <Link to="/leads" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Leads
      </Link>
      <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{lead.customer_name}</h1>
            <div className="mt-1"><StatusBadge status={lead.status} /></div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="soft" size="sm"><a href={`tel:+91${lead.phone}`}><Phone /> Call</a></Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil /> Edit</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Delete lead"><Trash2 /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                  <AlertDialogDescription>{lead.customer_name}'s record will be removed permanently.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      del.mutate(lead.id, {
                        onSuccess: () => { toast.success("Lead deleted"); navigate({ to: "/leads" }); },
                        onError: () => toast.error("Could not delete lead"),
                      })
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border pb-2 sm:block sm:border-0">
              <dt className="text-sm text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium text-foreground sm:text-left">{v}</dd>
            </div>
          ))}
        </dl>
        {lead.notes && (
          <div className="mt-4">
            <h2 className="text-sm text-muted-foreground">Notes</h2>
            <p className="mt-1 whitespace-pre-wrap text-foreground">{lead.notes}</p>
          </div>
        )}
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6" aria-labelledby="wa-h">
        <h2 id="wa-h" className="mb-3 text-lg font-bold text-foreground">Message on WhatsApp</h2>
        <WhatsAppComposer lead={lead} profile={profile} />
      </section>
    </>
  );
}
