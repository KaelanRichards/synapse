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
  const [isReady, setIsReady] = useState(false);

  // Enable typewriter sound on mount
  useEffect(() => {
    if (editorState.soundEnabled) {
      enableTypewriterSound();
    }
  }, [editorState.soundEnabled]);

  // Fade in the editor
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      <div
        className={cn(
          'max-w-prose mx-auto px-4 pt-16 relative',
          'opacity-0 transition-opacity duration-slow ease-gentle',
          isReady && 'opacity-100'
        )}
      >
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
            'placeholder:text-ink-faint/30 placeholder:italic placeholder:font-light',
            'resize-none transition-all duration-normal ease-gentle',
            'tracking-normal',
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
      </div>
    </main>
  );
}
