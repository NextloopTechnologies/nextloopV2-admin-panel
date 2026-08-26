## Nextloop Admin Panel

Admin panel for managing Nextloop content and inbound data. It is a Next.js 14 application using the App Router, PostgreSQL, Drizzle ORM, Supabase client APIs, ImageKit uploads, Ant Design, Tailwind CSS, and TypeScript.

## Features

- Dashboard and local-storage based admin login state
- Blog posts, authors, categories, SEO metadata, and internal links
- Jobs and applied job applications
- Portfolio items and images
- Testimonials
- Enquiries, ideas, and popup form submissions
- User records
- Image upload and deletion through ImageKit
- JSON API routes under `/api`

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer running locally for development
- An ImageKit account for image upload features
- Supabase project credentials for the Supabase-backed API client

Do not use the production Supabase database as the local development database. Local development must use a local PostgreSQL database and a local `DATABASE_URL`.

## Installation

```bash
npm install
```

Create `.env.local` in the repository root using the template below. Replace every placeholder with a local or development value. Never commit `.env`, `.env.local`, or any secret.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with this template:

```dotenv
DATABASE_URL=postgresql://postgres:your_local_password@127.0.0.1:5432/nextloop_admin

NEXT_PUBLIC_SUPABASE_URL=https://your-development-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-development-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-development-service-role-key

API_AUTH_TOKEN=replace-with-a-long-random-token

NEXT_PUBLIC_IK_PUBLIC_KEY=your-imagekit-public-key
NEXT_PUBLIC_IK_PRIVATE_KEY=your-imagekit-private-key
NEXT_PUBLIC_IK_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/

NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The application currently reads the ImageKit private key from the `NEXT_PUBLIC_IK_PRIVATE_KEY` name. Keep that value server-side and do not expose it to browser code. `SERVICE_ROLE_KEY` is accepted as a legacy alias, but `SUPABASE_SERVICE_ROLE_KEY` is the preferred name.

## Local PostgreSQL Setup

1. Install PostgreSQL locally and make sure the PostgreSQL service is running.
2. Create a database named `nextloop_admin` using pgAdmin or `psql`:

```sql
CREATE DATABASE nextloop_admin;
```

3. Set `DATABASE_URL` in `.env.local` to that local database. Use the port, username, and password configured by your PostgreSQL installation.
4. Verify the connection before applying schema changes:

```bash
npm run db:check
```

5. Apply the checked-in Drizzle migrations:

```bash
npm run db:migrate
```

The migration command reads the `migrations` directory and uses `DATABASE_URL`. Confirm that the URL points to local PostgreSQL before running it.

## Database Changes

The Drizzle schema is maintained in `lib/supabase/schema.ts`, with migration output in `migrations`.

For a schema change:

```bash
npm run db:generate
npm run db:check
npm run db:migrate
```

Review generated SQL before applying it. `npm run db:push` changes a database directly and must only be used against a disposable local database. Never run `db:push`, `db:drop`, or an unreviewed migration against production Supabase. Production changes must be reviewed, backed up according to the operations policy, and applied through the approved deployment process.

Useful database commands:

| Command | Purpose |
| --- | --- |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:check` | Check migration consistency |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run db:pull` | Introspect the configured PostgreSQL database |
| `npm run db:push` | Push schema directly to a database; local use only |
| `npm run db:drop` | Drop migration objects; disposable local use only |

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run Next.js linting |

## API Authentication

All routes under `/api` pass through `middleware.ts`. If `API_AUTH_TOKEN` is set, clients must send:

```http
Authorization: Bearer <API_AUTH_TOKEN>
```

If the variable is absent, the middleware allows requests without a token. Set it in every shared or deployed environment and keep it out of source control.

## Validation Before Opening a Pull Request

```bash
npm run lint
npm run build
```

Also verify that the application can start against a local PostgreSQL database and that the relevant create, update, view, and delete workflows work with non-production data.

## Contributing

1. Create a focused feature or fix branch from the approved base branch.
2. Install dependencies and configure `.env.local` with local PostgreSQL and development service credentials.
3. Keep database work local. Generate and review Drizzle migrations, run them against local PostgreSQL, and never use production Supabase for testing.
4. Keep secrets, `.env` files, credentials, production URLs, and generated local data out of commits.
5. Run the required checks before opening a pull request:

```bash
npm run lint
npm run build
```

6. Include the user-visible behavior, database changes, migration instructions, and any required environment variables in the pull request description.
7. Request review before merging. Production migrations must be reviewed and applied through the approved Render deployment process.

## Render Deployment

Create a Render Web Service connected to this repository with the following settings:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm ci && npm run build` |
| Start command | `npm run start` |
| Health check path | `/` |
| Auto-deploy | Enable only for the branch approved for deployment |

Configure the production environment variables in Render's dashboard. Use the production Supabase URL and keys there, never in the repository. Set `DATABASE_URL` to the production database only for the deployment migration step, and verify the target before applying migrations.

Run production migrations as a reviewed Render pre-deploy command:

```bash
npm run db:migrate
```

Do not use `npm run db:push` in Render. Do not run production migrations from a developer workstation using a copied production connection string. Keep production secrets in Render's environment configuration and rotate any credential that has been exposed or committed.

## Project Structure

| Path | Responsibility |
| --- | --- |
| `app/` | Pages, layouts, loading states, and API routes |
| `components/` | Feature UI, forms, lists, views, and client API helpers |
| `config/` | Environment variable mapping |
| `lib/supabase/` | PostgreSQL/Drizzle client and Supabase query client |
| `migrations/` | Drizzle migration files and schema definitions |
| `types/` | Shared TypeScript types |
| `public/` | Static assets |
