-- Drop the existing function and type if they exist
DROP FUNCTION IF EXISTS batch_update_note_orders;
DROP TYPE IF EXISTS note_order_update;

-- Create the type for note updates
CREATE TYPE note_order_update AS (
    id UUID,
    new_order INTEGER
);

-- Create the function with better error handling and validation
CREATE OR REPLACE FUNCTION batch_update_note_orders(note_updates note_order_update[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    update_record note_order_update;
BEGIN
    -- Validate input
    IF array_length(note_updates, 1) IS NULL THEN
        RAISE EXCEPTION 'Empty updates array provided';
    END IF;

    -- Start transaction
    BEGIN
        -- Process each update
        FOREACH update_record IN ARRAY note_updates
        LOOP
            -- Validate note exists
            IF NOT EXISTS (SELECT 1 FROM notes WHERE id = update_record.id) THEN
                RAISE EXCEPTION 'Note with id % not found', update_record.id;
            END IF;

            -- Update the note
            UPDATE notes
            SET 
                display_order = update_record.new_order,
                updated_at = NOW()
            WHERE id = update_record.id;

            -- Verify update
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Failed to update note with id %', update_record.id;
            END IF;
        END LOOP;

        -- Commit transaction
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        -- Rollback on any error
        ROLLBACK;
        RAISE;
    END;
END;
$$;
