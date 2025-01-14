import { z } from 'zod';
import { SerializedEditorState } from 'lexical';

// Editor State Schema
export const EditorStateSchema = z.object({
  type: z.string(),
  content: z.custom<SerializedEditorState>(),
  selection: z
    .object({
      anchor: z.number(),
      focus: z.number(),
      type: z.string(),
    })
    .optional(),
});

// Note Content Schema
export const NoteContentSchema = z.object({
  text: z.string(),
  editorState: EditorStateSchema,
});

// Base Note Schema
export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content: NoteContentSchema,
  is_pinned: z.boolean().default(false),
  display_order: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string().uuid(),
});

// Create Note Input Schema
export const CreateNoteInputSchema = NoteSchema.pick({
  title: true,
  content: true,
  is_pinned: true,
  display_order: true,
});

// Update Note Input Schema
export const UpdateNoteInputSchema = NoteSchema.pick({
  id: true,
}).and(
  NoteSchema.pick({
    title: true,
    content: true,
    is_pinned: true,
    display_order: true,
  }).partial()
);

// Export inferred types
export type EditorState = z.infer<typeof EditorStateSchema>;
export type NoteContent = z.infer<typeof NoteContentSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;

export type SortField = 'updated_at' | 'title' | 'created_at';
export type SortOrder = 'asc' | 'desc';
