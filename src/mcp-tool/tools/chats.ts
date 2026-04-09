import { z } from 'zod';
import { McpTool } from '../types';

export const chatTools: McpTool[] = [
  {
    name: 'lark_chat_list',
    project: 'chats',
    description: 'List all chats accessible by the user in Lark',
    schema: z.object({
      user_id_type: z
        .enum(['open_id', 'user_id', 'union_id'])
        .optional()
        .describe('Type of the user ID for filtering'),
      page_token: z.string().optional().describe('Pagination token for the next page'),
      page_size: z.number().optional().describe('Number of chats per page'),
    }),
    httpMethod: 'GET',
    path: '/im/v1/chats',
  },
  {
    name: 'lark_chat_get',
    project: 'chats',
    description: 'Get details of a specific chat in Lark',
    schema: z.object({
      chat_id: z.string().describe('ID of the chat to retrieve'),
      user_id_type: z
        .enum(['open_id', 'user_id', 'union_id'])
        .optional()
        .describe('Type of the user ID for context'),
    }),
    httpMethod: 'GET',
    path: '/im/v1/chats/{chat_id}',
  },
  {
    name: 'lark_chat_members',
    project: 'chats',
    description: 'List members of a specific chat in Lark',
    schema: z.object({
      chat_id: z.string().describe('ID of the chat'),
      member_id_type: z
        .enum(['open_id', 'user_id', 'union_id'])
        .optional()
        .describe('Type of the member ID to return'),
      page_token: z.string().optional().describe('Pagination token for the next page'),
      page_size: z.number().optional().describe('Number of members per page'),
    }),
    httpMethod: 'GET',
    path: '/im/v1/chats/{chat_id}/members',
  },
];
