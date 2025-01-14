# Synapse

A dynamic knowledge management platform designed to interconnect atomic knowledge units (notes) into meaningful clusters.

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS, React Query, React Flow
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **Deployment**: Vercel, GitHub Actions for CI/CD

## Local Development Setup

1. **Prerequisites**

   - Node.js 18+
   - Docker (for local Supabase)
   - Supabase CLI

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Local Supabase**

   ```bash
   # Install Supabase CLI if you haven't already
   brew install supabase/tap/supabase

   # Start local Supabase
   supabase start

   # This will output your local credentials - add them to .env.local
   ```

4. **Environment Variables**

   - Copy `.env.local.example` to `.env.local`
   - Update with your local Supabase credentials
   - Add GitHub OAuth credentials if needed

5. **Run Development Server**

   ```bash
   npm run dev
   ```

6. **Database Migrations**

   ```bash
   # Apply migrations
   supabase db reset

   # Create a new migration
   supabase migration new your_migration_name
   ```

## Project Structure

```
synapse/
├── components/        # React components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── pages/           # Next.js pages and API routes
├── prisma/          # Database schema and migrations
├── styles/          # Global styles and Tailwind config
├── types/           # TypeScript type definitions
└── supabase/        # Supabase configurations and migrations
```

## Database Schema

The project uses a PostgreSQL database with the following main tables:

- `notes`: Main table for storing knowledge units
- `note_versions`: Version history for notes
- `connections`: Relationships between notes
- `tags`: Note categorization
- `note_tags`: Junction table for note-tag relationships

See `supabase/migrations` for the complete schema definition.

## Features

- Rich text editing with Lexical
- Note versioning
- Bidirectional note connections
- Tag-based organization
- Real-time collaboration
- GitHub authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
