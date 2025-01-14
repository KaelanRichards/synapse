import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { formatText } from './plugins/FormattingPlugin';
import useEditorStore from '@/store/editorStore';

const formatButtons = [
  { format: 'bold', icon: '𝐁', tooltip: 'Bold (⌘B)' },
  { format: 'italic', icon: '𝐼', tooltip: 'Italic (⌘I)' },
  { format: 'underline', icon: '𝐔', tooltip: 'Underline (⌘U)' },
  { format: 'strikethrough', icon: '𝐒', tooltip: 'Strikethrough' },
];

export const EditorToolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const { activeFormats } = useEditorStore();

  return (
    <div className="flex items-center gap-1 p-2 border-b">
      {formatButtons.map(({ format, icon, tooltip }) => (
        <button
          key={format}
          onClick={() => formatText(editor, format)}
          title={tooltip}
          className={`p-2 rounded hover:bg-gray-100 ${
            activeFormats.has(format) ? 'bg-gray-200' : ''
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
