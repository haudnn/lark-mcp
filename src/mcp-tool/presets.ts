import { PRESETS } from './registry';

export function resolveToolFilter(presetOrTools: string): string[] {
  if (PRESETS[presetOrTools]) {
    return PRESETS[presetOrTools];
  }
  return [presetOrTools]; // treat as single tool name
}
