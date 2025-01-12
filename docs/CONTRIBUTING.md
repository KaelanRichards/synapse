# Contributing to Synapse

## Development Setup

1. Clone the repository
2. Run `./setup.sh` to set up your development environment
3. Use `npm run dev:fresh` for a clean development start

## Development Workflow

1. Create a new branch for your feature
2. Write tests for your changes
3. Implement your changes
4. Run the test suite
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

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Scripts

- `npm run dev` - Start development server
- `npm run dev:fresh` - Fresh start with new database
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run type-check` - Check types

## Getting Help

- Check existing documentation
- Review open issues
- Ask in discussions
