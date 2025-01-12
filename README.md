# Synapse

A knowledge management system that helps you connect and grow your ideas.

## Development Setup

You have two options for local development:

### Option 1: Local Development (Recommended for Quick Start)

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Clone and setup:

```bash
git clone https://github.com/yourusername/synapse.git
cd synapse
cp .env.example .env
npm install
```

3. Start Supabase locally and run the app:

```bash
npm run dev:local
```

This will start:

- Next.js app on http://localhost:3000
- Supabase on http://localhost:54321

### Option 2: Docker Development

If you prefer using Docker:

```bash
git clone https://github.com/yourusername/synapse.git
cd synapse
cp .env.example .env
npm run dev:docker
```

## Production Deployment

### 1. Deploy Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Get your project URL and keys from the project settings
3. Run migrations on your production database:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 2. Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` (from Supabase project settings)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase project settings)
   - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase project settings)
4. Deploy!

## Environment Variables

The `.env` file needs different values for local development vs production:

### Local Development

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_key
```

### Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## Available Commands

```bash
# Development
npm run dev           # Run Next.js locally
npm run dev:local    # Run Next.js + Supabase locally
npm run dev:docker   # Run everything in Docker

# Database
npm run db:start     # Start Supabase locally
npm run db:stop      # Stop Supabase
npm run db:reset     # Reset local database
npm run db:push      # Push migrations to production
npm run db:pull      # Pull remote database schema
npm run db:generate  # Generate new migration

# Testing & Validation
npm run test         # Run tests
npm run lint         # Run linter
npm run type-check   # Check types
npm run validate     # Run all checks
```

## Architecture

- **Frontend**: Next.js 13 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## License

MIT
