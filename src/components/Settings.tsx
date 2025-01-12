import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';

const Settings: React.FC = () => {
  const {
    state,
    setTheme,
    toggleSound,
    toggleAutoSave,
    setFontSize,
    setFontFamily,
  } = useEditor();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8">Editor Settings</h2>

      {/* Theme */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="flex gap-4">
          {['light', 'dark', 'system'].map(theme => (
            <button
              key={theme}
              onClick={() => setTheme(theme as 'light' | 'dark' | 'system')}
              className={cn(
                'px-4 py-2 rounded-lg capitalize',
                'transition-colors duration-normal',
                state.theme === theme
                  ? 'bg-accent-primary text-ink-inverse'
                  : 'bg-surface-alt hover:bg-surface-alt/80'
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </section>

      {/* Font */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Typography</h3>
        <div className="space-y-4">
          {/* Font Family */}
          <div className="flex gap-4">
            {['serif', 'sans', 'mono'].map(font => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={cn(
                  'px-4 py-2 rounded-lg capitalize',
                  'transition-colors duration-normal',
                  state.fontFamily === font
                    ? 'bg-accent-primary text-ink-inverse'
                    : 'bg-surface-alt hover:bg-surface-alt/80',
                  {
                    'font-serif': font === 'serif',
                    'font-sans': font === 'sans',
                    'font-mono': font === 'mono',
                  }
                )}
              >
                {font}
              </button>
            ))}
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-4">
            <label className="text-sm">Size</label>
            <input
              type="range"
              min="12"
              max="24"
              value={state.fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm">{state.fontSize}px</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Features</h3>
        <div className="space-y-4">
          {/* Typewriter Sound */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Typewriter Sound</h4>
              <p className="text-sm text-ink-faint">
                Enable mechanical keyboard sounds while typing
              </p>
            </div>
            <button
              onClick={toggleSound}
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.soundEnabled ? 'bg-accent-primary' : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.soundEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Save</h4>
              <p className="text-sm text-ink-faint">
                Automatically save changes while typing
              </p>
            </div>
            <button
              onClick={toggleAutoSave}
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.autoSave ? 'bg-accent-primary' : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.autoSave ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
