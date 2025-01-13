import React from 'react';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
  Quote as QuoteIcon,
  List as ListIcon,
  Heading1 as Heading1Icon,
  Link as LinkIcon,
} from 'lucide-react';
import type { Command } from './types';

interface FloatingFormatToolbarProps {
  position: { x: number; y: number };
  commands: Map<string, Command>;
}

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  commands,
}) => {
  console.log('Rendering FloatingFormatToolbar with position:', position);

  const safeExecuteCommand = (commandId: string) => {
    try {
      const command = commands.get(commandId);
      if (command?.execute) {
        command.execute();
      } else {
        console.warn(`Command ${commandId} is no longer valid`);
      }
    } catch (e) {
      console.warn(`Error executing command ${commandId}:`, e);
    }
  };

  return (
    <div
      className="fixed z-[9999] transform -translate-x-1/2 -translate-y-full floating-toolbar"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'auto',
        minWidth: '200px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
        visibility: 'visible',
        marginBottom: '8px',
      }}
    >
      <button
        onClick={() => safeExecuteCommand('format-bold')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="Bold (⌘B)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <BoldIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => safeExecuteCommand('format-italic')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="Italic (⌘I)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <ItalicIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => safeExecuteCommand('format-code')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="Code (⌘E)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <CodeIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => safeExecuteCommand('format-heading')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="Heading (⌘H)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <Heading1Icon className="w-4 h-4" />
      </button>
      <button
        onClick={() => safeExecuteCommand('format-link')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="Link (⌘K)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => safeExecuteCommand('format-quote')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="Quote (⇧⌘.)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <QuoteIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => safeExecuteCommand('format-list')}
        className="p-2 rounded hover:bg-gray-100 text-gray-800"
        title="List (⌘L)"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }}
      >
        <ListIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
