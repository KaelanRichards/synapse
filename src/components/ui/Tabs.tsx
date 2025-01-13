import { cn } from '@/lib/utils';
import { Tab } from '@headlessui/react';
import { ReactNode } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

export function Tabs({
  value,
  onValueChange,
  children,
  orientation = 'horizontal',
}: TabsProps) {
  // Convert string value to numeric index for Headless UI
  const selectedIndex = parseInt(value) || 0;
  const handleChange = (index: number) => {
    if (onValueChange) {
      onValueChange(index.toString());
    }
  };

  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      onChange={handleChange}
      vertical={orientation === 'vertical'}
    >
      {children}
    </Tab.Group>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tab.List
      className={cn(
        'flex gap-2',
        'border-ink-faint/20 dark:border-ink-faint/10',
        className
      )}
    >
      {children}
    </Tab.List>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tab
      value={value}
      className={({ selected }) =>
        cn(
          'outline-none transition-colors duration-normal ease-gentle',
          'text-ink-muted dark:text-ink-muted/70',
          selected &&
            'text-ink-rich dark:text-ink-inverse bg-surface-faint dark:bg-surface-dim/10',
          'hover:text-ink-rich hover:dark:text-ink-inverse',
          'hover:bg-surface-faint hover:dark:bg-surface-dim/10',
          'focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark',
          className
        )
      }
    >
      {children}
    </Tab>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tab.Panel
      className={cn(
        'outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </Tab.Panel>
  );
}
