import { randomUUID } from 'crypto';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../../utils/logger';

type ServerFactory = () => McpServer;

export async function startHttpTransport(
  createServer: ServerFactory,
  port: number
): Promise<void> {
  const app = express();
  app.use(express.json());

  // Session store: sessionId → transport
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    // Reuse existing session
    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // Reject non-initialize requests without a session
    if (sessionId || !isInitializeRequest(req.body)) {
      res.status(400).json({ error: 'Invalid or missing session ID' });
      return;
    }

    // New session for initialize request
    const newSessionId = randomUUID();
    logger.debug(`New MCP session: ${newSessionId}`);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
    });

    sessions.set(newSessionId, transport);
    transport.onclose = () => {
      sessions.delete(newSessionId);
      logger.debug(`Session closed: ${newSessionId}`);
    };

    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // SSE stream for server-sent events
  app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: 'Invalid or missing session ID' });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // Session termination
  app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: 'Invalid or missing session ID' });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  app.listen(port, () => {
    logger.info(`Lark MCP HTTP server listening on port ${port}`);
  });
}
