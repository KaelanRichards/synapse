import React, { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  LinkIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import {
  TOGGLE_BOLD_COMMAND,
  TOGGLE_ITALIC_COMMAND,
  TOGGLE_UNDERLINE_COMMAND,
  TOGGLE_CODE_COMMAND,
  TOGGLE_LINK_COMMAND,
} from '../commands';
import { useEditorStore } from '../store/editorStore';

interface FloatingToolbarButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  isActive?: boolean;
  title: string;
}

function FloatingToolbarButton({
  icon: Icon,
  onClick,
  isActive,
  title,
}: FloatingToolbarButtonProps) {
  return (
    <Button
      size="sm"
      variant={isActive ? 'primary' : 'ghost'}
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { isEditorFocused, activeFormats } = useEditorStore();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updateToolbarPosition = useCallback(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar || !editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    toolbar.style.opacity = '1';
    toolbar.style.position = 'fixed';
    toolbar.style.top = `${rect.top - toolbar.offsetHeight - 8}px`;
    toolbar.style.left = `${rect.left + rect.width / 2 - toolbar.offsetWidth / 2}px`;
  }, [editor]);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const updateVisibility = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (
          !isEditorFocused ||
          !selection ||
          !$isRangeSelection(selection) ||
          selection.isCollapsed()
        ) {
          toolbar.style.opacity = '0';
          toolbar.style.pointerEvents = 'none';
        } else {
          toolbar.style.pointerEvents = 'auto';
          updateToolbarPosition();
        }
      });
    };

    const removeUpdateListener =
      editor.registerUpdateListener(updateVisibility);

    return () => {
      removeUpdateListener();
    };
  }, [editor, isEditorFocused, updateToolbarPosition]);

  const formatButtons = [
    {
      icon: BoldIcon,
      command: TOGGLE_BOLD_COMMAND,
      title: 'Bold',
      format: 'bold',
    },
    {
      icon: ItalicIcon,
      command: TOGGLE_ITALIC_COMMAND,
      title: 'Italic',
      format: 'italic',
    },
    {
      icon: UnderlineIcon,
      command: TOGGLE_UNDERLINE_COMMAND,
      title: 'Underline',
      format: 'underline',
    },
    {
      icon: CodeIcon,
      command: TOGGLE_CODE_COMMAND,
      title: 'Code',
      format: 'code',
    },
    {
      icon: LinkIcon,
      command: TOGGLE_LINK_COMMAND,
      title: 'Link',
      format: 'link',
    },
  ];

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-800 dark:bg-gray-900 opacity-0 transition-opacity duration-200"
      style={{ pointerEvents: 'none' }}
    >
      {formatButtons.map(button => (
        <FloatingToolbarButton
          key={button.title}
          icon={button.icon}
          onClick={() => {
            if (button.command === TOGGLE_LINK_COMMAND) {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.dispatchCommand(button.command, { data: { url } });
              }
            } else {
              editor.dispatchCommand(button.command, { data: null });
            }
          }}
          isActive={activeFormats.has(button.format as any)}
          title={button.title}
        />
      ))}
    </div>
  );
}
