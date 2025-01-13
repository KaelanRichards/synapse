import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Textarea, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useEditor } from '@/contexts/EditorContext';
import AmbientSoundPlayer from './AmbientSoundPlayer';
import type { Note } from '@/types/supabase';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  BoltIcon,
  BoltSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from '@/hooks/useDebounce';

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    maturity_state: Note['maturity_state'];
  };
}

interface EditorStats {
  wordCount: number;
  charCount: number;
  timeSpent: number;
  linesCount: number;
  readingTime: number;
}

interface Selection {
  start: number;
  end: number;
  text: string;
}

interface UndoStackItem {
  content: string;
  selection: Selection;
  timestamp: number;
}

const UNDO_DELAY = 1000; // Minimum time between undo stack items
const MAX_UNDO_STACK = 100;
const SAVE_DELAY = 1000;
const LINE_HEIGHT = 24;

const getStatusVariant = (
  status: 'saved' | 'saving' | 'unsaved'
): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'saved':
      return 'success';
    case 'saving':
      return 'warning';
    case 'unsaved':
      return 'error';
  }
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return 'Just started';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
};

const formatText = (
  type: 'bold' | 'italic' | 'heading',
  selectedText: string
): string => {
  switch (type) {
    case 'bold':
      return `**${selectedText}**`;
    case 'italic':
      return `_${selectedText}_`;
    case 'heading':
      return `\n# ${selectedText}`;
  }
};

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const [content, setContent] = useState(initialNote?.content ?? '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved'
  );
  const [isLocalFocusMode, setIsLocalFocusMode] = useState(false);
  const [isParagraphFocus, setIsParagraphFocus] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState<EditorStats>({
    wordCount: 0,
    charCount: 0,
    timeSpent: 0,
    linesCount: 0,
    readingTime: 0,
  });
  const [isAmbientSound, setIsAmbientSound] = useState(false);
  const [undoStack, setUndoStack] = useState<UndoStackItem[]>([]);
  const [redoStack, setRedoStack] = useState<UndoStackItem[]>([]);
  const [lastUndoTime, setLastUndoTime] = useState(0);
  const [selections, setSelections] = useState<Selection[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef(content);
  const { updateNote } = useNoteMutations();
  const { state: editorState, setTypewriterMode } = useEditor();

  const debouncedContent = useDebounce(content, SAVE_DELAY);

  // Virtual scrolling for large documents
  const lines = useMemo(() => content.split('\n'), [content]);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LINE_HEIGHT,
    overscan: 5,
  });

  // Efficient stats calculation
  const updateStats = useCallback((text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const lines = text.split('\n').length;
    const readingTime = Math.ceil(words / 200); // Average reading speed of 200 wpm

    setStats(prev => ({
      ...prev,
      wordCount: words,
      charCount: text.length,
      linesCount: lines,
      readingTime,
    }));
  }, []);

  // Optimized content change handler
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      contentRef.current = newContent;

      // Update all selections with new content
      setSelections(prev =>
        prev.map(selection => ({
          ...selection,
          text: newContent.substring(selection.start, selection.end),
        }))
      );

      // Add to undo stack if enough time has passed
      const now = Date.now();
      if (now - lastUndoTime > UNDO_DELAY) {
        setUndoStack(prev => {
          const newStack = [
            ...prev,
            {
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
          ].slice(-MAX_UNDO_STACK);
          return newStack;
        });
        setLastUndoTime(now);
        setRedoStack([]); // Clear redo stack on new changes
      }

      // Debounced stats update
      updateStats(newContent);
    },
    [lastUndoTime, updateStats]
  );

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length > 1) {
      const current = undoStack[undoStack.length - 1];
      const previous = undoStack[undoStack.length - 2];

      setRedoStack(prev => [...prev, current]);
      setUndoStack(prev => prev.slice(0, -1));
      setContent(previous.content);

      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(
          previous.selection.start,
          previous.selection.end
        );
      }
    }
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];

      setUndoStack(prev => [...prev, next]);
      setRedoStack(prev => prev.slice(0, -1));
      setContent(next.content);

      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(
          next.selection.start,
          next.selection.end
        );
      }
    }
  }, [redoStack]);

  // Multiple cursor support
  const handleAddCursor = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (e.altKey && textareaRef.current) {
        const clickPosition = getClickPosition(e, textareaRef.current);
        setSelections(prev => [
          ...prev,
          {
            start: clickPosition,
            end: clickPosition,
            text: '',
          },
        ]);
      }
    },
    []
  );

  // Selection handler for toolbar
  const handleSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = window.getSelection();
    if (!selection?.toString()) {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setToolbarPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setShowToolbar(true);
  }, []);

  // Selection effect
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.addEventListener('mouseup', handleSelection);
    textarea.addEventListener('keyup', handleSelection);
    return () => {
      textarea.removeEventListener('mouseup', handleSelection);
      textarea.removeEventListener('keyup', handleSelection);
    };
  }, [handleSelection]);

  // Smart selection
  const handleSmartSelect = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!textareaRef.current) return;

      if (e.ctrlKey || e.metaKey) {
        const textarea = textareaRef.current;
        const { selectionStart, selectionEnd } = textarea;
        const text = textarea.value;

        switch (e.key) {
          case 'l': // Select line
            e.preventDefault();
            const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
            const lineEnd = text.indexOf('\n', selectionEnd);
            textarea.setSelectionRange(
              lineStart,
              lineEnd === -1 ? text.length : lineEnd
            );
            break;
          case 'w': // Select word
            e.preventDefault();
            const wordBoundaries = findWordBoundaries(text, selectionStart);
            textarea.setSelectionRange(
              wordBoundaries.start,
              wordBoundaries.end
            );
            break;
          case 'p': // Select paragraph
            e.preventDefault();
            const paragraphBoundaries = findParagraphBoundaries(
              text,
              selectionStart
            );
            textarea.setSelectionRange(
              paragraphBoundaries.start,
              paragraphBoundaries.end
            );
            break;
        }
      }
    },
    []
  );

  // Auto-save with optimistic updates
  useEffect(() => {
    if (!initialNote?.id || debouncedContent === initialNote.content) return;

    setSaveStatus('saving');
    updateNote.mutate(
      { id: initialNote.id, content: debouncedContent },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('unsaved'),
      }
    );
  }, [debouncedContent, initialNote, updateNote]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'f':
            e.preventDefault();
            setIsLocalFocusMode(prev => !prev);
            break;
          case 'p':
            e.preventDefault();
            setIsParagraphFocus(prev => !prev);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleUndo, handleRedo]);

  // Add this effect after the keyboard shortcuts effect
  useEffect(() => {
    if (!textareaRef.current) return;

    // Apply all selections to the textarea
    selections.forEach(selection => {
      const range = document.createRange();
      const textNode = textareaRef.current!.firstChild;
      if (textNode) {
        range.setStart(textNode, selection.start);
        range.setEnd(textNode, selection.end);
        window.getSelection()?.addRange(range);
      }
    });
  }, [selections]);

  const handleFormatText = (type: 'bold' | 'italic' | 'heading') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = formatText(type, selectedText);
    const newContent =
      content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    updateStats(newContent);
    setShowToolbar(false);
  };

  // Render optimized editor
  return (
    <div
      className={cn(
        'relative w-full h-full min-h-screen',
        isLocalFocusMode && 'bg-neutral-50 dark:bg-neutral-900',
        isParagraphFocus && 'prose-lg'
      )}
      ref={parentRef}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-white/80 dark:bg-black/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(saveStatus)}>
            {saveStatus === 'saved' && <CheckIcon className="w-4 h-4" />}
            {saveStatus === 'saving' && (
              <CloudArrowUpIcon className="w-4 h-4 animate-spin" />
            )}
            {saveStatus === 'unsaved' && (
              <ExclamationCircleIcon className="w-4 h-4" />
            )}
            {saveStatus}
          </Badge>
          <Badge variant="secondary">{stats.wordCount} words</Badge>
          <Badge variant="secondary">{formatTime(stats.timeSpent)}</Badge>
          <Badge variant="secondary">~{stats.readingTime} min read</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLocalFocusMode(prev => !prev)}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {isLocalFocusMode ? (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingInIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsAmbientSound(prev => !prev)}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {isAmbientSound ? (
              <SpeakerWaveIcon className="w-5 h-5" />
            ) : (
              <SpeakerXMarkIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() =>
              setTypewriterMode({
                enabled: !editorState.typewriterMode.enabled,
              })
            }
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {editorState.typewriterMode.enabled ? (
              <BoltIcon className="w-5 h-5" />
            ) : (
              <BoltSlashIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'w-full max-w-3xl mx-auto px-4 py-8',
          isLocalFocusMode && 'prose dark:prose-invert',
          isParagraphFocus && 'prose-lg'
        )}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleSmartSelect}
          onClick={handleAddCursor}
          className={cn(
            'w-full h-full resize-none bg-transparent',
            'focus:ring-0 focus:outline-none',
            'font-mono text-lg leading-relaxed',
            'selection:bg-blue-100 dark:selection:bg-blue-900',
            isLocalFocusMode && 'prose dark:prose-invert',
            isParagraphFocus && 'prose-lg'
          )}
          style={{
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${virtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
          }}
        />
      </div>

      {isAmbientSound && (
        <AmbientSoundPlayer
          isPlaying={isAmbientSound}
          onClose={() => setIsAmbientSound(false)}
        />
      )}

      {showToolbar && (
        <div
          className="fixed z-20 flex items-center space-x-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-1"
          style={{
            top: toolbarPosition.y - 40,
            left: toolbarPosition.x - 100,
          }}
        >
          <button
            onClick={() => handleFormatText('bold')}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            B
          </button>
          <button
            onClick={() => handleFormatText('italic')}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            I
          </button>
          <button
            onClick={() => handleFormatText('heading')}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            H
          </button>
        </div>
      )}
    </div>
  );
};

// Utility functions
const getClickPosition = (
  e: React.MouseEvent<HTMLTextAreaElement>,
  textarea: HTMLTextAreaElement
) => {
  const rect = textarea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Create a temporary div to measure text position
  const div = document.createElement('div');
  div.style.cssText = window.getComputedStyle(textarea).cssText;
  div.style.height = 'auto';
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.textContent = textarea.value;

  document.body.appendChild(div);
  const position = getTextPositionFromPoint(div, x, y);
  document.body.removeChild(div);

  return position;
};

const findWordBoundaries = (text: string, position: number) => {
  const before = text.slice(0, position).search(/\S+$/);
  const after = text.slice(position).search(/\s/);

  return {
    start: before === -1 ? position : before,
    end: after === -1 ? text.length : position + after,
  };
};

const findParagraphBoundaries = (text: string, position: number) => {
  const before = text.slice(0, position).search(/\n\s*\n[^\n]*$/);
  const after = text.slice(position).search(/\n\s*\n/);

  return {
    start: before === -1 ? 0 : before + 2,
    end: after === -1 ? text.length : position + after,
  };
};

const getTextPositionFromPoint = (
  element: HTMLElement,
  x: number,
  y: number
) => {
  const range = document.createRange();
  const textNode = element.firstChild;

  if (!textNode) return 0;

  let position = 0;
  let found = false;

  for (let i = 0; i < textNode.textContent!.length && !found; i++) {
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);

    const rect = range.getBoundingClientRect();
    if (
      rect.top <= y &&
      y <= rect.bottom &&
      rect.left <= x &&
      x <= rect.right
    ) {
      position = i;
      found = true;
    }
  }

  return position;
};

export default NoteEditor;
