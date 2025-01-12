import { useRouter } from 'next/router';
import { useNote } from '@/hooks/useNote';
import NoteGraph from '@/components/NoteGraph';

export default function NotePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: note, error, isLoading } = useNote(id as string);

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  if (!note) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{note.title}</h1>
          <div className="mt-4 bg-white rounded-lg shadow p-6">
            <div className="prose max-w-none">{note.content}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Knowledge Graph</h2>
          <div className="h-[500px] w-full">
            <NoteGraph noteId={note.id} />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Connections</h2>
          <div className="space-y-4">
            {note.connections.map(connection => (
              <div
                key={connection.id}
                className="border rounded p-4 hover:bg-gray-50"
              >
                <div className="font-medium">{connection.connection_type}</div>
                <div className="text-sm text-gray-500">
                  {connection.context}
                </div>
                <div className="mt-2 text-sm">
                  Strength: {connection.strength}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
