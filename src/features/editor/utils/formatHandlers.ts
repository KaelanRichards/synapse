import {
  FORMAT_TEXT_COMMAND,
  TextFormatType,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $createRangeSelection,
  $getPreviousSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import type { LexicalEditor, RangeSelection } from 'lexical';

export const formatText = (editor: LexicalEditor, format: TextFormatType) => {
  console.log('🚀 Starting formatText with format:', format);

  editor.focus();

  editor.update(() => {
    console.log('📝 Inside editor update');
    let selection = $getSelection();

    // If no selection, try to get previous selection
    if (!selection || !$isRangeSelection(selection)) {
      selection = $getPreviousSelection();
      if (selection) {
        $setSelection(selection);
      }
    }

    console.log('🎯 Selection state:', {
      hasSelection: !!selection,
      isRangeSelection: selection && $isRangeSelection(selection),
      text:
        selection && $isRangeSelection(selection)
          ? selection.getTextContent()
          : null,
    });

    if (!selection || !$isRangeSelection(selection)) {
      console.warn('⚠️ No valid selection to format');
      return;
    }

    // Apply format
    console.log('✨ Applying format command:', format);
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);

    // Ensure selection is maintained
    editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);

    console.log('✅ Format operation complete');
  });
};

export const isFormatActive = (
  activeFormats: Set<string>,
  format: TextFormatType
) => {
  const isActive = activeFormats.has(format);
  console.log('🔍 Checking format active:', { format, isActive });
  return isActive;
};
