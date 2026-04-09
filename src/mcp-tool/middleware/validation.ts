import { ZodError } from 'zod';
import { logger } from '../../utils/logger';
import { MiddlewareFn, CallToolResult, MiddlewareContext } from '../types';

export const validationMiddleware: MiddlewareFn = async (
  ctx: MiddlewareContext,
  next
): Promise<CallToolResult> => {
  try {
    await ctx.tool.schema.parseAsync(ctx.params);
    return next();
  } catch (error) {
    logger.error('Validation error', error);

    let errorMessage = 'Validation error';
    if (error instanceof ZodError) {
      const issues = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      errorMessage = `Validation error: ${issues}`;
    }

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: errorMessage,
        },
      ],
    };
  }
};
