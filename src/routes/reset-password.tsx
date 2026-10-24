import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — FollowUp Kit" },
      { name: "description", content: "Choose a new password for your FollowUp Kit account." },
      { property: "og:title", content: "Set new password — FollowUp Kit" },
      { property: "og:description", content: "Choose a new password for your FollowUp Kit account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setErr("Password must be at least 8 characters");
    if (pw !== pw2) return setErr("Passwords do not match");
    setBusy(true);
    let error: unknown = null;
    try {
      ({ error } = await supabase.auth.updateUser({ password: pw }));
    } catch {
      setBusy(false);
      return setErr("Something went wrong. Check your internet connection and try again.");
    }
    setBusy(false);
    if (error) return setErr("This reset link is invalid or has expired. Please request a new one.");
    toast.success("Password updated");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} noValidate className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h1 className="text-xl font-extrabold text-foreground">Set a new password</h1>
        <div className="space-y-1.5">
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" autoComplete="new-password" className="h-11 text-base" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np2">Confirm password</Label>
          <Input id="np2" type="password" autoComplete="new-password" className="h-11 text-base" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
      </form>
    </div>
  );
}
