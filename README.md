# Synapse

A knowledge management system that helps you connect and grow your ideas.

## Quick Start with Docker

1. Clone the repository:

```bash
git clone https://github.com/yourusername/synapse.git
cd synapse
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Start the development environment:

```bash
docker-compose up
```

This will start:

- Next.js app on http://localhost:3000
- Supabase Studio on http://localhost:54321
- Postgres on port 54322

## Development

The development environment uses Docker Compose for easy setup and consistent environments:

- Hot reload is enabled
- Source files are mounted into the container
- Node modules are cached in a Docker volume
- Supabase runs locally for development

### Environment Variables

Required variables in your `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Development Commands

```bash
# Start development environment
docker-compose up

# Run tests
docker-compose exec web npm test

# Reset database
docker-compose exec web npm run db:reset

# Generate types from database
docker-compose exec web npm run db:types
```

## Production Deployment

### Deploy with Vercel (Recommended)

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Link your project:

```bash
vercel link
```

3. Add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

4. Deploy:

```bash
vercel deploy
```

You can also deploy directly from the [Vercel Dashboard](https://vercel.com/new) by importing your GitHub repository.

### Alternative: Docker Deployment

1. Build the Docker image:

```bash
docker build -t synapse .
```

2. Run the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  synapse
```

### Production Considerations

- The production build uses multi-stage builds for smaller image size
- Node.js runs as a non-root user for security
- Environment variables must be set at runtime
- Static files are properly handled by Next.js standalone mode

## Architecture

- **Frontend**: Next.js 13 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library

## Contributing

1. Start the development environment:

```bash
docker-compose up
```

2. Make your changes

3. Run tests:

```bash
docker-compose exec web npm test
```

4. Submit a pull request

## License

MIT
