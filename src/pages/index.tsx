import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { playTypewriterSound, enableTypewriterSound } from '@/lib/sounds';
import { useEditor } from '@/contexts/EditorContext';

export default function Home() {
  const router = useRouter();
  const { updateNote, createNewNote } = useEditor();
  const [content, setContent] = useState('');
  const [showHint, setShowHint] = useState(true);

  // Enable typewriter sound on mount
  useEffect(() => {
    enableTypewriterSound();
  }, []);

  // Hide hint after user starts typing
  useEffect(() => {
    if (content && showHint) {
      setShowHint(false);
    }
  }, [content]);

  // Update note content
  useEffect(() => {
    if (content) {
      updateNote(content);
    }
  }, [content, updateNote]);

  return (
    <main className="min-h-screen bg-surface-pure dark:bg-surface-dark">
      <div className="max-w-prose mx-auto px-4 pt-16 relative">
        {/* Minimal writing surface */}
        <Textarea
          autoFocus
          value={content}
          onChange={e => {
            setContent(e.target.value);
            const lastChar = e.target.value.slice(-1);
            if (lastChar) playTypewriterSound(lastChar);
          }}
          placeholder="Begin writing..."
          className={cn(
            'min-h-[80vh] w-full bg-transparent border-0 focus:ring-0',
            'font-serif text-xl leading-relaxed text-ink-rich dark:text-ink-inverse',
            'placeholder:text-ink-faint/50 placeholder:italic',
            'resize-none transition-all duration-normal ease-gentle'
          )}
        />

        {/* Initial hint overlay */}
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
