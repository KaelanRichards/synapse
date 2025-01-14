import { SupabaseClient } from '@supabase/supabase-js';
import {
  BaseNote,
  CreateNoteInput,
  UpdateNoteInput,
  CreateNoteInputSchema,
  UpdateNoteInputSchema,
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
    if (error instanceof Error) {
      throw new NoteServiceError(message, 'UNKNOWN_ERROR', error);
    }
    throw new NoteServiceError(message, 'UNKNOWN_ERROR');
  }

  async createNote(input: CreateNoteInput): Promise<BaseNote> {
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

  async updateNote(input: UpdateNoteInput): Promise<BaseNote> {
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

  async getNote(noteId: string): Promise<BaseNote> {
    try {
      const { data, error } = await this.supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch note');
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
