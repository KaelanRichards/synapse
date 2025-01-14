import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  CodeIcon,
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { TextFormatType } from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { Button } from '@/shared/components/ui/Button';
import { formatText, isFormatActive } from '../utils/formatHandlers';
import { SavingIndicator } from './SavingIndicator';

interface EditorToolbarProps {
  isSaving?: boolean;
}

export function EditorToolbar({ isSaving }: EditorToolbarProps) {
  const { editor, activeFormats } = useEditorStore();

  if (!editor) {
    return null;
  }

  const handleFormat = (e: React.MouseEvent, format: TextFormatType) => {
    e.preventDefault();
    e.stopPropagation();
    formatText(editor, format);
  };

  const handleList = (
    e: React.MouseEvent,
    command:
      | typeof INSERT_ORDERED_LIST_COMMAND
      | typeof INSERT_UNORDERED_LIST_COMMAND
  ) => {
    e.preventDefault();
    e.stopPropagation();
    editor.focus();
    editor.dispatchCommand(command, undefined);
  };

  const formatButtons = [
    { icon: BoldIcon, format: 'bold' as TextFormatType },
    { icon: ItalicIcon, format: 'italic' as TextFormatType },
    { icon: UnderlineIcon, format: 'underline' as TextFormatType },
    { icon: CodeIcon, format: 'code' as TextFormatType },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 p-2">
      <div className="flex items-center gap-1">
        {formatButtons.map(({ icon: Icon, format }) => (
          <Button
            key={format}
            size="sm"
            variant={
              isFormatActive(activeFormats, format) ? 'primary' : 'ghost'
            }
            onClick={e => handleFormat(e, format)}
            onMouseDown={e => e.preventDefault()}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <Button
          size="sm"
          variant="ghost"
          onClick={e => handleList(e, INSERT_UNORDERED_LIST_COMMAND)}
          onMouseDown={e => e.preventDefault()}
        >
          <ListIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={e => handleList(e, INSERT_ORDERED_LIST_COMMAND)}
          onMouseDown={e => e.preventDefault()}
        >
          <ListOrderedIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="min-w-[150px] flex justify-end items-center opacity-100">
        <SavingIndicator />
      </div>
    </div>
  );
}
