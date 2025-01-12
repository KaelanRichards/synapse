-- Create tables for Synapse knowledge management platform

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    maturity_state TEXT CHECK (maturity_state IN ('SEED', 'SAPLING', 'GROWTH', 'MATURE', 'EVOLVING')) DEFAULT 'SEED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: connections
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_from UUID REFERENCES notes(id) ON DELETE CASCADE,
    note_to UUID REFERENCES notes(id) ON DELETE CASCADE,
    connection_type TEXT CHECK (connection_type IN ('related', 'prerequisite', 'refines')),
    strength FLOAT CHECK (strength >= 0 AND strength <= 10) DEFAULT 1.0,
    bidirectional BOOLEAN DEFAULT FALSE,
    context TEXT,
    emergent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: note_versions
CREATE TABLE IF NOT EXISTS note_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
CREATE INDEX IF NOT EXISTS idx_connections_note_from ON connections(note_from);
CREATE INDEX IF NOT EXISTS idx_connections_note_to ON connections(note_to);
CREATE INDEX IF NOT EXISTS idx_note_versions_note_id ON note_versions(note_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 