-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create enum types for connection types
CREATE TYPE connection_type AS ENUM (
  'related',
  'prerequisite',
  'refines'
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  content JSONB NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_content CHECK (jsonb_typeof(content) = 'object')
);

-- Create indexes for notes
CREATE INDEX idx_notes_title_trgm ON notes USING GIN (title gin_trgm_ops);
CREATE INDEX idx_notes_content ON notes USING GIN (content);
CREATE INDEX idx_notes_display_order ON notes (display_order);
CREATE INDEX idx_notes_created_at ON notes (created_at DESC);
CREATE INDEX idx_notes_user_id ON notes (user_id);

-- Note versions table for version history
CREATE TABLE note_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(note_id, version_number)
);

-- Create index for note versions
CREATE INDEX idx_note_versions_note_id ON note_versions (note_id);

-- Connections table for note relationships
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_from UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  note_to UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  connection_type connection_type NOT NULL,
  strength FLOAT NOT NULL CHECK (strength >= 0 AND strength <= 10) DEFAULT 1.0,
  bidirectional BOOLEAN NOT NULL DEFAULT false,
  context TEXT,
  emergent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(note_from, note_to, connection_type)
);

-- Create indexes for connections
CREATE INDEX idx_connections_note_from ON connections (note_from);
CREATE INDEX idx_connections_note_to ON connections (note_to);
CREATE INDEX idx_connections_type ON connections (connection_type);

-- Tags table for note categorization
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL UNIQUE CHECK (char_length(name) > 0),
  color TEXT CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_user_id ON tags (user_id);

-- Note tags junction table
CREATE TABLE note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (note_id, tag_id)
);

-- Create index for note tags
CREATE INDEX idx_note_tags_tag_id ON note_tags (tag_id);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  font_size INTEGER NOT NULL DEFAULT 16,
  line_spacing FLOAT NOT NULL DEFAULT 1.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Notes policies
CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Note versions policies
CREATE POLICY "Users can view versions of their notes" ON note_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_versions.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their notes" ON note_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_versions.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create note versions" ON note_versions
  FOR INSERT WITH CHECK (true);

-- Connections policies
CREATE POLICY "Users can create connections for their notes" ON connections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = connections.note_from
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view connections for their notes" ON connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = connections.note_from
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update connections for their notes" ON connections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = connections.note_from
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete connections for their notes" ON connections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = connections.note_from
      AND notes.user_id = auth.uid()
    )
  );

-- Tags policies
CREATE POLICY "Users can create their own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- Note tags policies
CREATE POLICY "Users can manage note tags for their notes" ON note_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- User settings policies
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create note version on content update
CREATE OR REPLACE FUNCTION create_note_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO note_versions (note_id, version_number, content)
    SELECT NEW.id,
           COALESCE((SELECT MAX(version_number) FROM note_versions WHERE note_id = NEW.id), 0) + 1,
           NEW.content;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create version history
CREATE TRIGGER create_note_version_on_update
  AFTER UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION create_note_version();

-- Function to automatically create bidirectional connection
CREATE OR REPLACE FUNCTION create_bidirectional_connection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bidirectional THEN
    INSERT INTO connections (
      note_from,
      note_to,
      connection_type,
      strength,
      bidirectional,
      context,
      emergent
    )
    VALUES (
      NEW.note_to,
      NEW.note_from,
      NEW.connection_type,
      NEW.strength,
      NEW.bidirectional,
      NEW.context,
      NEW.emergent
    )
    ON CONFLICT (note_from, note_to, connection_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create bidirectional connections
CREATE TRIGGER create_bidirectional_connection_on_insert
  AFTER INSERT ON connections
  FOR EACH ROW
  EXECUTE FUNCTION create_bidirectional_connection(); 