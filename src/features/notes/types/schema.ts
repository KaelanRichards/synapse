import { z } from 'zod';
import { SerializedEditorState } from 'lexical';

// Editor State Schema
export const EditorStateSchema = z.object({
  type: z.string(),
  content: z.any(),
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
export const BaseNoteSchema = z.object({
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
export const CreateNoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: NoteContentSchema,
  is_pinned: z.boolean().optional().default(false),
  display_order: z.number().optional(),
});

// Update Note Input Schema
export const UpdateNoteInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').optional(),
  content: NoteContentSchema.optional(),
  is_pinned: z.boolean().optional(),
  display_order: z.number().optional(),
});

// Export inferred types
export type EditorState = z.infer<typeof EditorStateSchema>;
export type NoteContent = z.infer<typeof NoteContentSchema>;
export type BaseNote = z.infer<typeof BaseNoteSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.object({
    text: z.string(),
    editorState: z.object({
      type: z.string(),
      content: z.any() as z.ZodType<SerializedEditorState>,
      selection: z
        .object({
          anchor: z.number(),
          focus: z.number(),
          type: z.string(),
        })
        .optional(),
    }),
  }),
});