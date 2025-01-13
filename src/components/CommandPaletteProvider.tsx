import React, { useState, useEffect } from 'react';
import { SHORTCUTS, useKeyboardShortcuts } from '@/lib/keyboard';
import { CommandPalette } from './CommandPalette';

interface CommandPaletteProviderProps {
  children: React.ReactNode;
}

const CommandPaletteProvider: React.FC<CommandPaletteProviderProps> = ({
  children,
}) => {
  const handlers = {
    COMMAND_PALETTE: () => {},
  };

  const handleKeyDown = useKeyboardShortcuts(SHORTCUTS, handlers);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <CommandPalette />
      {children}
    </>
  );
};

export default CommandPaletteProvider;
