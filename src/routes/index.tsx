import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, FileSpreadsheet, MessageCircle, ShieldCheck, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FollowUp Kit — Simple CRM for AC repair technicians" },
      { name: "description", content: "Track AC service enquiries, quotations in ₹ and follow-ups. Message customers on WhatsApp in one tap." },
      { property: "og:title", content: "FollowUp Kit — Simple CRM for AC repair technicians" },
      { property: "og:description", content: "Never miss a follow-up. Track enquiries, quotes and bookings from your phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: BellRing, title: "Never miss a follow-up", text: "Overdue, today and upcoming — sorted for you." },
  { icon: MessageCircle, title: "WhatsApp in one tap", text: "Ready-made messages. You review and press Send." },
  { icon: FileSpreadsheet, title: "Export to CSV", text: "Download your leads for Excel or Google Sheets." },
  { icon: ShieldCheck, title: "Private to you", text: "Your customer list is visible only to your account." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="flex items-center gap-2 font-extrabold tracking-tight text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><Snowflake className="h-4 w-4" /></span>
          FollowUp Kit
        </span>
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">For AC repair technicians</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Turn every enquiry into a booking.
          </h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">
            Track customers, quotations and follow-ups from your phone — built for independent technicians in India.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/auth" search={{ mode: "signup" }}>Create free account</Link></Button>
            <Button asChild size="lg" variant="ghost" className="hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/auth">I have an account</Link></Button>
          </div>
        </section>
        <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Features">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <f.icon className="h-6 w-6 text-primary" aria-hidden />
              <h2 className="mt-3 font-bold text-foreground">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
