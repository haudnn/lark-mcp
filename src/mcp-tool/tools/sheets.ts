import { z } from 'zod';
import { McpTool } from '../types';

export const sheetTools: McpTool[] = [
  {
    name: 'lark_sheet_create',
    project: 'sheets',
    description: 'Create a new Lark spreadsheet',
    schema: z.object({
      title: z.string().describe('Spreadsheet title'),
      folder_token: z.string().optional().describe('Parent folder token'),
    }),
    httpMethod: 'POST',
    path: '/sheets/v3/spreadsheets',
  },
  {
    name: 'lark_sheet_get',
    project: 'sheets',
    description: 'Get spreadsheet metadata',
    schema: z.object({
      spreadsheetToken: z.string(),
    }),
    httpMethod: 'GET',
    path: '/sheets/v3/spreadsheets/{spreadsheetToken}',
  },
  {
    name: 'lark_sheet_list',
    project: 'sheets',
    description: 'List all sheets in a spreadsheet',
    schema: z.object({
      spreadsheetToken: z.string(),
    }),
    httpMethod: 'GET',
    path: '/sheets/v3/spreadsheets/{spreadsheetToken}/sheets/query',
  },
  {
    name: 'lark_sheet_values_read',
    project: 'sheets',
    description: 'Read cell values from a sheet range',
    schema: z.object({
      spreadsheetToken: z.string(),
      range: z.string().describe('Cell range e.g. Sheet1!A1:C5 or sheetId!A1:C5'),
    }),
    httpMethod: 'GET',
    path: '/sheets/v2/spreadsheets/{spreadsheetToken}/values/{range}',
  },
  {
    name: 'lark_sheet_values_write',
    project: 'sheets',
    description: 'Write values to a sheet range',
    schema: z.object({
      spreadsheetToken: z.string(),
      valueRange: z.object({
        range: z.string().describe('Target range e.g. Sheet1!A1:C3'),
        values: z.array(z.array(z.any())).describe('2D array of cell values'),
      }).describe('Range and values to write'),
    }),
    httpMethod: 'PUT',
    path: '/sheets/v2/spreadsheets/{spreadsheetToken}/values',
  },
  {
    name: 'lark_sheet_values_append',
    project: 'sheets',
    description: 'Append rows to a sheet',
    schema: z.object({
      spreadsheetToken: z.string(),
      valueRange: z.object({
        range: z.string().describe('Target range to append to'),
        values: z.array(z.array(z.any())).describe('2D array of rows to append'),
      }),
      insertDataOption: z
        .enum(['OVERWRITE', 'INSERT_ROWS'])
        .optional()
        .describe('How to insert: OVERWRITE or INSERT_ROWS'),
    }),
    httpMethod: 'POST',
    path: '/sheets/v2/spreadsheets/{spreadsheetToken}/values_append',
  },
];
