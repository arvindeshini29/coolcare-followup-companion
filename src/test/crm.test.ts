import { describe, it, expect } from "vitest";
import { dashboardStats, groupFollowUps, normalizeIndianPhone, phoneMatches, phoneSearchDigits, whatsappUrl, formatINR, leadsToCsv, type Lead } from "@/lib/crm";

const base: Lead = {
  id: "1", user_id: "u", customer_name: "A", phone: "9876543210", service: "Gas Refilling",
  quotation_amount: 2500, status: "new", follow_up_date: null, notes: "", created_at: "2026-10-01T00:00:00Z", updated_at: "",
};

describe("follow-ups", () => {
  it("sorts into overdue, today, upcoming and skips closed leads", () => {
    const leads = [
      { ...base, id: "a", follow_up_date: "2026-10-20" },
      { ...base, id: "b", follow_up_date: "2026-10-24" },
      { ...base, id: "c", follow_up_date: "2026-10-30" },
      { ...base, id: "d", follow_up_date: "2026-10-01", status: "completed" as const },
      { ...base, id: "e", follow_up_date: "2026-10-01", status: "lost" as const },
    ];
    const g = groupFollowUps(leads, "2026-10-24");
    expect(g.overdue.map((l) => l.id)).toEqual(["a"]);
    expect(g.today.map((l) => l.id)).toEqual(["b"]);
    expect(g.upcoming.map((l) => l.id)).toEqual(["c"]);
  });
  it("counts bookings and pending quotes", () => {
    const s = dashboardStats([{ ...base, status: "booked" }, { ...base, status: "quote_sent" }, base], "2026-10-24");
    expect(s).toMatchObject({ total: 3, bookings: 1, quotesPending: 1 });
  });
});

describe("phone & whatsapp", () => {
  it("normalises Indian numbers", () => {
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("9876543210");
    expect(normalizeIndianPhone("12345")).toBeNull();
  });
  it("builds a wa.me link with country code", () => {
    expect(whatsappUrl("9876543210", "hi there")).toBe("https://wa.me/919876543210?text=hi%20there");
  });
});

describe("formatting", () => {
  it("uses Indian grouping for INR", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
  });
  it("escapes CSV and blocks formulas", () => {
    const csv = leadsToCsv([{ ...base, customer_name: "=HACK", notes: 'say "hi", ok' }]);
    expect(csv).toContain("'=HACK");
    expect(csv).toContain('"say ""hi"", ok"');
  });
});

describe("phone search", () => {
  it("matches +91, 91 and leading-0 forms against saved 10-digit numbers", () => {
    expect(phoneMatches("9876543210", "+91 98765 43210")).toBe(true);
    expect(phoneMatches("9876543210", "919876543210")).toBe(true);
    expect(phoneMatches("9876543210", "09876543210")).toBe(true);
    expect(phoneMatches("9876543210", "+91 98765")).toBe(true);
    expect(phoneMatches("9876543210", "43210")).toBe(true);
  });
  it("does not match different numbers or empty digits", () => {
    expect(phoneMatches("9876543210", "+91 91234")).toBe(false);
    expect(phoneMatches("9876543210", "ravi")).toBe(false);
    expect(phoneSearchDigits("+91-98765")).toBe("98765");
  });
});
