export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all] as const,
  list: (filters: Record<string, unknown>) =>
    [...noteKeys.lists(), { ...filters }] as const,
  details: () => ['note'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
} as const;
