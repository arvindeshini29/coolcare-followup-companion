import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Profile — FollowUp Kit" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Settings,
});

const schema = z.object({
  technician_name: z.string().trim().min(1, "Your name is required").max(100),
  business_name: z.string().trim().max(100),
});

function Settings() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [v, setV] = useState({ technician_name: profile?.technician_name ?? "", business_name: profile?.business_name ?? "" });
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(v);
    if (!r.success) return setErr(r.error.issues[0]?.message ?? "Invalid");
    setErr(null);
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...r.data });
    setSaving(false);
    if (error) return void toast.error("Could not save profile");
    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile saved");
  }

  return (
    <>
      <PageHeader title="Profile" subtitle={user.email ?? undefined} />
      <form onSubmit={save} noValidate className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
        <div className="space-y-1.5">
          <Label htmlFor="tn" className="font-semibold">Your name *</Label>
          <Input id="tn" className="h-11 text-base" value={v.technician_name} maxLength={100} aria-invalid={!!err}
            onChange={(e) => setV({ ...v, technician_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bn" className="font-semibold">Business name</Label>
          <Input id="bn" className="h-11 text-base" placeholder="e.g. Cool Air Services" value={v.business_name} maxLength={100}
            onChange={(e) => setV({ ...v, business_name: e.target.value })} />
          <p className="text-xs text-muted-foreground">Used to sign your WhatsApp message templates.</p>
        </div>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
      </form>
    </>
  );
}
