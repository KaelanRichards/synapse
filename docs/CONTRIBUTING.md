# Contributing to Synapse

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Start the development environment:

```bash
docker-compose up
```

## Development Workflow

1. Create a new branch for your feature
2. Write tests for your changes
3. Implement your changes
4. Run the test suite:

```bash
docker-compose exec web npm test
```

5. Submit a pull request

## Code Style

- Use TypeScript for all new code
- Follow the ESLint configuration
- Write meaningful commit messages
- Document new components and functions

## Testing

- Write unit tests for utilities
- Create integration tests for API routes
- Add component tests for UI elements
- Include E2E tests for critical flows

## Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Development Commands

```bash
# Start development environment
docker-compose up

# Run tests
docker-compose exec web npm test

# Run linter
docker-compose exec web npm run lint

# Type check
docker-compose exec web npm run type-check

# Reset database
docker-compose exec web npm run db:reset
```

## Getting Help

- Check existing documentation
- Review open issues
- Ask in discussions
