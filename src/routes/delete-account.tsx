import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete your account — FollowUp Kit" },
      {
        name: "description",
        content: "How to permanently delete your FollowUp Kit account and data.",
      },
      { property: "og:title", content: "Delete your account — FollowUp Kit" },
      {
        property: "og:description",
        content: "Steps to delete your FollowUp Kit account and data.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeleteInfo,
});

function DeleteInfo() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10 text-foreground">
      <h1 className="text-2xl font-extrabold">Delete your FollowUp Kit account</h1>
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        <li>
          <Link to="/auth" className="text-primary underline">
            Sign in
          </Link>{" "}
          in the app or website.
        </li>
        <li>
          Open <strong>Profile</strong> and scroll to <strong>Delete account</strong>.
        </li>
        <li>Enter your password, type DELETE and confirm.</li>
      </ol>
      <p className="text-sm">
        <strong>What is deleted immediately and permanently:</strong> your sign-in (email and
        password), your profile, and all customer leads, quotations, notes and follow-up dates. This
        cannot be undone. Export a CSV from the Leads page first if you need a copy.
      </p>
      <p className="text-sm">
        <strong>Can't sign in?</strong> Email [owner contact email] from the address on your account
        with the subject "Delete my account". We will verify ownership and delete it within [30]
        days.
      </p>
      <p className="text-sm text-muted-foreground">
        See also the{" "}
        <Link to="/privacy" className="text-primary underline">
          privacy policy
        </Link>
        .
      </p>
    </main>
  );
}
