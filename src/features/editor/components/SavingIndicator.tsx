import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { Spinner } from '@/shared/components/ui/Spinner';
import { AlertCircle, Check } from 'lucide-react';

export function SavingIndicator() {
  const { isSaving, error, lastSavedAt } = useEditorStore();

  if (error) {
    return (
      <div className="flex items-center gap-2 px-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to save</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
        <Spinner size="sm" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4" />
        <span>Saved {formatLastSaved(lastSavedAt)}</span>
      </div>
    );
  }

  return null;
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) {
    return 'just now';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  return date.toLocaleTimeString();
}
