# Synapse Architecture

## System Overview

Synapse is a knowledge management system built with:

- Next.js (Frontend & API)
- Supabase (Database & Auth)
- React Flow (Graph Visualization)

## Core Components

### 1. Note Management

- Atomic note creation and editing
- Version control system
- Maturity state tracking

### 2. Connection System

- Bidirectional linking
- Connection types and strength
- Emergent connection detection

### 3. Knowledge Graph

- Interactive visualization
- Cluster detection
- Growth pattern analysis

## Data Model

### Notes Table

- Primary storage for knowledge units
- Tracks maturity and metadata
- Links to versions

### Connections Table

- Manages relationships between notes
- Stores connection metadata
- Supports bidirectional links

### Versions Table

- Historical note versions
- Change tracking
- Rollback capability

## Security

- Row Level Security (RLS)
- User-based access control
- JWT authentication

## Performance Considerations

- Optimized database indexes
- Client-side caching
- Lazy loading for graph visualization

## Development Architecture

```
src/
├── components/    # React components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── pages/        # Next.js pages
└── types/        # TypeScript types
```

## API Structure

- REST endpoints for CRUD operations
- Real-time subscriptions for updates
- GraphQL consideration for future
