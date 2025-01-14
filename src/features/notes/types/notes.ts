import { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export interface CreateNoteInput {
  title: string;
  content: {
    text: string;
    editorState: {
      type: string;
      content: SerializedEditorState<SerializedLexicalNode>;
      selection?: {
        anchor: number;
        focus: number;
        type: string;
      };
    };
  };
  is_pinned?: boolean;
  display_order?: number;
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: {
    text: string;
    editorState: {
      type: string;
      content: SerializedEditorState<SerializedLexicalNode>;
      selection?: {
        anchor: number;
        focus: number;
        type: string;
      };
    };
  };
  is_pinned?: boolean;
  display_order?: number;
}
