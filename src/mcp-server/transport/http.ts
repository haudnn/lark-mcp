import { randomUUID } from 'crypto';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logger } from '../../utils/logger';

type ServerFactory = () => McpServer;

export async function startHttpTransport(
  createServer: ServerFactory,
  port: number
): Promise<void> {
  const app = express();

  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    const sessionId = randomUUID();
    logger.debug(`New MCP session: ${sessionId}`);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
    });

    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(port, () => {
    logger.info(`Lark MCP HTTP server listening on port ${port}`);
  });
}
