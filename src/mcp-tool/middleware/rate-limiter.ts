import { MiddlewareFn, CallToolResult, MiddlewareContext } from '../types';

interface RateLimitEntry {
  timestamps: number[];
}

const toolCallTimestamps = new Map<string, RateLimitEntry>();

export const rateLimiterMiddleware: MiddlewareFn = async (
  ctx: MiddlewareContext,
  next
): Promise<CallToolResult> => {
  const toolName = ctx.tool.name;
  const maxPerSecond = ctx.meta.rateLimit ?? 50;

  const now = Date.now();
  const oneSecondAgo = now - 1000;

  let entry = toolCallTimestamps.get(toolName);
  if (!entry) {
    entry = { timestamps: [] };
    toolCallTimestamps.set(toolName, entry);
  }

  // Clean old timestamps
  entry.timestamps = entry.timestamps.filter((ts) => ts > oneSecondAgo);

  if (entry.timestamps.length >= maxPerSecond) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Rate limit exceeded',
        },
      ],
    };
  }

  entry.timestamps.push(now);
  return next();
};
