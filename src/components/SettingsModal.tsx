import React from 'react';
import { Modal, Button } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useEditor } from '@/contexts/EditorContext';
import EditorSettings from './Settings';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  {
    id: 'editor',
    label: 'Editor',
    icon: '✏️',
  },
  {
    id: 'account',
    label: 'Account',
    icon: '👤',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: '🎨',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>('editor');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full h-[80vh]"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-ink-faint/20">
          <h2 className="text-xl font-semibold text-ink-rich">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex">
          <Tabs
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value as TabId)}
            orientation="vertical"
          >
            <TabsList className="w-48 border-r border-ink-faint/20 p-2">
              {TABS.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex items-center gap-2 w-full p-2 rounded-md text-left',
                    'text-sm font-medium',
                    'transition-colors duration-normal ease-gentle',
                    'hover:bg-surface-faint'
                  )}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="editor">
                <EditorSettings />
              </TabsContent>
              <TabsContent value="account">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ink-rich">
                    Account Settings
                  </h3>
                  <p className="text-ink-muted">
                    Account settings coming soon...
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="notifications">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ink-rich">
                    Notification Preferences
                  </h3>
                  <p className="text-ink-muted">
                    Notification settings coming soon...
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="appearance">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-ink-rich">
                    Appearance Settings
                  </h3>
                  <p className="text-ink-muted">
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
