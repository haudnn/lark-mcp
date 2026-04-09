import axios from 'axios';
import { logger } from '../utils/logger';
import { MiddlewareContext, CallToolResult } from './types';

interface LarkApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

export async function larkApiHandler(ctx: MiddlewareContext): Promise<CallToolResult> {
  const { tool, params, accessToken, baseUrl } = ctx;

  // Extract path parameters
  const pathParamKeys = extractPathParamKeys(tool.path);
  const resolvedPath = replacePathParams(tool.path, params, pathParamKeys);
  const url = `${baseUrl}${resolvedPath}`;

  // Separate path params from remaining params
  const remainingParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => !pathParamKeys.includes(key))
  );

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    let response;

    if (tool.httpMethod === 'GET') {
      response = await axios.get<LarkApiResponse>(url, {
        headers,
        params: remainingParams,
      });
    } else if (tool.httpMethod === 'POST') {
      response = await axios.post<LarkApiResponse>(url, remainingParams, {
        headers,
      });
    } else if (tool.httpMethod === 'PUT') {
      response = await axios.put<LarkApiResponse>(url, remainingParams, {
        headers,
      });
    } else if (tool.httpMethod === 'PATCH') {
      response = await axios.patch<LarkApiResponse>(url, remainingParams, {
        headers,
      });
    } else if (tool.httpMethod === 'DELETE') {
      response = await axios.delete<LarkApiResponse>(url, {
        headers,
        data: remainingParams,
      });
    } else {
      throw new Error(`Unsupported HTTP method: ${tool.httpMethod}`);
    }

    const { code, msg, data } = response.data;

    if (code !== 0) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ code, msg: msg || 'Unknown error' }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data ?? response.data),
        },
      ],
    };
  } catch (error) {
    logger.error('Lark API handler error', error);
    throw error;
  }
}

function extractPathParamKeys(path: string): string[] {
  const matches = path.match(/{(\w+)}/g);
  if (!matches) return [];
  return matches.map((match) => match.slice(1, -1)); // Remove { and }
}

function replacePathParams(
  path: string,
  params: Record<string, any>,
  pathParamKeys: string[]
): string {
  let resolved = path;
  for (const key of pathParamKeys) {
    const value = params[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing required path parameter: ${key}`);
    }
    resolved = resolved.replace(`{${key}}`, String(value));
  }
  return resolved;
}
