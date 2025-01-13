-- Enable RLS on tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop notes policies
    DROP POLICY IF EXISTS "Allow authenticated users to read notes" ON notes;
    DROP POLICY IF EXISTS "Allow authenticated users to create notes" ON notes;
    DROP POLICY IF EXISTS "Allow authenticated users to update their notes" ON notes;
    DROP POLICY IF EXISTS "Allow authenticated users to delete their notes" ON notes;
    
    -- Drop note_versions policies
    DROP POLICY IF EXISTS "Allow authenticated users to read note versions" ON note_versions;
    DROP POLICY IF EXISTS "Allow authenticated users to create note versions" ON note_versions;
END $$;

-- Create policies for notes table
CREATE POLICY "Allow authenticated users to read notes"
ON notes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their notes"
ON notes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete their notes"
ON notes FOR DELETE
TO authenticated
USING (true);

-- Create policies for note_versions table
CREATE POLICY "Allow authenticated users to read note versions"
ON note_versions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create note versions"
ON note_versions FOR INSERT
TO authenticated
WITH CHECK (true); 