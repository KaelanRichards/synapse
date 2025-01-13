import { useCallback, useReducer, useRef } from 'react';
import type {
  EditorState,
  Selection,
  UndoStackItem,
  FormatType,
  EditorProps,
} from '@/components/editor/types';

type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_SELECTION'; payload: Selection | null }
  | { type: 'ADD_TO_UNDO_STACK'; payload: UndoStackItem }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_STATS' }
  | { type: 'SET_SAVE_STATUS'; payload: EditorState['saveStatus'] }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_PARAGRAPH_FOCUS' }
  | { type: 'TOGGLE_AMBIENT_SOUND' }
  | { type: 'SET_TOOLBAR_VISIBILITY'; payload: boolean }
  | { type: 'SET_TOOLBAR_POSITION'; payload: { x: number; y: number } };

const UNDO_DELAY = 1000;
const MAX_UNDO_STACK = 100;

const initialState: EditorState = {
  content: '',
  selection: null,
  undoStack: [],
  redoStack: [],
  lastUndoTime: 0,
  stats: {
    wordCount: 0,
    charCount: 0,
    timeSpent: 0,
    linesCount: 0,
    readingTime: 0,
  },
  saveStatus: 'saved',
  isLocalFocusMode: false,
  isParagraphFocus: false,
  isAmbientSound: false,
  showToolbar: false,
  toolbarPosition: { x: 0, y: 0 },
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_SELECTION':
      return { ...state, selection: action.payload };
    case 'ADD_TO_UNDO_STACK':
      return {
        ...state,
        undoStack: [...state.undoStack, action.payload].slice(-MAX_UNDO_STACK),
        lastUndoTime: action.payload.timestamp,
      };
    case 'UNDO':
      if (state.undoStack.length < 2) return state;
      const previousState = state.undoStack[state.undoStack.length - 2];
      return {
        ...state,
        content: previousState.content,
        selection: previousState.selection,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [
          ...state.redoStack,
          state.undoStack[state.undoStack.length - 1],
        ],
      };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        content: nextState.content,
        selection: nextState.selection,
        undoStack: [...state.undoStack, nextState],
        redoStack: state.redoStack.slice(0, -1),
      };
    case 'UPDATE_STATS':
      const words = state.content.trim().split(/\s+/).filter(Boolean).length;
      const lines = state.content.split('\n').length;
      const readingTime = Math.ceil(words / 200); // Average reading speed of 200 wpm
      return {
        ...state,
        stats: {
          ...state.stats,
          wordCount: words,
          charCount: state.content.length,
          linesCount: lines,
          readingTime,
        },
      };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'TOGGLE_FOCUS_MODE':
      return { ...state, isLocalFocusMode: !state.isLocalFocusMode };
    case 'TOGGLE_PARAGRAPH_FOCUS':
      return { ...state, isParagraphFocus: !state.isParagraphFocus };
    case 'TOGGLE_AMBIENT_SOUND':
      return { ...state, isAmbientSound: !state.isAmbientSound };
    case 'SET_TOOLBAR_VISIBILITY':
      return { ...state, showToolbar: action.payload };
    case 'SET_TOOLBAR_POSITION':
      return { ...state, toolbarPosition: action.payload };
    default:
      return state;
  }
}

export function useEditorState({
  initialContent,
  onChange,
  onSave,
  onFormat,
  className,
}: EditorProps = {}) {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    content: initialContent ?? '',
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      dispatch({ type: 'SET_CONTENT', payload: newContent });

      // Add to undo stack if enough time has passed
      const now = Date.now();
      if (now - state.lastUndoTime > UNDO_DELAY) {
        dispatch({
          type: 'ADD_TO_UNDO_STACK',
          payload: {
            content: newContent,
            selection: {
              start: e.target.selectionStart,
              end: e.target.selectionEnd,
              text: newContent.substring(
                e.target.selectionStart,
                e.target.selectionEnd
              ),
            },
            timestamp: now,
          },
        });
      }

      dispatch({ type: 'UPDATE_STATS' });
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'unsaved' });
      onChange?.(newContent);
    },
    [state.lastUndoTime, onChange]
  );

  const handleFormat = useCallback(
    (type: FormatType) => {
      if (!textareaRef.current || !state.selection) return;

      const textarea = textareaRef.current;
      const { start, end, text } = state.selection;
      let formattedText = '';

      switch (type) {
        case 'bold':
          formattedText = `**${text}**`;
          break;
        case 'italic':
          formattedText = `_${text}_`;
          break;
        case 'heading':
          formattedText = `\n# ${text}`;
          break;
        case 'link':
          formattedText = `[${text}]()`;
          break;
        case 'code':
          formattedText = `\`${text}\``;
          break;
        case 'quote':
          formattedText = `> ${text}`;
          break;
      }

      const newContent =
        state.content.substring(0, start) +
        formattedText +
        state.content.substring(end);
      dispatch({ type: 'SET_CONTENT', payload: newContent });
      dispatch({ type: 'SET_TOOLBAR_VISIBILITY', payload: false });
      onFormat?.(type, state.selection);
    },
    [state.content, state.selection, onFormat]
  );

  const handleSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = window.getSelection();
    if (!selection?.toString()) {
      dispatch({ type: 'SET_TOOLBAR_VISIBILITY', payload: false });
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    dispatch({
      type: 'SET_TOOLBAR_POSITION',
      payload: { x: rect.left + rect.width / 2, y: rect.top },
    });
    dispatch({ type: 'SET_TOOLBAR_VISIBILITY', payload: true });
    dispatch({
      type: 'SET_SELECTION',
      payload: {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        text: selection.toString(),
      },
    });
  }, []);

  return {
    state,
    textareaRef,
    handleContentChange,
    handleFormat,
    handleSelection,
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    toggleFocusMode: () => dispatch({ type: 'TOGGLE_FOCUS_MODE' }),
    toggleParagraphFocus: () => dispatch({ type: 'TOGGLE_PARAGRAPH_FOCUS' }),
    toggleAmbientSound: () => dispatch({ type: 'TOGGLE_AMBIENT_SOUND' }),
    setSaveStatus: (status: EditorState['saveStatus']) =>
      dispatch({ type: 'SET_SAVE_STATUS', payload: status }),
  };
}
