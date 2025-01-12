-- Create tables
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    maturity_state TEXT CHECK (maturity_state IN ('SEED', 'SAPLING', 'GROWTH', 'MATURE', 'EVOLVING')) DEFAULT 'SEED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_from UUID REFERENCES notes(id) ON DELETE CASCADE,
    note_to UUID REFERENCES notes(id) ON DELETE CASCADE,
    connection_type TEXT CHECK (connection_type IN ('related', 'prerequisite', 'refines')),
    strength FLOAT CHECK (strength >= 0 AND strength <= 10) DEFAULT 1.0,
    bidirectional BOOLEAN DEFAULT FALSE,
    context TEXT,
    emergent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.note_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Connection policies
CREATE POLICY "Users can view their own connections" ON public.connections
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" ON public.connections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON public.connections
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON public.connections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Version policies
CREATE POLICY "Users can view their own note versions" ON public.note_versions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note versions" ON public.note_versions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note versions" ON public.note_versions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note versions" ON public.note_versions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS connections_user_id_idx ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS note_versions_user_id_idx ON public.note_versions(user_id);
CREATE INDEX IF NOT EXISTS connections_note_from_idx ON public.connections(note_from);
CREATE INDEX IF NOT EXISTS connections_note_to_idx ON public.connections(note_to);
CREATE INDEX IF NOT EXISTS note_versions_note_id_idx ON public.note_versions(note_id); 