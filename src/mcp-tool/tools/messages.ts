import { z } from 'zod';
import axios from 'axios';
import { McpTool, MiddlewareContext, CallToolResult } from '../types';
import { logger } from '../../utils/logger';

interface LarkApiResponse {
  code: number;
  msg?: string;
  data?: any;
}

// Custom handler for lark_message_send
// receive_id_type goes as query param, rest as body
async function messagesSendHandler(ctx: MiddlewareContext): Promise<CallToolResult> {
  const { params, accessToken, baseUrl } = ctx;
  const { receive_id_type, receive_id, msg_type, content, uuid } = params;

  const url = `${baseUrl}/im/v1/messages?receive_id_type=${receive_id_type}`;
  const body: Record<string, any> = {
    receive_id,
    msg_type,
    content,
  };

  if (uuid !== undefined) {
    body.uuid = uuid;
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post<LarkApiResponse>(url, body, { headers });

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
    logger.error('Lark message send handler error', error);
    throw error;
  }
}

// Custom handler for lark_message_reply
// receive_id_type not needed, just POST to /im/v1/messages/{message_id}/reply
async function messagesReplyHandler(ctx: MiddlewareContext): Promise<CallToolResult> {
  const { params, accessToken, baseUrl } = ctx;
  const { message_id, msg_type, content, uuid } = params;

  const url = `${baseUrl}/im/v1/messages/${message_id}/reply`;
  const body: Record<string, any> = {
    msg_type,
    content,
  };

  if (uuid !== undefined) {
    body.uuid = uuid;
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post<LarkApiResponse>(url, body, { headers });

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
    logger.error('Lark message reply handler error', error);
    throw error;
  }
}

// Custom handler for lark_message_forward
// receive_id_type goes as query param
async function messagesForwardHandler(ctx: MiddlewareContext): Promise<CallToolResult> {
  const { params, accessToken, baseUrl } = ctx;
  const { message_id, receive_id, receive_id_type, uuid } = params;

  const url = `${baseUrl}/im/v1/messages/${message_id}/forward?receive_id_type=${receive_id_type}`;
  const body: Record<string, any> = {
    receive_id,
  };

  if (uuid !== undefined) {
    body.uuid = uuid;
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post<LarkApiResponse>(url, body, { headers });

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
    logger.error('Lark message forward handler error', error);
    throw error;
  }
}

export const messageTools: McpTool[] = [
  {
    name: 'lark_message_send',
    project: 'messages',
    description: 'Send a message to a user or group chat in Lark',
    schema: z.object({
      receive_id_type: z
        .enum(['open_id', 'user_id', 'union_id', 'email', 'chat_id'])
        .describe('Type of the recipient ID'),
      receive_id: z.string().describe('Recipient ID matching receive_id_type'),
      msg_type: z
        .enum(['text', 'post', 'image', 'file', 'audio', 'media', 'sticker', 'interactive', 'share_chat', 'share_user'])
        .describe('Message type'),
      content: z.string().describe('JSON-serialized message content. For text: {"text":"hello"}'),
      uuid: z.string().optional().describe('Deduplication key (max 50 chars)'),
    }),
    httpMethod: 'POST',
    path: '/im/v1/messages',
    customHandler: messagesSendHandler,
  },
  {
    name: 'lark_message_reply',
    project: 'messages',
    description: 'Reply to a message in Lark',
    schema: z.object({
      message_id: z.string().describe('ID of the message to reply to'),
      msg_type: z
        .enum(['text', 'post', 'image', 'file', 'audio', 'media', 'sticker', 'interactive', 'share_chat', 'share_user'])
        .describe('Message type'),
      content: z.string().describe('JSON-serialized message content'),
      uuid: z.string().optional().describe('Deduplication key (max 50 chars)'),
    }),
    httpMethod: 'POST',
    path: '/im/v1/messages/{message_id}/reply',
    customHandler: messagesReplyHandler,
  },
  {
    name: 'lark_message_get',
    project: 'messages',
    description: 'Get details of a specific message in Lark',
    schema: z.object({
      message_id: z.string().describe('ID of the message to retrieve'),
    }),
    httpMethod: 'GET',
    path: '/im/v1/messages/{message_id}',
  },
  {
    name: 'lark_message_list',
    project: 'messages',
    description: 'List messages from a container (chat) in Lark',
    schema: z.object({
      container_id_type: z.enum(['chat']).describe('Type of the container (currently only chat is supported)'),
      container_id: z.string().describe('ID of the container (chat)'),
      page_token: z.string().optional().describe('Pagination token for the next page'),
      page_size: z.number().optional().describe('Number of messages per page'),
    }),
    httpMethod: 'GET',
    path: '/im/v1/messages',
  },
  {
    name: 'lark_message_update',
    project: 'messages',
    description: 'Update a message in Lark',
    schema: z.object({
      message_id: z.string().describe('ID of the message to update'),
      msg_type: z
        .enum(['text', 'post', 'image', 'file', 'audio', 'media', 'sticker', 'interactive', 'share_chat', 'share_user'])
        .describe('Message type'),
      content: z.string().describe('JSON-serialized message content'),
    }),
    httpMethod: 'PATCH',
    path: '/im/v1/messages/{message_id}',
  },
  {
    name: 'lark_message_delete',
    project: 'messages',
    description: 'Delete a message in Lark',
    schema: z.object({
      message_id: z.string().describe('ID of the message to delete'),
    }),
    httpMethod: 'DELETE',
    path: '/im/v1/messages/{message_id}',
  },
  {
    name: 'lark_message_forward',
    project: 'messages',
    description: 'Forward a message to another recipient in Lark',
    schema: z.object({
      message_id: z.string().describe('ID of the message to forward'),
      receive_id: z.string().describe('Recipient ID'),
      receive_id_type: z
        .enum(['open_id', 'user_id', 'union_id', 'email', 'chat_id'])
        .describe('Type of the recipient ID'),
      uuid: z.string().optional().describe('Deduplication key (max 50 chars)'),
    }),
    httpMethod: 'POST',
    path: '/im/v1/messages/{message_id}/forward',
    customHandler: messagesForwardHandler,
  },
];
