import { z } from 'zod';
import { McpTool } from '../types';

export const baseTools: McpTool[] = [
  {
    name: 'lark_base_create',
    project: 'base',
    description: 'Create a new Lark base (app)',
    schema: z.object({
      name: z.string().describe('App name'),
      folder_token: z.string().optional().describe('Parent folder token'),
    }),
    httpMethod: 'POST',
    path: '/bitable/v1/apps',
  },
  {
    name: 'lark_base_get',
    project: 'base',
    description: 'Get a Lark base by token',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
    }),
    httpMethod: 'GET',
    path: '/bitable/v1/apps/{app_token}',
  },
  {
    name: 'lark_base_table_list',
    project: 'base',
    description: 'List tables in a Lark base',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      page_token: z.string().optional().describe('Pagination token'),
      page_size: z.number().optional().describe('Number of records per page'),
    }),
    httpMethod: 'GET',
    path: '/bitable/v1/apps/{app_token}/tables',
  },
  {
    name: 'lark_base_table_create',
    project: 'base',
    description: 'Create a new table in a Lark base',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      name: z.string().describe('Table name'),
      default_view_name: z.string().optional().describe('Default view name'),
      fields: z
        .array(
          z.object({
            field_name: z.string().describe('Field name'),
            type: z.number().describe('Field type'),
          })
        )
        .optional()
        .describe('Fields for the table'),
    }),
    httpMethod: 'POST',
    path: '/bitable/v1/apps/{app_token}/tables',
  },
  {
    name: 'lark_base_record_list',
    project: 'base',
    description: 'List records in a Lark base table',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      table_id: z.string().describe('Table ID'),
      filter: z.string().optional().describe('Filter formula'),
      sort: z.string().optional().describe('Sort order'),
      page_token: z.string().optional().describe('Pagination token'),
      page_size: z.number().optional().describe('Number of records per page'),
    }),
    httpMethod: 'GET',
    path: '/bitable/v1/apps/{app_token}/tables/{table_id}/records',
  },
  {
    name: 'lark_base_record_get',
    project: 'base',
    description: 'Get a specific record from a Lark base table',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      table_id: z.string().describe('Table ID'),
      record_id: z.string().describe('Record ID'),
    }),
    httpMethod: 'GET',
    path: '/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}',
  },
  {
    name: 'lark_base_record_create',
    project: 'base',
    description: 'Create a new record in a Lark base table',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      table_id: z.string().describe('Table ID'),
      fields: z.record(z.string(), z.any()).describe('Record fields as key-value pairs'),
    }),
    httpMethod: 'POST',
    path: '/bitable/v1/apps/{app_token}/tables/{table_id}/records',
  },
  {
    name: 'lark_base_record_update',
    project: 'base',
    description: 'Update a record in a Lark base table',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      table_id: z.string().describe('Table ID'),
      record_id: z.string().describe('Record ID'),
      fields: z.record(z.string(), z.any()).describe('Record fields to update'),
    }),
    httpMethod: 'PUT',
    path: '/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}',
  },
  {
    name: 'lark_base_record_delete',
    project: 'base',
    description: 'Delete a record from a Lark base table',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      table_id: z.string().describe('Table ID'),
      record_id: z.string().describe('Record ID'),
    }),
    httpMethod: 'DELETE',
    path: '/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}',
  },
  {
    name: 'lark_base_field_list',
    project: 'base',
    description: 'List fields in a Lark base table',
    schema: z.object({
      app_token: z.string().describe('Base/app token'),
      table_id: z.string().describe('Table ID'),
      page_token: z.string().optional().describe('Pagination token'),
      page_size: z.number().optional().describe('Number of fields per page'),
    }),
    httpMethod: 'GET',
    path: '/bitable/v1/apps/{app_token}/tables/{table_id}/fields',
  },
];
