import { McpTool } from './types';
import { messageTools } from './tools/messages';
import { chatTools } from './tools/chats';
import { baseTools } from './tools/base';
import { sheetTools } from './tools/sheets';
import { documentTools } from './tools/documents';
import { taskTools } from './tools/tasks';

export const allTools: McpTool[] = [
  ...messageTools,
  ...chatTools,
  ...baseTools,
  ...sheetTools,
  ...documentTools,
  ...taskTools,
];

export const PRESETS: Record<string, string[]> = {
  'preset.default': allTools.map((t) => t.name),
  'preset.readonly': allTools.filter((t) => t.httpMethod === 'GET').map((t) => t.name),
  'preset.messages': [...messageTools, ...chatTools].map((t) => t.name),
  'preset.docs': [...baseTools, ...sheetTools, ...documentTools].map((t) => t.name),
  'preset.tasks': taskTools.map((t) => t.name),
};

export function filterTools(tools: McpTool[], filter: string[]): McpTool[] {
  if (!filter || filter.length === 0) return tools;
  const filterSet = new Set(filter);
  return tools.filter((t) => filterSet.has(t.name) || filterSet.has(t.project));
}
