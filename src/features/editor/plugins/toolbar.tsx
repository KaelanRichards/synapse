import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Heading1,
  Heading2,
  Heading3,
  MinusIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import {
  TOGGLE_BOLD_COMMAND,
  TOGGLE_ITALIC_COMMAND,
  TOGGLE_UNDERLINE_COMMAND,
  TOGGLE_CODE_COMMAND,
  TOGGLE_BULLET_LIST_COMMAND,
  TOGGLE_NUMBER_LIST_COMMAND,
  TOGGLE_HEADING_COMMAND,
  TOGGLE_QUOTE_COMMAND,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '../commands';
import { useEditorStore } from '../store/editorStore';

interface ToolbarButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  isActive?: boolean;
  title: string;
}

function ToolbarButton({
  icon: Icon,
  onClick,
  isActive,
  title,
}: ToolbarButtonProps) {
  return (
    <Button
      size="sm"
      variant={isActive ? 'primary' : 'ghost'}
      onClick={onClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

interface HeadingButtonConfig {
  icon: React.ElementType;
  command: typeof TOGGLE_HEADING_COMMAND;
  payload: { level: 1 | 2 | 3 | 4 | 5 | 6 };
  title: string;
  tag: string;
}

interface OtherButtonConfig {
  icon: React.ElementType;
  command:
    | typeof TOGGLE_BOLD_COMMAND
    | typeof TOGGLE_ITALIC_COMMAND
    | typeof TOGGLE_UNDERLINE_COMMAND
    | typeof TOGGLE_CODE_COMMAND
    | typeof TOGGLE_BULLET_LIST_COMMAND
    | typeof TOGGLE_NUMBER_LIST_COMMAND
    | typeof TOGGLE_QUOTE_COMMAND;
  title: string;
  format?: string;
  tag?: string;
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { activeFormats, activeNodes } = useEditorStore();

  const formatButtons: OtherButtonConfig[] = [
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
  ];

  const blockButtons: (HeadingButtonConfig | OtherButtonConfig)[] = [
    {
      icon: Heading1,
      command: TOGGLE_HEADING_COMMAND,
      payload: { level: 1 },
      title: 'Heading 1',
      tag: 'h1',
    },
    {
      icon: Heading2,
      command: TOGGLE_HEADING_COMMAND,
      payload: { level: 2 },
      title: 'Heading 2',
      tag: 'h2',
    },
    {
      icon: Heading3,
      command: TOGGLE_HEADING_COMMAND,
      payload: { level: 3 },
      title: 'Heading 3',
      tag: 'h3',
    },
    {
      icon: QuoteIcon,
      command: TOGGLE_QUOTE_COMMAND,
      title: 'Quote',
      tag: 'quote',
    },
  ];

  const listButtons: OtherButtonConfig[] = [
    {
      icon: ListIcon,
      command: TOGGLE_BULLET_LIST_COMMAND,
      title: 'Bullet List',
      tag: 'ul',
    },
    {
      icon: ListOrderedIcon,
      command: TOGGLE_NUMBER_LIST_COMMAND,
      title: 'Numbered List',
      tag: 'ol',
    },
  ];

  const isButtonActive = (button: OtherButtonConfig | HeadingButtonConfig) => {
    if ('format' in button && button.format) {
      return activeFormats.has(button.format as any);
    }
    if ('tag' in button && button.tag) {
      return activeNodes.has(button.tag);
    }
    return false;
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 p-2">
      <div className="flex gap-1">
        {formatButtons.map(button => (
          <ToolbarButton
            key={button.title}
            icon={button.icon}
            onClick={() =>
              editor.dispatchCommand(button.command, { data: null })
            }
            isActive={isButtonActive(button)}
            title={button.title}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />

      <div className="flex gap-1">
        {blockButtons.map(button => (
          <ToolbarButton
            key={button.title}
            icon={button.icon}
            onClick={() =>
              editor.dispatchCommand(
                button.command,
                'payload' in button ? button.payload : { data: null }
              )
            }
            isActive={isButtonActive(button)}
            title={button.title}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />

      <div className="flex gap-1">
        {listButtons.map(button => (
          <ToolbarButton
            key={button.title}
            icon={button.icon}
            onClick={() =>
              editor.dispatchCommand(button.command, { data: null })
            }
            isActive={isButtonActive(button)}
            title={button.title}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />

      <ToolbarButton
        icon={MinusIcon}
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, { data: null })
        }
        title="Horizontal Rule"
      />
    </div>
  );
}
