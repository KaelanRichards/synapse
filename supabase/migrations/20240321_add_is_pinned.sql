-- Add is_pinned column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Create index for better query performance on is_pinned
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON notes
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert access for authenticated users" ON notes
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update access for authenticated users" ON notes
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL); 