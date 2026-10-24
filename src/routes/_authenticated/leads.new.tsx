import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { toLeadRow } from "@/lib/crm";
import { LeadForm } from "@/components/LeadForm";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/leads/new")({
  head: () => ({ meta: [{ title: "Add lead — FollowUp Kit" }] }),
  component: NewLead,
});

function NewLead() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <>
      <PageHeader title="Add lead" subtitle="Record a new customer enquiry" />
      <LeadForm
        submitLabel="Save lead"
        onCancel={() => navigate({ to: "/leads" })}
        onSubmit={async (v) => {
          const { data, error } = await supabase.from("leads").insert(toLeadRow(v)).select("id").single();
          if (error) {
            toast.error("Could not save lead. Please try again.");
            return;
          }
          await qc.invalidateQueries({ queryKey: ["leads"] });
          toast.success("Lead saved");
          navigate({ to: "/leads/$id", params: { id: data.id } });
        }}
      />
    </>
  );
}
