import { z } from 'zod';

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

// Maturity State Schema
export const NoteMaturityStateSchema = z.enum([
  'SEED',
  'SAPLING',
  'GROWTH',
  'MATURE',
  'EVOLVING',
]);

// Connection Type Schema
export const ConnectionTypeSchema = z.enum([
  'related',
  'prerequisite',
  'refines',
]);

// Base Note Schema
export const BaseNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  content: NoteContentSchema,
  maturity_state: NoteMaturityStateSchema,
  is_pinned: z.boolean().default(false),
  display_order: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string().uuid(),
});

// Connection Schema
export const ConnectionSchema = z.object({
  id: z.string().uuid(),
  note_from: z.string().uuid(),
  note_to: z.string().uuid(),
  connection_type: ConnectionTypeSchema,
  strength: z.number().min(0).max(10),
  bidirectional: z.boolean().default(false),
  context: z.string().optional(),
  emergent: z.boolean().default(false),
  created_at: z.string().datetime(),
});

// Note with Connections Schema
export const NoteWithConnectionsSchema = BaseNoteSchema.extend({
  connections: z.array(ConnectionSchema),
});

// Create Note Input Schema
export const CreateNoteInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: NoteContentSchema,
  maturity_state: NoteMaturityStateSchema.optional().default('SEED'),
  is_pinned: z.boolean().optional().default(false),
  display_order: z.number().optional(),
});

// Update Note Input Schema
export const UpdateNoteInputSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').optional(),
  content: NoteContentSchema.optional(),
  maturity_state: NoteMaturityStateSchema.optional(),
  is_pinned: z.boolean().optional(),
  display_order: z.number().optional(),
});

// Export inferred types
export type EditorState = z.infer<typeof EditorStateSchema>;
export type NoteContent = z.infer<typeof NoteContentSchema>;
export type NoteMaturityState = z.infer<typeof NoteMaturityStateSchema>;
export type ConnectionType = z.infer<typeof ConnectionTypeSchema>;
export type BaseNote = z.infer<typeof BaseNoteSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type NoteWithConnections = z.infer<typeof NoteWithConnectionsSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteInputSchema>;
