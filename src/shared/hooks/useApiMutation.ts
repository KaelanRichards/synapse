import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { APIError } from '../errors/APIError';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: APIError, variables: TVariables) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: APIError | null,
    variables: TVariables
  ) => void | Promise<void>;
}

/**
 * A wrapper around react-query's useMutation hook that provides consistent error handling
 * and type safety for API mutations.
 */
export function useApiMutation<TData, TVariables>(
  config: MutationConfig<TData, TVariables>
): UseMutationResult<TData, APIError, TVariables> {
  const mutationOptions: UseMutationOptions<TData, APIError, TVariables> = {
    mutationFn: async (variables: TVariables) => {
      try {
        return await config.mutationFn(variables);
      } catch (error) {
        throw APIError.fromError(error);
      }
    },
    onSuccess: async (data, variables) => {
      try {
        await config.onSuccess?.(data, variables);
      } catch (error) {
        console.error('Error in onSuccess handler:', error);
      }
    },
    onError: async (error, variables) => {
      const apiError = APIError.isAPIError(error)
        ? error
        : APIError.fromError(error);
      try {
        await config.onError?.(apiError, variables);
      } catch (handlerError) {
        console.error('Error in onError handler:', handlerError);
      }
    },
    onSettled: async (data, error, variables) => {
      try {
        const apiError = error
          ? APIError.isAPIError(error)
            ? error
            : APIError.fromError(error)
          : null;
        await config.onSettled?.(data, apiError, variables);
      } catch (handlerError) {
        console.error('Error in onSettled handler:', handlerError);
      }
    },
  };

  return useMutation(mutationOptions);
}

/**
 * Example usage:
 *
 * const createNote = useApiMutation({
 *   mutationFn: (input: CreateNoteInput) => noteService.createNote(input),
 *   onSuccess: (newNote) => {
 *     queryClient.setQueryData(['note', newNote.id], newNote);
 *     queryClient.invalidateQueries({ queryKey: ['notes'] });
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 */
