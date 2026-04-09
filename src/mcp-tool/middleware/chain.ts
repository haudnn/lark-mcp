import { MiddlewareFn, McpHandler, MiddlewareContext, CallToolResult } from '../types';

export function composeMiddleware(
  middlewares: MiddlewareFn[],
  finalHandler: McpHandler
): McpHandler {
  return async (ctx: MiddlewareContext): Promise<CallToolResult> => {
    let index = -1;

    async function dispatch(i: number): Promise<CallToolResult> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;

      if (i === middlewares.length) {
        return finalHandler(ctx);
      }

      const middleware = middlewares[i];
      return middleware(ctx, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
}
