import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import useEditorStore from '@/store/editorStore';
import { formatText } from './plugins/FormattingPlugin';

const formatButtons = [
  { format: 'bold', icon: '𝐁' },
  { format: 'italic', icon: '𝐼' },
  { format: 'underline', icon: '𝐔' },
  { format: 'strikethrough', icon: '𝐒' },
];

export const FloatingFormatToolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const { activeFormats } = useEditorStore();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
          setPosition(null);
          return;
        }

        // Get selection rectangle and position toolbar above it
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
          setPosition(null);
          return;
        }

        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();

        setPosition({
          top: rect.top - 40, // Position above selection
          left: rect.left + rect.width / 2, // Center horizontally
        });
      });
    });
  }, [editor]);

  const handleFormatClick = useCallback(
    (format: string) => {
      formatText(editor, format);
    },
    [editor]
  );

  if (!position) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-1 p-1 bg-white border rounded shadow-lg transform -translate-x-1/2"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {formatButtons.map(({ format, icon }) => (
        <button
          key={format}
          onClick={() => handleFormatClick(format)}
          className={`p-1 rounded hover:bg-gray-100 ${
            activeFormats.has(format) ? 'bg-gray-200' : ''
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
