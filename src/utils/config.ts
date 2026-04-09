import * as dotenv from 'dotenv';
dotenv.config();

export interface LarkMcpConfig {
  appId: string;
  appSecret: string;
  baseUrl: string;
  tools?: string[];
  port?: number;
  rateLimit?: number;
}

export const DEFAULT_BASE_URL = 'https://open.larksuite.com/open-apis';

export function loadConfigFromEnv(): Partial<LarkMcpConfig> {
  return {
    appId: process.env.LARK_APP_ID,
    appSecret: process.env.LARK_APP_SECRET,
    baseUrl: process.env.LARK_BASE_URL ?? DEFAULT_BASE_URL,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    rateLimit: process.env.LARK_RATE_LIMIT
      ? parseInt(process.env.LARK_RATE_LIMIT, 10)
      : 50,
  };
}

export function validateConfig(config: Partial<LarkMcpConfig>): LarkMcpConfig {
  if (!config.appId) throw new Error('LARK_APP_ID is required');
  if (!config.appSecret) throw new Error('LARK_APP_SECRET is required');
  return {
    appId: config.appId,
    appSecret: config.appSecret,
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    tools: config.tools,
    port: config.port ?? 3000,
    rateLimit: config.rateLimit ?? 50,
  };
}
