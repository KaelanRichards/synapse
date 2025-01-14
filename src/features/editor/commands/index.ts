import { LexicalCommand, createCommand } from 'lexical';

interface CommandPayload<T = unknown> {
  data?: T;
}

// Text Formatting Commands
export const TOGGLE_BOLD_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
export const TOGGLE_ITALIC_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
export const TOGGLE_UNDERLINE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
export const TOGGLE_CODE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();

// List Commands
export const TOGGLE_BULLET_LIST_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
export const TOGGLE_NUMBER_LIST_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
export const TOGGLE_CHECK_LIST_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();

// Block Commands
export const TOGGLE_HEADING_COMMAND: LexicalCommand<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
}> = createCommand();
export const TOGGLE_QUOTE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();

// Table Commands
export const INSERT_TABLE_COMMAND: LexicalCommand<{
  rows: number;
  cols: number;
}> = createCommand();
export const DELETE_TABLE_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();

// Link Commands
export const TOGGLE_LINK_COMMAND: LexicalCommand<{ url: string }> =
  createCommand();
export const REMOVE_LINK_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();
