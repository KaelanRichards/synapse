import { SupabaseClient } from '@supabase/supabase-js';
import {
  BaseNote,
  NoteWithConnections,
  CreateNoteInput,
  UpdateNoteInput,
  CreateNoteInputSchema,
  UpdateNoteInputSchema,
  NoteWithConnectionsSchema,
} from '../types/schema';

export class NoteServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NoteServiceError';
  }
}

export class NoteService {
  constructor(private supabase: SupabaseClient) {}

  private handleError(error: unknown, message: string): never {
    console.error('Note service error:', error);
    if (error instanceof Error) {
      throw new NoteServiceError(message, 'OPERATION_FAILED', error);
    }
    throw new NoteServiceError(message, 'UNKNOWN_ERROR', error);
  }

  async createNote(input: CreateNoteInput): Promise<BaseNote> {
    try {
      // Validate input
      const validatedInput = CreateNoteInputSchema.parse(input);

      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) {
        throw new NoteServiceError('User not authenticated', 'UNAUTHORIZED');
      }

      const { data, error } = await this.supabase
        .from('notes')
        .insert([
          {
            user_id: user.user.id,
            ...validatedInput,
            display_order: validatedInput.display_order || Date.now(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as BaseNote;
    } catch (error) {
      this.handleError(error, 'Failed to create note');
    }
  }

  async updateNote(input: UpdateNoteInput): Promise<void> {
    try {
      // Validate input
      const validatedInput = UpdateNoteInputSchema.parse(input);

      const { error } = await this.supabase
        .from('notes')
        .update({
          title: validatedInput.title,
          content: validatedInput.content,
          maturity_state: validatedInput.maturity_state,
          is_pinned: validatedInput.is_pinned,
          display_order: validatedInput.display_order,
        })
        .eq('id', validatedInput.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      this.handleError(error, 'Failed to update note');
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        throw error;
      }
    } catch (error) {
      this.handleError(error, 'Failed to delete note');
    }
  }

  async getNoteWithConnections(noteId: string): Promise<NoteWithConnections> {
    try {
      const { data: note, error: noteError } = await this.supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (noteError) {
        throw noteError;
      }

      const { data: connections, error: connectionsError } = await this.supabase
        .from('connections')
        .select('*')
        .eq('note_from', noteId);

      if (connectionsError) {
        throw connectionsError;
      }

      const noteWithConnections = {
        ...note,
        connections: connections || [],
      };

      // Validate response
      return NoteWithConnectionsSchema.parse(noteWithConnections);
    } catch (error) {
      this.handleError(error, 'Failed to fetch note with connections');
    }
  }

  async getNotes(): Promise<BaseNote[]> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) {
        throw new NoteServiceError('User not authenticated', 'UNAUTHORIZED');
      }

      const { data, error } = await this.supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data as BaseNote[];
    } catch (error) {
      this.handleError(error, 'Failed to fetch notes');
    }
  }
}
