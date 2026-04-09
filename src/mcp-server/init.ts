import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LarkMcpConfig } from '../utils/config';
import { TokenManager } from '../auth/token-manager';
import { McpTool, MiddlewareContext } from '../mcp-tool/types';
import { larkApiHandler } from '../mcp-tool/handler';
import { composeMiddleware } from '../mcp-tool/middleware/chain';
import { errorHandlerMiddleware } from '../mcp-tool/middleware/error-handler';
import { validationMiddleware } from '../mcp-tool/middleware/validation';
import { rateLimiterMiddleware } from '../mcp-tool/middleware/rate-limiter';
import { allTools, filterTools } from '../mcp-tool/registry';

export interface InitResult {
  mcpServer: McpServer;
  toolCount: number;
  createServer: () => McpServer;
}

export function initLarkMcpServer(config: LarkMcpConfig): InitResult {
  const tokenManager = new TokenManager({
    appId: config.appId,
    appSecret: config.appSecret,
    baseUrl: config.baseUrl,
  });

  const tools: McpTool[] = filterTools(allTools, config.tools ?? []);
  const middlewares = [errorHandlerMiddleware, validationMiddleware, rateLimiterMiddleware];

  function createServer(): McpServer {
    const server = new McpServer({ name: 'lark-mcp', version: '0.1.0' });

    for (const tool of tools) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.tool(tool.name, tool.description, tool.schema.shape, async (args: any) => {
        const accessToken = await tokenManager.getAccessToken();
        const ctx: MiddlewareContext = {
          tool,
          params: args as Record<string, unknown>,
          accessToken,
          baseUrl: config.baseUrl,
          meta: { rateLimit: config.rateLimit ?? 50 },
        };

        const toolHandler = tool.customHandler ?? larkApiHandler;
        const chain = composeMiddleware(middlewares, toolHandler);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return chain(ctx) as Promise<any>;
      });
    }

    return server;
  }

  return {
    mcpServer: createServer(),
    toolCount: tools.length,
    createServer,
  };
}
