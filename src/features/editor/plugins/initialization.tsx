import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor } from 'lexical';

interface EditorInitializationPluginProps {
  onInit: (editor: LexicalEditor) => void;
}

export function EditorInitializationPlugin({
  onInit,
}: EditorInitializationPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    onInit(editor);
  }, [editor, onInit]);

  return null;
}
