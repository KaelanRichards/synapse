type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
};

type KeyboardHandler = (e: KeyboardEvent) => void;

export const SHORTCUTS = {
  // Core Navigation
  COMMAND_PALETTE: { key: 'k', metaKey: true, preventDefault: true },
  NEW_NOTE: { key: 'n', metaKey: true, preventDefault: true },
  SAVE: { key: 's', metaKey: true, preventDefault: true },

  // View Controls
  FOCUS_MODE: { key: 'f', metaKey: true, shiftKey: true, preventDefault: true },
  FULLSCREEN: { key: 'f', metaKey: true, preventDefault: true },
  DARK_MODE: { key: 'd', metaKey: true, shiftKey: true, preventDefault: true },

  // Text Formatting
  BOLD: { key: 'b', metaKey: true, preventDefault: true },
  ITALIC: { key: 'i', metaKey: true, preventDefault: true },
  LINK: { key: 'k', metaKey: true, shiftKey: true, preventDefault: true },
} as const;

export const matchesShortcut = (
  e: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean => {
  const modifierMatch =
    !!shortcut.ctrlKey === e.ctrlKey &&
    !!shortcut.metaKey === e.metaKey &&
    !!shortcut.shiftKey === e.shiftKey &&
    !!shortcut.altKey === e.altKey;

  return modifierMatch && e.key.toLowerCase() === shortcut.key.toLowerCase();
};

export const useKeyboardShortcuts = (
  shortcuts: Record<string, KeyboardShortcut>,
  handlers: Record<string, KeyboardHandler>
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    Object.entries(shortcuts).forEach(([name, shortcut]) => {
      if (matchesShortcut(e, shortcut)) {
        if (shortcut.preventDefault) {
          e.preventDefault();
        }
        handlers[name]?.(e);
      }
    });
  };

  return handleKeyDown;
};

// Sound effects for typewriter mode
const keySound =
  typeof Audio !== 'undefined' ? new Audio('/sounds/key.mp3') : null;
const spaceSound =
  typeof Audio !== 'undefined' ? new Audio('/sounds/space.mp3') : null;
const returnSound =
  typeof Audio !== 'undefined' ? new Audio('/sounds/return.mp3') : null;

let isSoundEnabled = false;

export const toggleTypewriterSound = () => {
  isSoundEnabled = !isSoundEnabled;
  return isSoundEnabled;
};

export const playTypewriterSound = (key: string) => {
  if (!isSoundEnabled || !keySound || !spaceSound || !returnSound) return;

  if (key === ' ') {
    spaceSound.currentTime = 0;
    spaceSound.play();
  } else if (key === 'Enter') {
    returnSound.currentTime = 0;
    returnSound.play();
  } else {
    keySound.currentTime = 0;
    keySound.play();
  }
};
