import { z } from 'zod';

export interface McpTool {
  name: string;
  project: string; // 'messages' | 'chats' | 'base' | 'sheets' | 'documents' | 'tasks'
  description: string;
  schema: z.ZodObject<any>;
  httpMethod: string; // GET | POST | PUT | PATCH | DELETE
  path: string; // e.g. /im/v1/messages — {key} for path params
  customHandler?: McpHandler;
}

export type McpHandler = (ctx: MiddlewareContext) => Promise<CallToolResult>;

export interface MiddlewareContext {
  tool: McpTool;
  params: Record<string, any>;
  accessToken: string;
  baseUrl: string;
  meta: Record<string, any>;
}

export type MiddlewareFn = (
  ctx: MiddlewareContext,
  next: () => Promise<CallToolResult>
) => Promise<CallToolResult>;

export interface CallToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}
