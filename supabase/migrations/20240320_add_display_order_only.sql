-- Add display_order column to notes table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notes' AND column_name = 'display_order') THEN
        ALTER TABLE notes ADD COLUMN display_order SERIAL;
        
        -- Create an index on display_order for faster sorting
        CREATE INDEX idx_notes_display_order ON notes(display_order);
        
        -- Initialize display_order based on created_at
        UPDATE notes SET display_order = t.row_num
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM notes
        ) t
        WHERE notes.id = t.id;
    END IF;
END $$; 