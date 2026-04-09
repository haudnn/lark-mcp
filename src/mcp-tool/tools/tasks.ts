import { z } from 'zod';
import { McpTool } from '../types';

export const taskTools: McpTool[] = [
  {
    name: 'lark_task_create',
    project: 'tasks',
    description: 'Create a new task in Lark',
    schema: z.object({
      summary: z.string().describe('Task title/summary'),
      description: z.string().optional().describe('Task description'),
      due: z
        .object({
          time: z.string().describe('Unix timestamp in seconds'),
          is_all_day: z.boolean().optional(),
        })
        .optional()
        .describe('Task due date'),
      members: z
        .array(
          z.object({
            id: z.string(),
            type: z.enum(['user']),
            role: z.enum(['assignee', 'follower']),
          })
        )
        .optional()
        .describe('Task members'),
      tasklist_guid: z.string().optional().describe('Tasklist to add this task to'),
    }),
    httpMethod: 'POST',
    path: '/task/v2/tasks',
  },
  {
    name: 'lark_task_get',
    project: 'tasks',
    description: 'Get task details',
    schema: z.object({
      task_guid: z.string().describe('Task GUID'),
    }),
    httpMethod: 'GET',
    path: '/task/v2/tasks/{task_guid}',
  },
  {
    name: 'lark_task_list',
    project: 'tasks',
    description: 'List tasks',
    schema: z.object({
      page_size: z.number().optional().describe('Results per page (max 100)'),
      page_token: z.string().optional(),
      completed: z.boolean().optional().describe('Filter by completion status'),
    }),
    httpMethod: 'GET',
    path: '/task/v2/tasks',
  },
  {
    name: 'lark_task_update',
    project: 'tasks',
    description: 'Update a task (partial update)',
    schema: z.object({
      task_guid: z.string(),
      task: z
        .object({
          summary: z.string().optional(),
          description: z.string().optional(),
          due: z
            .object({
              time: z.string(),
              is_all_day: z.boolean().optional(),
            })
            .optional(),
        })
        .describe('Fields to update'),
      update_fields: z
        .array(z.string())
        .describe('List of field names to update e.g. ["summary","due"]'),
    }),
    httpMethod: 'PATCH',
    path: '/task/v2/tasks/{task_guid}',
  },
  {
    name: 'lark_task_delete',
    project: 'tasks',
    description: 'Delete a task',
    schema: z.object({
      task_guid: z.string(),
    }),
    httpMethod: 'DELETE',
    path: '/task/v2/tasks/{task_guid}',
  },
  {
    name: 'lark_task_complete',
    project: 'tasks',
    description: 'Mark a task as complete',
    schema: z.object({
      task_guid: z.string(),
    }),
    httpMethod: 'POST',
    path: '/task/v2/tasks/{task_guid}/complete',
  },
  {
    name: 'lark_task_add_members',
    project: 'tasks',
    description: 'Add members to a task',
    schema: z.object({
      task_guid: z.string(),
      members: z
        .array(
          z.object({
            id: z.string().describe('Member user ID'),
            type: z.enum(['user']),
            role: z.enum(['assignee', 'follower']).describe('Member role'),
          })
        )
        .describe('Members to add'),
      user_id_type: z.enum(['open_id', 'user_id', 'union_id']).optional(),
    }),
    httpMethod: 'POST',
    path: '/task/v2/tasks/{task_guid}/add_members',
  },
  {
    name: 'lark_task_remove_members',
    project: 'tasks',
    description: 'Remove members from a task',
    schema: z.object({
      task_guid: z.string(),
      members: z
        .array(
          z.object({
            id: z.string(),
            type: z.enum(['user']),
            role: z.enum(['assignee', 'follower']),
          })
        )
        .describe('Members to remove'),
      user_id_type: z.enum(['open_id', 'user_id', 'union_id']).optional(),
    }),
    httpMethod: 'POST',
    path: '/task/v2/tasks/{task_guid}/remove_members',
  },
  {
    name: 'lark_tasklist_list',
    project: 'tasks',
    description: 'List all tasklists',
    schema: z.object({
      page_size: z.number().optional(),
      page_token: z.string().optional(),
    }),
    httpMethod: 'GET',
    path: '/task/v2/tasklists',
  },
  {
    name: 'lark_tasklist_create',
    project: 'tasks',
    description: 'Create a new tasklist',
    schema: z.object({
      name: z.string().describe('Tasklist name'),
      members: z
        .array(
          z.object({
            id: z.string(),
            type: z.enum(['user']),
            role: z.enum(['editor', 'viewer']),
          })
        )
        .optional(),
    }),
    httpMethod: 'POST',
    path: '/task/v2/tasklists',
  },
];
