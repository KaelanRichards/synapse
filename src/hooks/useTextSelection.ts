import { useCallback } from 'react';

interface TextBoundaries {
  start: number;
  end: number;
}

export function useTextSelection() {
  const findWordBoundaries = useCallback(
    (text: string, position: number): TextBoundaries => {
      const before = text.slice(0, position).search(/\S+$/);
      const after = text.slice(position).search(/\s/);

      return {
        start: before === -1 ? position : before,
        end: after === -1 ? text.length : position + after,
      };
    },
    []
  );

  const findParagraphBoundaries = useCallback(
    (text: string, position: number): TextBoundaries => {
      const before = text.slice(0, position).search(/\n\s*\n[^\n]*$/);
      const after = text.slice(position).search(/\n\s*\n/);

      return {
        start: before === -1 ? 0 : before + 2,
        end: after === -1 ? text.length : position + after,
      };
    },
    []
  );

  const findLineBoundaries = useCallback(
    (text: string, position: number): TextBoundaries => {
      const lineStart = text.lastIndexOf('\n', position - 1) + 1;
      const lineEnd = text.indexOf('\n', position);

      return {
        start: lineStart,
        end: lineEnd === -1 ? text.length : lineEnd,
      };
    },
    []
  );

  const handleSmartSelect = useCallback(
    (
      e: React.KeyboardEvent<HTMLTextAreaElement>,
      textarea: HTMLTextAreaElement
    ) => {
      if (!textarea || !(e.ctrlKey || e.metaKey)) return;

      const { selectionStart, selectionEnd, value: text } = textarea;
      let boundaries: TextBoundaries | null = null;

      switch (e.key) {
        case 'l': // Select line
          e.preventDefault();
          boundaries = findLineBoundaries(text, selectionStart);
          break;
        case 'w': // Select word
          e.preventDefault();
          boundaries = findWordBoundaries(text, selectionStart);
          break;
        case 'p': // Select paragraph
          e.preventDefault();
          boundaries = findParagraphBoundaries(text, selectionStart);
          break;
      }

      if (boundaries) {
        textarea.setSelectionRange(boundaries.start, boundaries.end);
      }
    },
    [findLineBoundaries, findWordBoundaries, findParagraphBoundaries]
  );

  return {
    handleSmartSelect,
    findWordBoundaries,
    findParagraphBoundaries,
    findLineBoundaries,
  };
}
