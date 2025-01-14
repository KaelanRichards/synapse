-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "System can create note versions" ON note_versions;

-- Recreate policies with correct permissions
CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create note versions" ON note_versions
  FOR INSERT WITH CHECK (true);
