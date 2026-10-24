import { z } from "zod";

export const STATUSES = ["new", "quote_sent", "booked", "completed", "lost"] as const;
export type LeadStatus = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  quote_sent: "Quote Sent",
  booked: "Booked",
  completed: "Completed",
  lost: "Lost",
};

export const SERVICES = [
  "AC Installation",
  "AC Uninstallation",
  "General Service",
  "Deep Cleaning / Jet Wash",
  "Gas Refilling",
  "Repair / Not Cooling",
  "PCB Repair",
  "Compressor Replacement",
  "AMC",
  "Other",
];

export type Lead = {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  service: string;
  quotation_amount: number | null;
  status: LeadStatus;
  follow_up_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "—";
  return inr.format(Number(amount));
}

/** Format YYYY-MM-DD or ISO timestamp as DD/MM/YYYY (Indian style). */
export function formatDateIN(value: string | null | undefined): string {
  if (!value) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T00:00:00") : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Leads that are closed (completed/lost) never need follow-up. */
export function needsFollowUp(lead: Pick<Lead, "status" | "follow_up_date">): boolean {
  return !!lead.follow_up_date && lead.status !== "completed" && lead.status !== "lost";
}

export type Bucket = "overdue" | "today" | "upcoming";
export function followUpBucket(dateISO: string, today: string): Bucket {
  if (dateISO < today) return "overdue";
  if (dateISO === today) return "today";
  return "upcoming";
}

export function groupFollowUps<T extends Pick<Lead, "status" | "follow_up_date">>(
  leads: T[],
  today: string,
): Record<Bucket, T[]> {
  const out: Record<Bucket, T[]> = { overdue: [], today: [], upcoming: [] };
  for (const l of leads) {
    if (!needsFollowUp(l)) continue;
    out[followUpBucket(l.follow_up_date!, today)].push(l);
  }
  for (const k of Object.keys(out) as Bucket[]) {
    out[k].sort((a, b) => a.follow_up_date!.localeCompare(b.follow_up_date!));
  }
  return out;
}

export function dashboardStats(leads: Lead[], today: string) {
  const g = groupFollowUps(leads, today);
  return {
    total: leads.length,
    bookings: leads.filter((l) => l.status === "booked").length,
    quotesPending: leads.filter((l) => l.status === "quote_sent").length,
    dueToday: g.today.length,
    overdue: g.overdue.length,
  };
}

/** Normalise an Indian phone number to 10 digits, or null if invalid. */
export function normalizeIndianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/**
 * Digits to match against saved 10-digit phones when searching.
 * Strips +91 / 91 (when 12 digits) / leading 0 so "+91 98765" and "098765" match "98765...".
 */
export function phoneSearchDigits(query: string): string {
  let d = query.replace(/\D/g, "");
  if (/^\s*\+\s*91/.test(query) || (d.length === 12 && d.startsWith("91"))) d = d.slice(2);
  else if (d.startsWith("0")) d = d.replace(/^0+/, "");
  return d;
}

export function phoneMatches(savedPhone: string, query: string): boolean {
  const d = phoneSearchDigits(query);
  return d.length > 0 && savedPhone.includes(d);
}

export function whatsappUrl(phone: string, message: string): string | null {
  const p = normalizeIndianPhone(phone);
  if (!p) return null;
  return `https://wa.me/91${p}?text=${encodeURIComponent(message)}`;
}

export const leadSchema = z.object({
  customer_name: z.string().trim().min(1, "Customer name is required").max(100, "Max 100 characters"),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeIndianPhone(v) !== null, "Enter a valid 10-digit Indian mobile number"),
  service: z.string().trim().min(1, "Choose a service").max(100),
  quotation_amount: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 10000000), "Enter a valid amount in ₹"),
  status: z.enum(STATUSES),
  follow_up_date: z.string().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date"),
  notes: z.string().max(2000, "Max 2000 characters"),
});
export type LeadFormValues = z.infer<typeof leadSchema>;

export function toLeadRow(v: LeadFormValues) {
  return {
    customer_name: v.customer_name.trim(),
    phone: normalizeIndianPhone(v.phone)!,
    service: v.service.trim(),
    quotation_amount: v.quotation_amount === "" ? null : Number(v.quotation_amount),
    status: v.status,
    follow_up_date: v.follow_up_date === "" ? null : v.follow_up_date,
    notes: v.notes.trim(),
  };
}

function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  // Guard against spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = ["Customer Name", "Phone", "AC Service", "Quotation (INR)", "Status", "Follow-up Date", "Notes", "Created Date"];
  const rows = leads.map((l) => [
    l.customer_name,
    l.phone,
    l.service,
    l.quotation_amount ?? "",
    STATUS_LABEL[l.status],
    l.follow_up_date ? formatDateIN(l.follow_up_date) : "",
    l.notes,
    formatDateIN(l.created_at),
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export type Profile = { technician_name: string; business_name: string };

export const TEMPLATES = [
  {
    id: "quote",
    title: "Send quotation",
    body: "Namaste {customer}, this is {technician} from {business}. As discussed, the quotation for {service} is {amount}. Please let me know a convenient time and I will book your slot.",
  },
  {
    id: "followup",
    title: "Follow-up reminder",
    body: "Hello {customer}, {technician} here from {business}. Just following up on your {service} enquiry. Would you like to go ahead? Happy to answer any questions.",
  },
  {
    id: "booking",
    title: "Booking confirmation",
    body: "Hi {customer}, your {service} is confirmed with {business}. {technician} will reach on the scheduled day. Thank you!",
  },
  {
    id: "thanks",
    title: "Thank you / review",
    body: "Thank you {customer} for choosing {business} for your {service}. If you are happy with the work, please recommend us to friends. – {technician}",
  },
  {
    id: "service_due",
    title: "Service due",
    body: "Hello {customer}, this is {technician} from {business}. Your AC may be due for servicing. Regular servicing keeps cooling strong and power bills low. Shall I book a visit?",
  },
];

export function fillTemplate(body: string, lead: Pick<Lead, "customer_name" | "service" | "quotation_amount">, profile: Profile | null): string {
  return body
    .replaceAll("{customer}", lead.customer_name)
    .replaceAll("{service}", lead.service)
    .replaceAll("{amount}", formatINR(lead.quotation_amount))
    .replaceAll("{technician}", profile?.technician_name || "your technician")
    .replaceAll("{business}", profile?.business_name || "our AC service");
}
