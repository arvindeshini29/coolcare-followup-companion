import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Snowflake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — FollowUp Kit" },
      { name: "description", content: "Sign in or create your FollowUp Kit account." },
      { property: "og:title", content: "Sign in — FollowUp Kit" },
      { property: "og:description", content: "Sign in or create your FollowUp Kit account." },
    ],
  }),
  component: AuthPage,
});

const email = z.string().trim().email("Enter a valid email").max(255);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);

function AuthPage() {
  const search = Route.useSearch();
  const mode: Mode = search.mode ?? "signin";
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", password: "", technician_name: "", business_name: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    setErr(null);
    setSent(null);
  }, [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const em = email.safeParse(f.email);
    if (!em.success) return setErr(em.error.issues[0].message);
    if (mode !== "forgot") {
      const pw = password.safeParse(f.password);
      if (!pw.success) return setErr(pw.error.issues[0].message);
    }
    if (mode === "signup" && !f.technician_name.trim()) return setErr("Your name is required");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: em.data,
          password: f.password,
        });
        if (error)
          return setErr(
            error.message === "Invalid login credentials"
              ? "Wrong email or password"
              : error.message,
          );
        toast.success("Welcome back");
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: em.data,
          password: f.password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: {
              technician_name: f.technician_name.trim().slice(0, 100),
              business_name: f.business_name.trim().slice(0, 100),
            },
          },
        });
        if (error) return setErr(error.message);
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setSent("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(em.data, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) return setErr(error.message);
        setSent("If an account exists for this email, a reset link is on its way.");
      }
    } catch {
      setErr("Something went wrong. Check your internet connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset password";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 font-extrabold text-foreground"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
            <Snowflake className="h-5 w-5" />
          </span>
          FollowUp Kit
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
          {sent ? (
            <p
              role="status"
              className="mt-4 rounded-lg bg-success-soft px-4 py-3 text-sm text-success-foreground"
            >
              {sent}
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="tn">Your name</Label>
                    <Input
                      id="tn"
                      className="h-11 text-base"
                      autoComplete="name"
                      maxLength={100}
                      value={f.technician_name}
                      onChange={(e) => setF({ ...f, technician_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bn">Business name (optional)</Label>
                    <Input
                      id="bn"
                      className="h-11 text-base"
                      autoComplete="organization"
                      maxLength={100}
                      value={f.business_name}
                      onChange={(e) => setF({ ...f, business_name: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="em">Email</Label>
                <Input
                  id="em"
                  type="email"
                  className="h-11 text-base"
                  autoComplete="email"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pw">Password</Label>
                    {mode === "signin" && (
                      <Link
                        to="/auth"
                        search={{ mode: "forgot" }}
                        className="text-xs font-semibold text-primary"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <Input
                    id="pw"
                    type="password"
                    className="h-11 text-base"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={f.password}
                    onChange={(e) => setF({ ...f, password: e.target.value })}
                  />
                </div>
              )}
              {err && (
                <p role="alert" className="text-sm text-destructive">
                  {err}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
              </Button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <Link to="/auth" search={{ mode: "signup" }} className="font-semibold text-primary">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/auth" search={{}} className="font-semibold text-primary">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
