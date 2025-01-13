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

-- Create a type for the note order updates
CREATE TYPE note_order_update AS (
    id UUID,
    new_order INTEGER
);

-- Create a function to handle batch updates of note orders
CREATE OR REPLACE FUNCTION batch_update_note_orders(note_updates note_order_update[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Perform all updates in a single transaction
    FOR i IN 1..array_length(note_updates, 1) LOOP
        UPDATE notes
        SET display_order = (note_updates[i]).new_order
        WHERE id = (note_updates[i]).id;
    END LOOP;
END;
$$; 