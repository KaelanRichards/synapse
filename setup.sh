#!/bin/bash

echo "🚀 Setting up Synapse for local development..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL (psql) is not installed. Please install it first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up local environment variables..."
if [ ! -f .env.local ]; then
    cp .env.development .env.local
    echo "✅ Created .env.local from .env.development"
else
    echo "ℹ️ .env.local already exists, skipping..."
fi

echo "🛢️ Starting Supabase services..."
npm run db:stop 2>/dev/null # Stop any running instances
npm run db:start

echo "⏳ Waiting for Supabase to be ready..."
sleep 10 # Give Supabase some time to start up

echo "🌱 Setting up database with seed data..."
npm run db:seed

echo "🚀 Starting development server..."
npm run dev

echo """
✨ Setup complete! Your local development environment is ready.

📝 Quick Reference:
- App URL: http://localhost:3000
- Supabase Studio: http://localhost:54323
- Test Account: test@example.com / test123

Useful Commands:
- npm run dev          # Start development server
- npm run db:seed     # Reset database with fresh seed data
- npm run db:stop     # Stop Supabase services
- npm run db:start    # Start Supabase services

Happy coding! 🎉
""" 