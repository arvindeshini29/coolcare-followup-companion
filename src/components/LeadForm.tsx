import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SERVICES,
  STATUSES,
  STATUS_LABEL,
  leadSchema,
  type Lead,
  type LeadFormValues,
} from "@/lib/crm";

const selectCls =
  "flex h-11 w-full rounded-md border border-input bg-card px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LeadForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Lead;
  submitLabel: string;
  onSubmit: (v: LeadFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<LeadFormValues>({
    customer_name: initial?.customer_name ?? "",
    phone: initial?.phone ?? "",
    service: initial?.service ?? "",
    quotation_amount: initial?.quotation_amount != null ? String(initial.quotation_amount) : "",
    status: initial?.status ?? "new",
    follow_up_date: initial?.follow_up_date ?? "",
    notes: initial?.notes ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({});
  const [saving, setSaving] = useState(false);

  const set =
    (k: keyof LeadFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    const r = leadSchema.safeParse(values);
    if (!r.success) {
      const errs: typeof errors = {};
      for (const i of r.error.issues) errs[i.path[0] as keyof LeadFormValues] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSubmit(r.data);
    } catch {
      toast.error("Could not save. Check your internet connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const field = (k: keyof LeadFormValues, label: string, node: React.ReactNode, hint?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k} className="font-semibold">
        {label}
      </Label>
      {node}
      {errors[k] ? (
        <p id={`${k}-err`} role="alert" className="text-sm text-destructive">
          {errors[k]}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
  const aria = (k: keyof LeadFormValues) => ({
    id: k,
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  return (
    <form
      onSubmit={handle}
      noValidate
      className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {field(
          "customer_name",
          "Customer name *",
          <Input
            {...aria("customer_name")}
            className="h-11 text-base"
            value={values.customer_name}
            onChange={set("customer_name")}
            maxLength={100}
            autoComplete="off"
          />,
        )}
        {field(
          "phone",
          "Mobile number *",
          <Input
            {...aria("phone")}
            className="h-11 text-base"
            type="tel"
            inputMode="tel"
            placeholder="98765 43210"
            value={values.phone}
            onChange={set("phone")}
            maxLength={16}
          />,
          "10-digit Indian mobile",
        )}
        {field(
          "service",
          "AC service required *",
          <select
            {...aria("service")}
            className={selectCls}
            value={values.service}
            onChange={set("service")}
          >
            <option value="">Select service…</option>
            {[
              ...new Set([
                ...SERVICES,
                ...(initial && !SERVICES.includes(initial.service) ? [initial.service] : []),
              ]),
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>,
        )}
        {field(
          "quotation_amount",
          "Quotation amount (₹)",
          <Input
            {...aria("quotation_amount")}
            className="h-11 text-base"
            inputMode="decimal"
            placeholder="e.g. 2500"
            value={values.quotation_amount}
            onChange={set("quotation_amount")}
          />,
        )}
        {field(
          "status",
          "Status",
          <select
            {...aria("status")}
            className={selectCls}
            value={values.status}
            onChange={set("status")}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>,
        )}
        {field(
          "follow_up_date",
          "Follow-up date",
          <Input
            {...aria("follow_up_date")}
            className="h-11 text-base"
            type="date"
            value={values.follow_up_date}
            onChange={set("follow_up_date")}
          />,
        )}
      </div>
      {field(
        "notes",
        "Notes",
        <Textarea
          {...aria("notes")}
          rows={4}
          className="text-base"
          placeholder="AC brand, tonnage, address, preferred time…"
          value={values.notes}
          onChange={set("notes")}
          maxLength={2000}
        />,
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
