import { SupabaseClient } from '@supabase/supabase-js';
import {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  CreateNoteInputSchema,
  UpdateNoteInputSchema,
} from '../types/schema';

export type NoteServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'UNKNOWN_ERROR';

export class NoteServiceError extends Error {
  constructor(
    message: string,
    public code: NoteServiceErrorCode,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NoteServiceError';
  }
}

export class NoteService {
  constructor(private supabase: SupabaseClient) {}

  private handleError(error: unknown, defaultMessage: string): never {
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        throw new NoteServiceError(error.message, 'VALIDATION_ERROR', error);
      }
      if (error.message.includes('not found')) {
        throw new NoteServiceError(error.message, 'NOT_FOUND', error);
      }
      if (error.message.includes('unauthorized')) {
        throw new NoteServiceError(error.message, 'UNAUTHORIZED', error);
      }
      if (error.message.includes('database')) {
        throw new NoteServiceError(error.message, 'DATABASE_ERROR', error);
      }
    }
    throw new NoteServiceError(defaultMessage, 'UNKNOWN_ERROR', error);
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    try {
      const validatedInput = CreateNoteInputSchema.parse(input);
      const { data, error } = await this.supabase
        .from('notes')
        .insert([validatedInput])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to create note');
    }
  }

  async updateNote(input: UpdateNoteInput): Promise<Note> {
    try {
      const validatedInput = UpdateNoteInputSchema.parse(input);
      const { data, error } = await this.supabase
        .from('notes')
        .update(validatedInput)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NoteServiceError('Note not found', 'NOT_FOUND');
      }

      return data;
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

  async getNote(noteId: string): Promise<Note> {
    try {
      const { data, error } = await this.supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new NoteServiceError('Note not found', 'NOT_FOUND');
      }

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch note');
    }
  }

  async getNotes(): Promise<Note[]> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      if (!user.user) {
        throw new NoteServiceError('User not authenticated', 'UNAUTHORIZED');
      }

      const { data, error } = await this.supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('display_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Note[];
    } catch (error) {
      this.handleError(error, 'Failed to fetch notes');
    }
  }
}
