import { useState } from 'react';
import { Note } from '../../types/schema';
import { SortField, SortOrder } from './types';
import {
  SearchBar,
  SortControls,
  NoteListItem,
  NoteListSkeleton,
} from './components';

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
}

function NoteList({ notes = [], isLoading }: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  if (isLoading) {
    return <NoteListSkeleton />;
  }

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.text.toLowerCase().includes(searchLower)
    );
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortField === 'title') {
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    const dateA = new Date(a[sortField]).getTime();
    const dateB = new Date(b[sortField]).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <SortControls
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {sortedNotes.map(note => (
          <NoteListItem key={note.id} note={note} />
        ))}
        {sortedNotes.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'No notes found matching your search'
              : 'No notes yet. Create your first note!'}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteList;
