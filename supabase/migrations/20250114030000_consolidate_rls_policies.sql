-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create their own notes" ON notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
DROP POLICY IF EXISTS "Users can view versions of their notes" ON note_versions;
DROP POLICY IF EXISTS "Users can create versions of their notes" ON note_versions;
DROP POLICY IF EXISTS "System can create note versions" ON note_versions;
DROP POLICY IF EXISTS "Users can create connections for their notes" ON connections;
DROP POLICY IF EXISTS "Users can view connections for their notes" ON connections;
DROP POLICY IF EXISTS "Users can update connections for their notes" ON connections;
DROP POLICY IF EXISTS "Users can delete connections for their notes" ON connections;
DROP POLICY IF EXISTS "Users can create their own tags" ON tags;
DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;
DROP POLICY IF EXISTS "Users can manage note tags for their notes" ON note_tags;
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- Enable RLS on all tables if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes' AND rowsecurity = true) THEN
        ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'note_versions' AND rowsecurity = true) THEN
        ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections' AND rowsecurity = true) THEN
        ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tags' AND rowsecurity = true) THEN
        ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'note_tags' AND rowsecurity = true) THEN
        ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_settings' AND rowsecurity = true) THEN
        ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Notes policies with enhanced security
CREATE POLICY "Users can create their own notes" ON notes
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

-- Note versions policies
CREATE POLICY "Users can view versions of their notes" ON note_versions
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = note_versions.note_id
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions of their notes" ON note_versions
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = note_versions.note_id
            AND notes.user_id = auth.uid()
        )
    );

-- Connections policies
CREATE POLICY "Users can create connections for their notes" ON connections
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = connections.note_from
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view connections for their notes" ON connections
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = connections.note_from
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update connections for their notes" ON connections
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = connections.note_from
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete connections for their notes" ON connections
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = connections.note_from
            AND notes.user_id = auth.uid()
        )
    );

-- Tags policies
CREATE POLICY "Users can create their own tags" ON tags
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can view their own tags" ON tags
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can update their own tags" ON tags
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own tags" ON tags
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

-- Note tags policies
CREATE POLICY "Users can manage note tags for their notes" ON note_tags
    FOR ALL 
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = note_tags.note_id
            AND notes.user_id = auth.uid()
        )
    );

-- User settings policies
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    ); 