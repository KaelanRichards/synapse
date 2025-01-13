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
    setFocusMode,
    setTypewriterMode,
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
            {(['serif', 'sans', 'mono'] as const).map(font => (
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

      {/* Focus Mode */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Focus Mode</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Focus Mode</h4>
              <p className="text-sm text-ink-faint">
                Minimize distractions while writing
              </p>
            </div>
            <button
              onClick={() =>
                setFocusMode({ enabled: !state.focusMode.enabled })
              }
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.focusMode.enabled ? 'bg-accent-primary' : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.focusMode.enabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Hide Command Bar</h4>
              <p className="text-sm text-ink-faint">
                Hide command bar in focus mode
              </p>
            </div>
            <button
              onClick={() =>
                setFocusMode({ hideCommands: !state.focusMode.hideCommands })
              }
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.focusMode.hideCommands
                  ? 'bg-accent-primary'
                  : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.focusMode.hideCommands ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dim Surroundings</h4>
              <p className="text-sm text-ink-faint">
                Fade out everything except current paragraph
              </p>
            </div>
            <button
              onClick={() =>
                setFocusMode({
                  dimSurroundings: !state.focusMode.dimSurroundings,
                })
              }
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.focusMode.dimSurroundings
                  ? 'bg-accent-primary'
                  : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.focusMode.dimSurroundings ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Typewriter Mode */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Typewriter Mode</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Typewriter Mode</h4>
              <p className="text-sm text-ink-faint">
                Keep cursor centered while typing
              </p>
            </div>
            <button
              onClick={() =>
                setTypewriterMode({ enabled: !state.typewriterMode.enabled })
              }
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.typewriterMode.enabled
                  ? 'bg-accent-primary'
                  : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.typewriterMode.enabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Typewriter Sound</h4>
              <p className="text-sm text-ink-faint">
                Play mechanical keyboard sounds
              </p>
            </div>
            <button
              onClick={() =>
                setTypewriterMode({ sound: !state.typewriterMode.sound })
              }
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.typewriterMode.sound
                  ? 'bg-accent-primary'
                  : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.typewriterMode.sound ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-scroll</h4>
              <p className="text-sm text-ink-faint">
                Keep cursor in view while typing
              </p>
            </div>
            <button
              onClick={() =>
                setTypewriterMode({
                  scrollIntoView: !state.typewriterMode.scrollIntoView,
                })
              }
              className={cn(
                'w-12 h-6 rounded-full relative transition-colors duration-normal',
                state.typewriterMode.scrollIntoView
                  ? 'bg-accent-primary'
                  : 'bg-surface-alt'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-ink-inverse transition-transform duration-normal',
                  state.typewriterMode.scrollIntoView ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Auto Save */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Features</h3>
        <div className="space-y-4">
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
