import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount, DELETE_CONFIRM_WORD } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function onDelete(e: React.FormEvent) {
    e.preventDefault();
    if (word !== DELETE_CONFIRM_WORD) return setErr(`Type ${DELETE_CONFIRM_WORD} to confirm.`);
    if (!password) return setErr("Enter your password to confirm it's you.");
    setErr(null);
    setBusy(true);
    try {
      // Re-check the password so an unlocked phone can't delete the account.
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr("Password is incorrect.");
        return;
      }
      await deleteMyAccount({ data: { confirm: DELETE_CONFIRM_WORD } });
      qc.clear();
      await supabase.auth.signOut().catch(() => {});
      toast.success("Your account and all customer records were deleted.");
      navigate({ to: "/", replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 max-w-lg rounded-xl border border-destructive/40 bg-card p-4 sm:p-6">
      <h2 className="font-bold text-destructive">Delete account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently deletes your sign-in, profile and every customer lead, quotation, note and
        follow-up you saved. <strong>This cannot be undone.</strong> Export a CSV from the Leads
        page first if you want a copy.
      </p>
      {!open ? (
        <Button variant="destructive" className="mt-4" onClick={() => setOpen(true)}>
          Delete my account…
        </Button>
      ) : (
        <form onSubmit={onDelete} noValidate className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="del-pw">Your password</Label>
            <Input
              id="del-pw"
              type="password"
              autoComplete="current-password"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-word">Type {DELETE_CONFIRM_WORD} to confirm</Label>
            <Input
              id="del-word"
              className="h-11"
              autoCapitalize="characters"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </div>
          {err && (
            <p role="alert" className="text-sm text-destructive">
              {err}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" disabled={busy}>
              {busy ? "Deleting…" : "Permanently delete"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
