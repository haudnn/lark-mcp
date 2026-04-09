#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { logger } from './utils/logger';
import { initLarkMcpServer } from './mcp-server/init';
import { startStdioTransport } from './mcp-server/transport/stdio';
import { startHttpTransport } from './mcp-server/transport/http';
import { allTools, filterTools, PRESETS } from './mcp-tool/registry';
import { resolveToolFilter } from './mcp-tool/presets';
import { validateConfig, loadConfigFromEnv, LarkMcpConfig } from './utils/config';

// Load environment variables from .env file
dotenv.config();

const program = new Command();

program.name('lark-mcp').description('Lark MCP server').version('0.1.0');

// MCP server subcommand
program
  .command('mcp')
  .description('Start the Lark MCP server')
  .option('--app-id <id>', 'Lark app ID (or LARK_APP_ID env)')
  .option('--app-secret <secret>', 'Lark app secret (or LARK_APP_SECRET env)')
  .option('--base-url <url>', 'Base URL (default: https://open.larksuite.com/open-apis)')
  .option('--mode <mode>', 'Transport: stdio or http (default: stdio)', 'stdio')
  .option('--port <port>', 'HTTP port (default: 3000, only for --mode http)', '3000')
  .option('--tools <tools>', 'Comma-separated tool names or preset key')
  .action(async (options) => {
    try {
      // Load environment variables
      const envConfig = loadConfigFromEnv();

      // Merge CLI args with env vars (CLI takes precedence)
      const config: Partial<LarkMcpConfig> = {
        appId: options.appId || envConfig.appId,
        appSecret: options.appSecret || envConfig.appSecret,
        baseUrl: options.baseUrl || envConfig.baseUrl,
        port: parseInt(options.port, 10) || envConfig.port,
        rateLimit: envConfig.rateLimit,
      };

      // Validate configuration
      const validatedConfig = validateConfig(config);

      // Parse tools argument
      let toolNames: string[] = [];
      if (options.tools) {
        const toolsArg = options.tools.split(',').map((s: string) => s.trim());
        toolNames = [];
        for (const tool of toolsArg) {
          const resolved = resolveToolFilter(tool);
          toolNames.push(...resolved);
        }
        validatedConfig.tools = toolNames;
      }

      // Initialize MCP server with configuration
      const { mcpServer, toolCount, createServer } = initLarkMcpServer(validatedConfig);

      // Start transport based on mode
      if (options.mode === 'http') {
        const port = validatedConfig.port || 3000;
        logger.info(`Starting Lark MCP HTTP server with ${toolCount} tools`);
        await startHttpTransport(createServer, port);
      } else {
        logger.info(`Starting Lark MCP stdio server with ${toolCount} tools`);
        await startStdioTransport(mcpServer);
      }
    } catch (error) {
      logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Tools subcommand
program
  .command('tools')
  .description('List available tools')
  .option('--project <project>', 'Filter by project (messages, chats, base, sheets, documents, tasks)')
  .action((options) => {
    try {
      let tools = allTools;

      if (options.project) {
        tools = tools.filter((t) => t.project === options.project);
      }

      // Print tools to stdout, one per line
      for (const tool of tools) {
        console.log(`${tool.name}\t${tool.description}`);
      }
    } catch (error) {
      logger.error(`Failed to list tools: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
