import type { NextPage } from 'next';
import NoteEditor from '@/components/NoteEditor';

const NewNote: NextPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Create New Note</h1>
        <p className="mt-2 text-sm text-gray-600">
          Start building your knowledge graph by creating a new note.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <NoteEditor />
        </div>
      </div>
    </div>
  );
};

export default NewNote;
