import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  TextFormatType,
  $isElementNode,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import { $isListNode, ListNode } from '@lexical/list';
import { $isHeadingNode, HeadingNode } from '@lexical/rich-text';
import { $isCodeNode } from '@lexical/code';
import { useEditorStore } from '../store/editorStore';

const TEXT_FORMAT_TYPES: TextFormatType[] = [
  'bold',
  'italic',
  'underline',
  'code',
  'strikethrough',
];

export function FormatTrackerPlugin() {
  const [editor] = useLexicalComposerContext();
  const { setActiveFormats, setActiveNodes } = useEditorStore();

  useEffect(() => {
    const updateFormats = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        const activeFormats = new Set<TextFormatType>();
        const activeNodes = new Set<string>();

        if ($isRangeSelection(selection)) {
          // Track text formats
          TEXT_FORMAT_TYPES.forEach(format => {
            if (selection.hasFormat(format)) {
              activeFormats.add(format);
            }
          });

          // Track node types
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            if ($isElementNode(node)) {
              const parent = node.getParent();
              if ($isListNode(parent)) {
                activeNodes.add('list');
                if (parent instanceof ListNode) {
                  activeNodes.add(parent.getTag());
                }
              }
              if ($isHeadingNode(parent)) {
                activeNodes.add('heading');
                if (parent instanceof HeadingNode) {
                  activeNodes.add(parent.getTag());
                }
              }
              if ($isCodeNode(parent)) {
                activeNodes.add('code-block');
              }
            }
          });
        }

        setActiveFormats(activeFormats);
        setActiveNodes(activeNodes);
      });
    };

    // Update on selection change
    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFormats();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Update on format change
    const removeFormatListener = editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      () => {
        updateFormats();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Initial update
    updateFormats();

    return () => {
      removeSelectionListener();
      removeFormatListener();
    };
  }, [editor, setActiveFormats, setActiveNodes]);

  return null;
}
