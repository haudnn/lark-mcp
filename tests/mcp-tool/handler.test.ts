import axios from 'axios';
import { larkApiHandler } from '../../src/mcp-tool/handler';
import { McpTool, MiddlewareContext } from '../../src/mcp-tool/types';
import { z } from 'zod';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('larkApiHandler', () => {
  const mockTool: McpTool = {
    name: 'test_get_message',
    project: 'messages',
    description: 'Get a message',
    schema: z.object({
      message_id: z.string(),
      receive_id_type: z.string().optional(),
    }),
    httpMethod: 'GET',
    path: '/im/v1/messages/{message_id}',
  };

  const mockContext: MiddlewareContext = {
    tool: mockTool,
    params: {
      message_id: 'msg123',
      receive_id_type: 'user_id',
    },
    accessToken: 'token_xyz',
    baseUrl: 'https://open.larksuite.com/open-apis',
    meta: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('replaces path params in URL', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { code: 0, data: { id: 'msg123' } },
    });

    await larkApiHandler(mockContext);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://open.larksuite.com/open-apis/im/v1/messages/msg123',
      expect.any(Object)
    );
  });

  test('removes path param keys from GET query string', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { code: 0, data: { id: 'msg123' } },
    });

    await larkApiHandler(mockContext);

    const callArgs = mockedAxios.get.mock.calls[0];
    const queryParams = callArgs[1]?.params;

    expect(queryParams).toBeDefined();
    expect(queryParams.message_id).toBeUndefined();
    expect(queryParams.receive_id_type).toBe('user_id');
  });

  test('returns isError for Lark error code', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { code: 1001, msg: 'no permission' },
    });

    const result = await larkApiHandler(mockContext);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('1001');
    expect(result.content[0].text).toContain('no permission');
  });

  test('returns text content on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { code: 0, data: { id: 'msg123', content: 'hello' } },
    });

    const result = await larkApiHandler(mockContext);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('msg123');
    expect(result.content[0].text).toContain('hello');
  });

  test('handles POST requests with body params', async () => {
    const postTool: McpTool = {
      name: 'create_message',
      project: 'messages',
      description: 'Create a message',
      schema: z.object({
        receive_id: z.string(),
        msg_type: z.string(),
        content: z.string(),
      }),
      httpMethod: 'POST',
      path: '/im/v1/messages',
    };

    const postContext: MiddlewareContext = {
      tool: postTool,
      params: {
        receive_id: 'user123',
        msg_type: 'text',
        content: 'hello',
      },
      accessToken: 'token_xyz',
      baseUrl: 'https://open.larksuite.com/open-apis',
      meta: {},
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { code: 0, data: { message_id: 'msg456' } },
    });

    const result = await larkApiHandler(postContext);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://open.larksuite.com/open-apis/im/v1/messages',
      expect.objectContaining({
        receive_id: 'user123',
        msg_type: 'text',
        content: 'hello',
      }),
      expect.any(Object)
    );

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('msg456');
  });

  test('throws error for missing path parameters', async () => {
    const missingParamContext: MiddlewareContext = {
      tool: mockTool,
      params: {
        receive_id_type: 'user_id',
        // message_id is missing
      },
      accessToken: 'token_xyz',
      baseUrl: 'https://open.larksuite.com/open-apis',
      meta: {},
    };

    await expect(larkApiHandler(missingParamContext)).rejects.toThrow(
      'Missing required path parameter: message_id'
    );
  });

  test('includes Authorization header with Bearer token', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { code: 0, data: { id: 'msg123' } },
    });

    await larkApiHandler(mockContext);

    const callArgs = mockedAxios.get.mock.calls[0];
    const headers = callArgs[1]?.headers;

    expect(headers?.Authorization).toBe('Bearer token_xyz');
    expect(headers?.['Content-Type']).toBe('application/json');
  });

  test('returns content on success without wrapper data', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { code: 0 },
    });

    const result = await larkApiHandler(mockContext);

    expect(result.isError).toBeUndefined();
    // Should return the whole response when data is not present
    expect(result.content[0].text).toBeDefined();
  });
});
