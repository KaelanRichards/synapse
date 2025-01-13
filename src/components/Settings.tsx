import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import { Button, Toggle, Card, Input } from '@/components/ui';

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
    <div className="space-y-8">
      {/* Theme */}
      <section>
        <h3 className="text-lg font-medium text-ink-rich mb-4">Theme</h3>
        <div className="flex gap-4">
          {['light', 'dark', 'system'].map(theme => (
            <Button
              key={theme}
              variant={state.theme === theme ? 'primary' : 'secondary'}
              onClick={() => setTheme(theme as 'light' | 'dark' | 'system')}
              className="capitalize"
            >
              {theme}
            </Button>
          ))}
        </div>
      </section>

      {/* Font */}
      <section>
        <h3 className="text-lg font-medium text-ink-rich mb-4">Typography</h3>
        <div className="space-y-4">
          {/* Font Family */}
          <div className="flex gap-4">
            {(['serif', 'sans', 'mono'] as const).map(font => (
              <Button
                key={font}
                variant={state.fontFamily === font ? 'primary' : 'secondary'}
                onClick={() => setFontFamily(font)}
                className={cn('capitalize', {
                  'font-serif': font === 'serif',
                  'font-sans': font === 'sans',
                  'font-mono': font === 'mono',
                })}
              >
                {font}
              </Button>
            ))}
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-ink-rich">Size</label>
            <Input
              type="range"
              min="12"
              max="24"
              value={state.fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-ink-rich">{state.fontSize}px</span>
          </div>
        </div>
      </section>

      {/* Focus Mode */}
      <section>
        <h3 className="text-lg font-medium text-ink-rich mb-4">Focus Mode</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink-rich">Enable Focus Mode</h4>
              <p className="text-sm text-ink-muted">
                Minimize distractions while writing
              </p>
            </div>
            <Toggle
              pressed={state.focusMode.enabled}
              onPressedChange={enabled => setFocusMode({ enabled })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink-rich">Hide Command Bar</h4>
              <p className="text-sm text-ink-muted">
                Hide command bar in focus mode
              </p>
            </div>
            <Toggle
              pressed={state.focusMode.hideCommands}
              onPressedChange={hideCommands => setFocusMode({ hideCommands })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink-rich">Dim Surroundings</h4>
              <p className="text-sm text-ink-muted">
                Fade out everything except current paragraph
              </p>
            </div>
            <Toggle
              pressed={state.focusMode.dimSurroundings}
              onPressedChange={dimSurroundings =>
                setFocusMode({ dimSurroundings })
              }
            />
          </div>
        </div>
      </section>

      {/* Typewriter Mode */}
      <section>
        <h3 className="text-lg font-medium text-ink-rich mb-4">
          Typewriter Mode
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink-rich">
                Enable Typewriter Mode
              </h4>
              <p className="text-sm text-ink-muted">
                Keep cursor centered while typing
              </p>
            </div>
            <Toggle
              pressed={state.typewriterMode.enabled}
              onPressedChange={enabled => setTypewriterMode({ enabled })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink-rich">Typewriter Sound</h4>
              <p className="text-sm text-ink-muted">
                Play mechanical keyboard sounds
              </p>
            </div>
            <Toggle
              pressed={state.typewriterMode.sound}
              onPressedChange={sound => setTypewriterMode({ sound })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink-rich">Auto-scroll</h4>
              <p className="text-sm text-ink-muted">
                Keep cursor in view while typing
              </p>
            </div>
            <Toggle
              pressed={state.typewriterMode.scrollIntoView}
              onPressedChange={scrollIntoView =>
                setTypewriterMode({ scrollIntoView })
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
