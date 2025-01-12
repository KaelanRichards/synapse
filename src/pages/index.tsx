import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { playTypewriterSound, enableTypewriterSound } from '@/lib/sounds';
import { useEditor } from '@/contexts/EditorContext';
import { useNoteMutations } from '@/hooks/useNoteMutations';

export default function Home() {
  const router = useRouter();
  const { state: editorState } = useEditor();
  const { createNote } = useNoteMutations();
  const [content, setContent] = useState('');
  const [showHint, setShowHint] = useState(true);

  // Enable typewriter sound on mount
  useEffect(() => {
    if (editorState.soundEnabled) {
      enableTypewriterSound();
    }
  }, [editorState.soundEnabled]);

  // Hide hint after user starts typing
  useEffect(() => {
    if (content && showHint) {
      setShowHint(false);
    }
  }, [content]);

  // Create note when content is substantial
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim().length > 10) {
        createNote.mutate(
          {
            title: content.split('\n')[0].slice(0, 50),
            content,
            maturity_state: 'SEED',
          },
          {
            onSuccess: data => {
              router.push(`/notes/${data.id}`);
            },
          }
        );
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, createNote, router]);

  return (
    <main className="min-h-screen bg-surface-pure dark:bg-surface-dark">
      <div className="max-w-prose mx-auto px-4 pt-16 relative">
        <Textarea
          autoFocus
          value={content}
          onChange={e => {
            setContent(e.target.value);
            if (editorState.soundEnabled) {
              const lastChar = e.target.value.slice(-1);
              if (lastChar) playTypewriterSound(lastChar);
            }
          }}
          placeholder="Begin writing..."
          className={cn(
            'min-h-[80vh] w-full bg-transparent border-0 focus:ring-0',
            'text-xl leading-relaxed text-ink-rich dark:text-ink-inverse',
            'placeholder:text-ink-faint/50 placeholder:italic',
            'resize-none transition-all duration-normal ease-gentle',
            {
              'font-serif': editorState.fontFamily === 'serif',
              'font-sans': editorState.fontFamily === 'sans',
              'font-mono': editorState.fontFamily === 'mono',
            }
          )}
          style={{
            fontSize: `${editorState.fontSize}px`,
          }}
        />

        {showHint && (
          <div
            className={cn(
              'absolute inset-0 pointer-events-none',
              'flex items-center justify-center',
              'text-ink-faint/30 text-lg italic',
              'transition-opacity duration-slow ease-gentle'
            )}
          >
            Press ⌘K for commands
          </div>
        )}
      </div>
    </main>
  );
}
