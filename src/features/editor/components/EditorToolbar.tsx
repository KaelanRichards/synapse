import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  CodeIcon,
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  TextFormatType,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { Button } from '@/shared/components/ui/Button';

interface EditorToolbarProps {
  isSaving?: boolean;
}

export function EditorToolbar({ isSaving }: EditorToolbarProps) {
  const { editor, activeFormats } = useEditorStore();

  if (!editor) {
    return null;
  }

  const formatHandler = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const isFormatActive = (format: TextFormatType) => {
    return activeFormats.has(format);
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 p-2">
      <Button
        size="sm"
        variant={isFormatActive('bold') ? 'primary' : 'ghost'}
        onClick={() => formatHandler('bold')}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={isFormatActive('italic') ? 'primary' : 'ghost'}
        onClick={() => formatHandler('italic')}
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={isFormatActive('underline') ? 'primary' : 'ghost'}
        onClick={() => formatHandler('underline')}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        <ListIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={isFormatActive('code') ? 'primary' : 'ghost'}
        onClick={() => formatHandler('code')}
      >
        <CodeIcon className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {isSaving && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Saving...
        </span>
      )}
    </div>
  );
}
