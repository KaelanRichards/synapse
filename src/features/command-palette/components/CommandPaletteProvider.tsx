import { CommandPalette } from './CommandPalette';

interface CommandPaletteProviderProps {
  children: React.ReactNode;
}

export default function CommandPaletteProvider({
  children,
}: CommandPaletteProviderProps) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
