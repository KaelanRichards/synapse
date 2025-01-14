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
  maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  is_pinned: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Connection {
  id: string;
  note_from: string;
  note_to: string;
  connection_type: 'related' | 'prerequisite' | 'refines';
  strength: number;
  bidirectional: boolean;
  context?: string;
  emergent: boolean;
  created_at: string;
}
