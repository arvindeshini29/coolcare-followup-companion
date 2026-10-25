# Coolcare Followup Companion

Build FollowUp Kit, a polished mobile-first CRM web app for independent AC repair technicians in India.

Core MVP:
- Dashboard cards for total enquiries, bookings, quotations pending, and follow-ups due today/overdue.
- Add, edit, view, search, and filter customer leads.
- Fields: customer name, phone, AC service required, quotation amount in INR, status, follow-up date, notes, created date.
- Statuses: New, Quote Sent, Booked, Completed, Lost.
- Follow-up page sorted into overdue, due today, and upcoming.
- Message templates with a button to open WhatsApp manually for the selected customer; do not send messages automatically.
- CSV export.
- Responsive, clean professional blue-and-white design with excellent mobile usability and Indian date/currency formatting.
- Persistent cloud database and sign-in with user-specific customer records. Do not add fake customer records to the production version.
- Include basic empty states, form validation, accessible labels, and useful success/error feedback.

Keep the MVP simple. Do not enable paid integrations or paid services without approval. If a cloud database/auth setup needs enabling or has a cost, explain it before enabling it. Avoid exposing customer data across accounts.

## Local setup

1. Install Node.js 20+ (or Bun) and run `npm install` (or `bun install`).
2. Create a `.env` file (never commit it — `.gitignore` excludes `.env` and `.env.*`, except `.env.example`) with:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   VITE_SUPABASE_PROJECT_ID=...
   SUPABASE_URL=...
   SUPABASE_PUBLISHABLE_KEY=...
   ```
   Only publishable keys belong here. Never put service-role keys or database passwords in client code or in the repo.
3. `npm run dev` to start, `npm test` for unit tests, `npm run lint`, `npm run build`.

## Database migrations

SQL migrations live in `drizzle/migrations/`. On Lovable Cloud they are applied by Lovable. For your own backend, apply them in order with the SQL editor or `psql "$DATABASE_URL" -f <file>`. Test against a non-production database first; never run ad-hoc changes on production data.

## Security reminders

- Every `leads` and `profiles` row is protected by row-level security so each technician sees only their own records. Keep RLS enabled on any new table.
- WhatsApp messages are only opened for manual sending; nothing is sent automatically.
- CSV export guards against spreadsheet formula injection.
- Do not commit `.env` files, export files containing customer data, or secrets.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e7fafe14-d83d-4312-826c-6b58e7c278ee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Android release
See [ANDROID.md](ANDROID.md) for building a signed Play Store AAB.
