import React from 'react';
import { createPortal } from 'react-dom';
import { VirtualTextarea } from './VirtualTextarea';
import { FloatingFormatToolbar } from './FloatingFormatToolbar';
import type { Command, Selection } from './types';

interface EditorContainerProps {
  content: string;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  commands: Map<string, Command>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSelectionChange: (selection: Selection | null) => void;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({
  content,
  showToolbar,
  toolbarPosition,
  commands,
  textareaRef,
  onContentChange,
  onSelectionChange,
}) => {
  const [portalContainer, setPortalContainer] =
    React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  return (
    <div className="relative flex-1 overflow-auto">
      <VirtualTextarea
        content={content}
        onChange={onContentChange}
        onSelect={onSelectionChange}
        textareaRef={textareaRef}
      />

      {/* Portal the toolbar to the document body */}
      {showToolbar &&
        portalContainer &&
        createPortal(
          <FloatingFormatToolbar
            position={toolbarPosition}
            commands={commands}
          />,
          portalContainer
        )}
    </div>
  );
};
