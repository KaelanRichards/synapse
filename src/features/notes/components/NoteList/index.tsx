import { useState } from 'react';
import { NoteListItem } from './NoteListItem';
import { SortControls } from './SortControls';
import { QueryErrorBoundary } from '@/shared/components/QueryErrorBoundary';
import { SortField, SortOrder, Note } from '../../types/schema';

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
}

export function NoteList({ notes, isLoading }: NoteListProps) {
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortField === 'title') {
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    const dateA = new Date(a[sortField]).getTime();
    const dateB = new Date(b[sortField]).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <QueryErrorBoundary>
      <div className="space-y-4">
        <SortControls
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
        <div className="space-y-2">
          {sortedNotes.map(note => (
            <NoteListItem key={note.id} note={note} />
          ))}
          {sortedNotes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No notes yet. Create your first note!
            </div>
          )}
        </div>
      </div>
    </QueryErrorBoundary>
  );
}
