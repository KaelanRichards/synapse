import { BoldIcon, ItalicIcon, UnderlineIcon, CodeIcon } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  TextFormatType,
} from 'lexical';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';

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

  const formatHandler = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const isFormatActive = (format: TextFormatType) => {
    return activeFormats.has(format);
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
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
        variant={isFormatActive('code') ? 'primary' : 'ghost'}
        onClick={() => formatHandler('code')}
      >
        <CodeIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
