import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useApiQuery<TData>(
  queryKey: string[],
  options: Omit<UseQueryOptions<TData, Error>, 'queryKey'>
) {
  return useQuery<TData, Error>({
    queryKey,
    ...options,
  });
}
