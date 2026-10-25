import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy (Draft) — FollowUp Kit" },
      { name: "description", content: "How FollowUp Kit handles account and customer lead data." },
      { property: "og:title", content: "Privacy Policy (Draft) — FollowUp Kit" },
      { property: "og:description", content: "How FollowUp Kit handles your data." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="prose-sm mx-auto max-w-2xl space-y-4 px-4 py-10 text-foreground">
      <p
        role="note"
        className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm font-semibold text-destructive"
      >
        DRAFT — not legal advice. The app owner must review, complete the [bracketed] details, and
        host this page before Google Play submission.
      </p>
      <h1 className="text-2xl font-extrabold">FollowUp Kit Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: [date]. Operator: [owner name, address, contact email].
      </p>

      <h2 className="text-lg font-bold">What we collect</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>
          <strong>Account data:</strong> your email address and an encrypted password, used to sign
          you in.
        </li>
        <li>
          <strong>Profile data:</strong> your name and business name, used in message templates.
        </li>
        <li>
          <strong>Customer lead data you enter:</strong> customer names, phone numbers, AC service
          needed, quotation amounts, status, follow-up dates and notes. You are responsible for
          having your customers' permission to store their details.
        </li>
        <li>
          <strong>Technical data:</strong> basic logs (e.g. errors, IP address) kept by our hosting
          provider for security.
        </li>
      </ul>

      <h2 className="text-lg font-bold">How it is stored</h2>
      <p className="text-sm">
        Data is stored with our cloud database provider (Supabase, via Lovable Cloud), encrypted in
        transit (HTTPS). Each account can only access its own records. [Confirm data region.] We do
        not sell your data or your customers' data.
      </p>

      <h2 className="text-lg font-bold">WhatsApp</h2>
      <p className="text-sm">
        The app only opens WhatsApp with a pre-filled message; you send it yourself. We do not
        access your WhatsApp account.
      </p>

      <h2 className="text-lg font-bold">Advertising (planned, currently off)</h2>
      <p className="text-sm">
        Ads are currently disabled. If enabled in a future Android version, Google AdMob may show a
        banner on the dashboard only. AdMob may collect your device's advertising ID, IP address and
        app interaction data to serve and measure ads, and you will be asked for consent where the
        law requires. Customer lead data is never shared with advertisers. See{" "}
        <a
          className="text-primary underline"
          href="https://policies.google.com/technologies/partner-sites"
        >
          how Google uses data
        </a>
        . You can reset or delete your advertising ID in Android settings.
      </p>

      <h2 className="text-lg font-bold">Retention and deletion</h2>
      <p className="text-sm">
        Data is kept while your account exists. You can delete your account and all its data at any
        time from <strong>Profile → Delete account</strong>, or see{" "}
        <Link to="/delete-account" className="text-primary underline">
          how to request deletion
        </Link>
        . Deletion is permanent. [State any backup retention period.]
      </p>

      <h2 className="text-lg font-bold">Children</h2>
      <p className="text-sm">
        The app is for business use and is not directed at children under 18.
      </p>

      <h2 className="text-lg font-bold">Contact</h2>
      <p className="text-sm">[Contact email for privacy questions.]</p>
    </main>
  );
}
