import React from 'react';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { FormatTrackerPlugin } from './formatTracker';

export interface CorePluginProps {
  onChange?: () => void;
}

export function CorePlugins({ onChange }: CorePluginProps): JSX.Element {
  return (
    <React.Fragment>
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <LinkPlugin />
      <TabIndentationPlugin />
      <MarkdownShortcutPlugin />
      <CheckListPlugin />
      <TablePlugin />
      <HorizontalRulePlugin />
      <FormatTrackerPlugin />
      {onChange && <OnChangePlugin onChange={onChange} />}
    </React.Fragment>
  );
}
