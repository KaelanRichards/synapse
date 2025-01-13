import React, { useEffect, useState, useRef } from 'react';
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
}

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
  });
  const [isAmbientSound, setIsAmbientSound] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNote } = useNoteMutations();
  const { state: editorState } = useEditor();

  // Update content when initialNote changes
  useEffect(() => {
    if (initialNote?.content) {
      setContent(initialNote.content);
      updateStats(initialNote.content);
    }
  }, [initialNote?.content]);

  // Update stats
  const updateStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setStats(prev => ({
      ...prev,
      wordCount: words,
      charCount: text.length,
    }));
  };

  // Track time spent
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hasFocus() && textareaRef.current?.matches(':focus')) {
        setStats(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save debounce timer
  useEffect(() => {
    if (!initialNote?.id) return;
    const noteId = initialNote.id;

    const timer = setTimeout(() => {
      if (content !== initialNote.content) {
        setSaveStatus('saving');
        updateNote.mutate(
          { id: noteId, content },
          {
            onSuccess: () => setSaveStatus('saved'),
            onError: () => setSaveStatus('unsaved'),
          }
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, initialNote, updateNote]);

  // Handle Escape key to exit modes
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showToolbar) setShowToolbar(false);
        if (isLocalFocusMode) setIsLocalFocusMode(false);
        if (isParagraphFocus) setIsParagraphFocus(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isLocalFocusMode, showToolbar, isParagraphFocus]);

  // Handle text selection for toolbar
  useEffect(() => {
    const handleSelection = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );

      if (!selectedText) {
        setShowToolbar(false);
        return;
      }

      // Get the caret coordinates
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Create a temporary div to measure the text position
      const div = document.createElement('div');
      div.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        box-sizing: border-box;
        padding: ${window.getComputedStyle(textarea).padding};
        width: ${textarea.offsetWidth}px;
        font: ${window.getComputedStyle(textarea).font};
        line-height: ${window.getComputedStyle(textarea).lineHeight};
        letter-spacing: ${window.getComputedStyle(textarea).letterSpacing};
      `;

      // Add text up to the selection
      const textBeforeSelection = textarea.value.substring(0, start);
      const lines = textBeforeSelection.split('\n');

      // Create spans for each line to preserve line breaks
      lines.forEach((line, index) => {
        if (index > 0) div.appendChild(document.createElement('br'));
        div.appendChild(document.createTextNode(line));
      });

      // Add a span for measuring the selection
      const span = document.createElement('span');
      span.textContent = selectedText;
      div.appendChild(span);

      document.body.appendChild(div);
      const spanRect = span.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();

      // Calculate scroll offset
      const scrollTop = textarea.scrollTop;

      // Calculate the absolute position of the selection
      const x = textareaRect.left + spanRect.left;
      const y = textareaRect.top + spanRect.top - scrollTop;

      document.body.removeChild(div);

      setToolbarPosition({
        x: x + spanRect.width / 2,
        y: y,
      });
      setShowToolbar(true);
    };

    const textarea = textareaRef.current;
    if (!textarea) return;

    const events = ['select', 'click', 'keyup', 'mouseup'];
    events.forEach(event => textarea.addEventListener(event, handleSelection));

    return () => {
      events.forEach(event =>
        textarea.removeEventListener(event, handleSelection)
      );
    };
  }, []);

  // Typewriter mode: Keep cursor in view
  useEffect(() => {
    if (!editorState.typewriterMode.enabled || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const handleInput = () => {
      const selection = window.getSelection();
      if (!selection?.focusNode) return;

      // Find the caret position
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Scroll the caret into the middle of the viewport
      const viewportHeight = window.innerHeight;
      const desiredPosition = viewportHeight / 2;
      const scrollAmount = rect.top - desiredPosition;

      if (editorState.typewriterMode.scrollIntoView) {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };

    textarea.addEventListener('input', handleInput);
    return () => textarea.removeEventListener('input', handleInput);
  }, [
    editorState.typewriterMode.enabled,
    editorState.typewriterMode.scrollIntoView,
  ]);

  // Format text
  const formatText = (type: 'bold' | 'italic' | 'heading') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = '';
    switch (type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `_${selectedText}_`;
        break;
      case 'heading':
        newText = `\n# ${selectedText}`;
        break;
    }

    const newContent =
      content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    updateStats(newContent);
    setShowToolbar(false);
  };

  const SaveStatusIcon = {
    saved: CheckIcon,
    saving: CloudArrowUpIcon,
    unsaved: ExclamationCircleIcon,
  }[saveStatus];

  const getStatusVariant = (
    status: typeof saveStatus
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

  const statusVariant = getStatusVariant(saveStatus);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'Just started';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  return (
    <div
      className={cn(
        'h-full w-full transition-all duration-normal ease-gentle',
        'bg-surface-pure',
        'flex flex-col relative',
        isLocalFocusMode && 'bg-opacity-98',
        editorState.focusMode.enabled && 'bg-opacity-98'
      )}
    >
      {/* Floating Toolbar */}
      {showToolbar && (
        <div
          className="fixed z-50 bg-surface-pure shadow-floating rounded-lg p-1.5 flex items-center space-x-1 transform -translate-x-1/2 floating-toolbar"
          style={{
            left: toolbarPosition.x,
            top: Math.max(0, toolbarPosition.y - 45),
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => formatText('bold')}
            className="p-1.5 hover:bg-surface-faint rounded-md text-ink-muted hover:text-ink-rich"
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => formatText('italic')}
            className="p-1.5 hover:bg-surface-faint rounded-md text-ink-muted hover:text-ink-rich"
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => formatText('heading')}
            className="p-1.5 hover:bg-surface-faint rounded-md text-ink-muted hover:text-ink-rich"
            title="Heading"
          >
            <span className="font-bold">H</span>
          </button>
        </div>
      )}

      {/* Ambient Sound Player */}
      <AmbientSoundPlayer
        isPlaying={isAmbientSound}
        onClose={() => setIsAmbientSound(false)}
      />

      {/* Editor Header */}
      <div
        className={cn(
          'flex items-center justify-between px-6 py-3 shrink-0',
          'border-b border-ink-faint/20',
          'transition-opacity duration-normal',
          (isLocalFocusMode || editorState.focusMode.enabled) &&
            'opacity-0 hover:opacity-100'
        )}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-medium text-ink-rich">
            {initialNote?.title || 'Untitled Note'}
          </h1>
          <div className="flex items-center space-x-1.5">
            <SaveStatusIcon className="h-4 w-4" />
            <Badge variant={statusVariant}>
              {saveStatus === 'saved'
                ? 'Saved'
                : saveStatus === 'saving'
                  ? 'Saving...'
                  : 'Unsaved'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Stats */}
          <div className="text-sm text-ink-muted space-x-3 mr-4">
            <span>{stats.wordCount} words</span>
            <span>{formatTime(stats.timeSpent)}</span>
          </div>

          {/* Controls */}
          <button
            onClick={() => setIsParagraphFocus(!isParagraphFocus)}
            className={cn(
              'p-1.5 rounded-md transition-all duration-normal ease-gentle',
              'text-ink-muted hover:text-ink-rich',
              'hover:bg-surface-faint',
              isParagraphFocus &&
                'text-accent-primary hover:text-accent-primary/90'
            )}
            title={
              isParagraphFocus
                ? 'Disable Paragraph Focus'
                : 'Enable Paragraph Focus'
            }
          >
            {isParagraphFocus ? (
              <BoltSlashIcon
                className={cn('h-5 w-5', isParagraphFocus && 'sound-wave')}
              />
            ) : (
              <BoltIcon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setIsAmbientSound(!isAmbientSound)}
            className={cn(
              'p-1.5 rounded-md transition-all duration-normal ease-gentle',
              'text-ink-muted hover:text-ink-rich',
              'hover:bg-surface-faint',
              isAmbientSound &&
                'text-accent-primary hover:text-accent-primary/90'
            )}
            title={
              isAmbientSound ? 'Disable Ambient Sound' : 'Enable Ambient Sound'
            }
          >
            {isAmbientSound ? (
              <SpeakerWaveIcon
                className={cn('h-5 w-5', isAmbientSound && 'sound-wave')}
              />
            ) : (
              <SpeakerXMarkIcon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setIsLocalFocusMode(!isLocalFocusMode)}
            className={cn(
              'p-1.5 rounded-md transition-all duration-normal ease-gentle',
              'text-ink-muted hover:text-ink-rich',
              'hover:bg-surface-faint',
              isLocalFocusMode &&
                'text-accent-primary hover:text-accent-primary/90'
            )}
            title={isLocalFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isLocalFocusMode ? (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingInIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'max-w-2xl mx-auto transition-all duration-normal ease-gentle',
            isLocalFocusMode || editorState.focusMode.enabled
              ? 'px-4 py-12'
              : 'px-6 py-8'
          )}
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={e => {
              setContent(e.target.value);
              updateStats(e.target.value);
            }}
            className={cn(
              'w-full min-h-[calc(100vh-16rem)] resize-none',
              'bg-transparent border-none shadow-none focus-visible:ring-0',
              'text-lg leading-relaxed',
              isParagraphFocus && 'focus-paragraph',
              {
                'font-serif': editorState.fontFamily === 'serif',
                'font-sans': editorState.fontFamily === 'sans',
                'font-mono': editorState.fontFamily === 'mono',
              }
            )}
            style={{
              fontSize: `${editorState.fontSize}px`,
            }}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
