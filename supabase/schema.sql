-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    maturityState TEXT CHECK (maturityState IN ('SEED', 'SAPLING', 'GROWTH', 'MATURE', 'EVOLVING')) DEFAULT 'SEED',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW(),
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noteFrom UUID REFERENCES notes(id) ON DELETE CASCADE,
    noteTo UUID REFERENCES notes(id) ON DELETE CASCADE,
    connectionType TEXT CHECK (connectionType IN ('related', 'prerequisite', 'refines')),
    strength FLOAT DEFAULT 1.0,
    bidirectional BOOLEAN DEFAULT FALSE,
    context TEXT,
    emergent BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.noteVersions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noteId UUID REFERENCES notes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    versionNumber INT NOT NULL,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noteVersions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE
    USING (auth.uid() = userId);

-- Connection policies
CREATE POLICY "Users can view their own connections" ON public.connections
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own connections" ON public.connections
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users can update their own connections" ON public.connections
    FOR UPDATE
    USING (auth.uid() = userId);

CREATE POLICY "Users can delete their own connections" ON public.connections
    FOR DELETE
    USING (auth.uid() = userId);

-- Version policies
CREATE POLICY "Users can view their own note versions" ON public.noteVersions
    FOR SELECT
    USING (auth.uid() = userId);

CREATE POLICY "Users can insert their own note versions" ON public.noteVersions
    FOR INSERT
    WITH CHECK (auth.uid() = userId);

-- Create indexes
CREATE INDEX IF NOT EXISTS notes_userId_idx ON public.notes(userId);
CREATE INDEX IF NOT EXISTS connections_userId_idx ON public.connections(userId);
CREATE INDEX IF NOT EXISTS noteVersions_userId_idx ON public.noteVersions(userId);
CREATE INDEX IF NOT EXISTS connections_noteFrom_idx ON public.connections(noteFrom);
CREATE INDEX IF NOT EXISTS connections_noteTo_idx ON public.connections(noteTo);
CREATE INDEX IF NOT EXISTS noteVersions_noteId_idx ON public.noteVersions(noteId);
CREATE INDEX IF NOT EXISTS notes_createdAt_idx ON public.notes(createdAt DESC);
CREATE INDEX IF NOT EXISTS connections_createdAt_idx ON public.connections(createdAt DESC);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 