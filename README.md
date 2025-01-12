# Synapse

A dynamic knowledge management platform designed to interconnect atomic knowledge units into meaningful clusters.

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **State Management**: React Query, React Flow
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **Deployment**: Vercel

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/KaelanRichards/synapse.git
   cd synapse
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials.

4. **Start development server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
synapse/
├── src/
│   ├── components/    # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and configurations
│   ├── pages/        # Next.js pages
│   ├── styles/       # Global styles and Tailwind
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── scripts/         # Development and deployment scripts
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages
- Update documentation for significant changes
- Add tests for new features

## Deployment

The application automatically deploys to Vercel on merges to the main branch. Preview deployments are created for pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Docker Setup

### Development

To run the application in development mode with Docker:

```bash
# Build and start the development container
docker-compose up web-dev

# Stop the containers
docker-compose down
```

### Production

To run the application in production mode with Docker:

```bash
# Build and start the production container
docker-compose up web-prod

# Stop the containers
docker-compose down
```

### Environment Variables

Make sure to copy `.env.example` to `.env.local` and set the appropriate values before running the containers:

```bash
cp .env.example .env.local
```

The Docker containers will automatically use the environment variables from your `.env.local` file.
