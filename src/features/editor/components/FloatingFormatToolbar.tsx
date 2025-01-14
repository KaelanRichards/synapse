import { BoldIcon, ItalicIcon, UnderlineIcon, CodeIcon } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { $getSelection, $isRangeSelection, TextFormatType } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { formatText, isFormatActive } from '../utils/formatHandlers';

export function FloatingFormatToolbar() {
  const { editor, isEditorFocused, activeFormats } = useEditorStore();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updateToolbarPosition = useCallback(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar || !editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    toolbar.style.position = 'fixed';
    toolbar.style.top = `${rect.top - toolbar.offsetHeight - 8}px`;
    toolbar.style.left = `${rect.left + rect.width / 2 - toolbar.offsetWidth / 2}px`;
  }, [editor]);

  useEffect(() => {
    if (isEditorFocused) {
      const selection = editor?.getEditorState().read($getSelection);
      if (
        selection &&
        !$isRangeSelection(selection) &&
        !selection.isCollapsed()
      ) {
        updateToolbarPosition();
      }
    }
  }, [isEditorFocused, editor, updateToolbarPosition]);

  if (!editor || !isEditorFocused) {
    return null;
  }

  const selection = editor.getEditorState().read($getSelection);
  if (!$isRangeSelection(selection) || selection.isCollapsed()) {
    return null;
  }

  const handleFormat = (format: TextFormatType) => {
    formatText(editor, format);
  };

  const formatButtons = [
    { icon: BoldIcon, format: 'bold' as TextFormatType },
    { icon: ItalicIcon, format: 'italic' as TextFormatType },
    { icon: UnderlineIcon, format: 'underline' as TextFormatType },
    { icon: CodeIcon, format: 'code' as TextFormatType },
  ];

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      {formatButtons.map(({ icon: Icon, format }) => (
        <Button
          key={format}
          size="sm"
          variant={isFormatActive(activeFormats, format) ? 'primary' : 'ghost'}
          onClick={() => handleFormat(format)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
