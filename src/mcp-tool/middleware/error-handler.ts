import { logger } from '../../utils/logger';
import { MiddlewareFn, CallToolResult, MiddlewareContext } from '../types';

export const errorHandlerMiddleware: MiddlewareFn = async (
  ctx: MiddlewareContext,
  next
): Promise<CallToolResult> => {
  try {
    return await next();
  } catch (error: unknown) {
    logger.error('Error in MCP tool handler', error);

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Tool execution failed. Check server logs for details.',
        },
      ],
    };
  }
};
