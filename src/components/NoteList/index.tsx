import React from 'react';
import { Alert } from '@/components/ui';
import { useNoteList } from '@/hooks/useNoteList';
import {
  LoadingSkeleton,
  SearchBar,
  FilterBar,
  NoteListContent,
} from './components';

export default function NoteList() {
  const {
    notes,
    isLoading,
    error,
    filters: {
      selectedMaturity,
      setSelectedMaturity,
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
      showFilters,
      setShowFilters,
    },
    actions: { handleTogglePin, handleUpdateDisplayOrder },
  } = useNoteList();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <Alert variant="error">Failed to load notes</Alert>;

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <FilterBar
          maturityValue={selectedMaturity}
          onMaturityChange={setSelectedMaturity}
          sortValue={sortBy}
          onSortChange={setSortBy}
        />
      )}

      <NoteListContent
        notes={notes}
        sortBy={sortBy}
        onTogglePin={handleTogglePin}
        onUpdateDisplayOrder={handleUpdateDisplayOrder}
      />
    </div>
  );
}
