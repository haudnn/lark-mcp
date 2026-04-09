import { z } from 'zod';
import { McpTool } from '../types';

export const documentTools: McpTool[] = [
  {
    name: 'lark_document_create',
    project: 'documents',
    description: 'Create a new Lark document',
    schema: z.object({
      title: z.string().optional().describe('Document title'),
      folder_token: z.string().optional().describe('Parent folder token'),
    }),
    httpMethod: 'POST',
    path: '/docx/v1/documents',
  },
  {
    name: 'lark_document_get',
    project: 'documents',
    description: 'Get document metadata',
    schema: z.object({
      document_id: z.string(),
    }),
    httpMethod: 'GET',
    path: '/docx/v1/documents/{document_id}',
  },
  {
    name: 'lark_document_content',
    project: 'documents',
    description: 'Get the raw text content of a document',
    schema: z.object({
      document_id: z.string(),
      lang: z.number().optional().describe('Language 0=default'),
    }),
    httpMethod: 'GET',
    path: '/docx/v1/documents/{document_id}/raw_content',
  },
  {
    name: 'lark_document_blocks_list',
    project: 'documents',
    description: 'List all blocks in a document',
    schema: z.object({
      document_id: z.string(),
      page_token: z.string().optional(),
      page_size: z.number().optional(),
    }),
    httpMethod: 'GET',
    path: '/docx/v1/documents/{document_id}/blocks',
  },
  {
    name: 'lark_document_block_create',
    project: 'documents',
    description: 'Add child blocks to a document block',
    schema: z.object({
      document_id: z.string(),
      block_id: z.string().describe('Parent block ID — use lark_document_blocks_list to find block IDs'),
      children: z
        .array(z.record(z.string(), z.any()))
        .describe('Array of block objects to insert'),
      index: z.number().optional().describe('Insert position index'),
    }),
    httpMethod: 'POST',
    path: '/docx/v1/documents/{document_id}/blocks/{block_id}/children',
  },
  {
    name: 'lark_document_block_update',
    project: 'documents',
    description: 'Update a block in a document',
    schema: z.object({
      document_id: z.string(),
      block_id: z.string(),
      update_block_type: z.number().describe('Block type to update to'),
      body: z.record(z.string(), z.any()).describe('Block body content'),
    }),
    httpMethod: 'PATCH',
    path: '/docx/v1/documents/{document_id}/blocks/{block_id}',
  },
];
