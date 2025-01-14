import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import useEditorStore from '@/store/editorStore';

export function FormattingPlugin() {
  const [editor] = useLexicalComposerContext();
  const { setActiveFormats } = useEditorStore();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setActiveFormats(new Set());
          return;
        }

        const formats = new Set<string>();
        if (selection.hasFormat('bold')) formats.add('bold');
        if (selection.hasFormat('italic')) formats.add('italic');
        if (selection.hasFormat('underline')) formats.add('underline');
        if (selection.hasFormat('strikethrough')) formats.add('strikethrough');

        setActiveFormats(formats);
      });
    });
  }, [editor, setActiveFormats]);

  return null;
}

export const formatText = (editor: any, format: string) => {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
};
