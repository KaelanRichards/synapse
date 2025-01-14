import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $isElementNode,
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import type { LexicalEditor } from 'lexical';
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
} from './index';

export function registerCommandHandlers(editor: LexicalEditor) {
  // Text Formatting
  editor.registerCommand(
    TOGGLE_BOLD_COMMAND,
    () => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      return true;
    },
    1
  );

  editor.registerCommand(
    TOGGLE_ITALIC_COMMAND,
    () => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      return true;
    },
    1
  );

  editor.registerCommand(
    TOGGLE_UNDERLINE_COMMAND,
    () => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      return true;
    },
    1
  );

  editor.registerCommand(
    TOGGLE_CODE_COMMAND,
    () => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
      return true;
    },
    1
  );

  // Lists
  editor.registerCommand(
    TOGGLE_BULLET_LIST_COMMAND,
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (selection.getNodes().some(node => $isListNode(node.getParent()))) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }
      }
      return true;
    },
    1
  );

  editor.registerCommand(
    TOGGLE_NUMBER_LIST_COMMAND,
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (selection.getNodes().some(node => $isListNode(node.getParent()))) {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
      }
      return true;
    },
    1
  );

  // Block Formatting
  editor.registerCommand(
    TOGGLE_HEADING_COMMAND,
    payload => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          $createHeadingNode(`h${payload.level}` as HeadingTagType)
        );
      }
      return true;
    },
    1
  );

  editor.registerCommand(
    TOGGLE_QUOTE_COMMAND,
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
      return true;
    },
    1
  );

  editor.registerCommand(
    INSERT_HORIZONTAL_RULE_COMMAND,
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = selection.focus.getNode();
        if (focusNode !== null) {
          const horizontalRuleNode = $createHorizontalRuleNode();
          focusNode.insertAfter(horizontalRuleNode);
        }
      }
      return true;
    },
    1
  );
}
