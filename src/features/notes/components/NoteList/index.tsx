import { useNoteList } from '../../hooks/useNoteList';
import { NoteListItem, NoteListSkeleton } from './components';

export default function NoteList() {
  const { notes, isLoading } = useNoteList();

  if (isLoading) {
    return <NoteListSkeleton />;
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {notes.map(note => (
        <NoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
}
