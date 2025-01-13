import React, { useState } from 'react';
import { Modal, Button, Card, Alert, Input, Toggle } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import supabase from '@/lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'editor', label: 'Editor', icon: '✏️' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const EditorSettingsContent: React.FC = () => {
  const {
    theme,
    fontSize,
    fontFamily,
    focusMode,
    typewriterMode,
    setTheme,
    setFontSize,
    setFontFamily,
    setFocusMode,
    setTypewriterMode,
  } = useUIStore();

  return (
    <div className="space-y-8">
      {/* Theme */}
      <section>
        <h3 className="text-lg font-medium text-ink-rich mb-4">Theme</h3>
        <div className="flex gap-4">
          {['light', 'dark', 'system'].map(t => (
            <Button
              key={t}
              variant={theme === t ? 'primary' : 'secondary'}
              onClick={() => setTheme(t as 'light' | 'dark' | 'system')}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="text-lg font-medium text-ink-rich mb-4">Typography</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            {(['serif', 'sans', 'mono'] as const).map(font => (
              <Button
                key={font}
                variant={fontFamily === font ? 'primary' : 'secondary'}
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
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-ink-rich">Size</label>
            <Input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-ink-rich">{fontSize}px</span>
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
              pressed={focusMode.enabled}
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
              pressed={focusMode.hideCommands}
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
              pressed={focusMode.dimSurroundings}
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
              pressed={typewriterMode.enabled}
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
              pressed={typewriterMode.sound}
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
              pressed={typewriterMode.scrollIntoView}
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

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>('editor');
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (value: string) => {
    const tab = TABS[parseInt(value)];
    if (tab) {
      setActiveTab(tab.id);
    }
  };

  const getTabIndex = (tabId: TabId): string => {
    return TABS.findIndex(tab => tab.id === tabId).toString();
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setSuccess(
        'Email updated successfully. Please check your new email for verification.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full h-[80vh]"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-ink-faint/20">
          <h2 className="text-xl font-semibold text-ink-rich dark:text-ink-inverse">
            Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex">
          <Tabs
            value={getTabIndex(activeTab)}
            onValueChange={handleTabChange}
            orientation="vertical"
          >
            <TabsList className="w-48 border-r border-ink-faint/20 p-2">
              {TABS.map((tab, index) => (
                <TabsTrigger
                  key={tab.id}
                  value={index.toString()}
                  className={cn(
                    'flex items-center gap-2 w-full p-2 rounded-md text-left',
                    'text-sm font-medium'
                  )}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="0">
                <EditorSettingsContent />
              </TabsContent>

              <TabsContent value="1">
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-medium text-ink-rich dark:text-ink-inverse mb-4">
                      Email Address
                    </h3>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <Input
                        id="email"
                        label="Email address"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                      <Button type="submit">Update Email</Button>
                    </form>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-medium text-ink-rich dark:text-ink-inverse mb-4">
                      Change Password
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <Input
                        id="current-password"
                        label="Current password"
                        type="password"
                        required
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        id="new-password"
                        label="New password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <Input
                        id="confirm-new-password"
                        label="Confirm new password"
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                      />
                      <Button type="submit">Update Password</Button>
                    </form>
                  </Card>

                  {error && (
                    <Alert variant="error" className="mt-4">
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert variant="success" className="mt-4">
                      {success}
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ink-rich dark:text-ink-inverse">
                    Notification Preferences
                  </h3>
                  <p className="text-ink-muted dark:text-ink-muted/70">
                    Notification settings coming soon...
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="3">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ink-rich dark:text-ink-inverse">
                    Appearance Settings
                  </h3>
                  <p className="text-ink-muted dark:text-ink-muted/70">
                    Appearance settings coming soon...
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Modal>
  );
}
