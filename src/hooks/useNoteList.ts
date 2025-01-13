import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import type { Note, MaturityFilter, SortOption } from '@/types/notes';

export function useNoteList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  // Filter state
  const [selectedMaturity, setSelectedMaturity] =
    useState<MaturityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('manual');
  const [showFilters, setShowFilters] = useState(false);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: 'is_pinned = true OR is_pinned = false',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['notes', selectedMaturity],
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase, selectedMaturity]);

  // Fetch notes
  const {
    data: notes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes', selectedMaturity],
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select('*')
        .order('display_order', { ascending: true });

      if (selectedMaturity !== 'ALL') {
        query = query.eq('maturity_state', selectedMaturity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Note actions
  const actions = {
    handleTogglePin: async (noteId: string) => {
      const note = notes?.find(n => n.id === noteId);
      if (!note || !notes) return;

      // Optimistically update the cache
      const updatedNote = { ...note, is_pinned: !note.is_pinned };
      const updatedNotes = notes.map(n => (n.id === noteId ? updatedNote : n));
      queryClient.setQueryData(['notes', selectedMaturity], updatedNotes);

      try {
        const { error } = await supabase
          .from('notes')
          .update({ is_pinned: !note.is_pinned })
          .eq('id', noteId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Failed to toggle pin:', error);
        queryClient.setQueryData(['notes', selectedMaturity], notes);
      }
    },

    handleUpdateDisplayOrder: async (oldIndex: number, newIndex: number) => {
      if (!notes) return;

      const newNotes = [...notes];
      const [movedNote] = newNotes.splice(oldIndex, 1);
      newNotes.splice(newIndex, 0, movedNote);

      // Calculate new display orders with larger gaps
      const updatedNotes = newNotes.map((note, index) => ({
        ...note,
        display_order: (index + 1) * 1000,
      }));

      // Update the cache optimistically
      queryClient.setQueryData(['notes', selectedMaturity], updatedNotes);

      try {
        // Update all notes in a single transaction using individual updates
        const promises = updatedNotes.map(note =>
          supabase
            .from('notes')
            .update({ display_order: note.display_order })
            .eq('id', note.id)
        );

        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) {
          console.error('Some updates failed:', errors);
          queryClient.setQueryData(['notes', selectedMaturity], notes);
        }
      } catch (error) {
        console.error('Failed to update note orders:', error);
        queryClient.setQueryData(['notes', selectedMaturity], notes);
      }
    },
  };

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'maturity':
        const maturityOrder = [
          'SEED',
          'SAPLING',
          'GROWTH',
          'MATURE',
          'EVOLVING',
        ];
        filtered.sort(
          (a, b) =>
            maturityOrder.indexOf(a.maturity_state) -
            maturityOrder.indexOf(b.maturity_state)
        );
        break;
      case 'manual':
        filtered.sort((a, b) => a.display_order - b.display_order);
        break;
    }

    return filtered;
  }, [notes, searchQuery, sortBy]);

  return {
    notes: filteredNotes,
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
    actions,
  };
}
