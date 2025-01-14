import { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export interface Note {
  id: string;
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
  is_pinned: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}
