export function NoteListSkeleton() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-4 sm:px-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="mt-2 space-y-2">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
