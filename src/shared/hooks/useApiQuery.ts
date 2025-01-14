import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
  QueryFunction,
} from '@tanstack/react-query';
import { APIError } from '../errors/APIError';

type QueryConfig<TData> = Omit<
  UseQueryOptions<TData, APIError, TData, QueryKey>,
  'queryKey'
>;

/**
 * A wrapper around react-query's useQuery hook that provides consistent error handling
 * and type safety for API queries.
 *
 * @param queryKey - The key to use for caching the query result
 * @param config - Configuration options for the query
 */
export function useApiQuery<TData>(
  queryKey: QueryKey,
  config: QueryConfig<TData>
): UseQueryResult<TData, APIError> {
  return useQuery<TData, APIError, TData, QueryKey>({
    queryKey,
    queryFn: async context => {
      try {
        return await (config.queryFn as QueryFunction<TData, QueryKey>)(
          context
        );
      } catch (error) {
        throw APIError.fromError(error);
      }
    },
    ...config,
  });
}

/**
 * Example usage:
 *
 * const { data: note, isLoading, error } = useApiQuery(
 *   ['note', noteId],
 *   {
 *     queryFn: () => noteService.getNoteWithConnections(noteId),
 *     enabled: !!noteId,
 *     onError: (error) => {
 *       toast.error(error.message);
 *     }
 *   }
 * );
 */
