import axios from 'axios';
import { TokenManager } from '../../src/auth/token-manager';

jest.mock('axios');
jest.mock('../../src/utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeResponse(token: string, expire = 7200) {
  return { data: { code: 0, msg: 'success', tenant_access_token: token, expire } };
}

describe('TokenManager', () => {
  const opts = {
    appId: 'test-app-id',
    appSecret: 'test-app-secret',
    baseUrl: 'https://api.example.com',
    refreshBufferSeconds: 300,
  };

  let mockPost: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPost = jest.fn();
    mockedAxios.create.mockReturnValue({ post: mockPost } as any);
  });

  test('returns new token on first call', async () => {
    mockPost.mockResolvedValue(makeResponse('tok1'));
    const manager = new TokenManager(opts);

    const token = await manager.getAccessToken();

    expect(token).toBe('tok1');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining('/auth/v3/tenant_access_token/internal'),
      { app_id: opts.appId, app_secret: opts.appSecret }
    );
  });

  test('returns cached token within TTL', async () => {
    mockPost.mockResolvedValue(makeResponse('tok1'));
    const manager = new TokenManager(opts);

    const token1 = await manager.getAccessToken();
    const token2 = await manager.getAccessToken();

    expect(token1).toBe('tok1');
    expect(token2).toBe('tok1');
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test('concurrent calls share one in-flight request', async () => {
    mockPost.mockResolvedValue(makeResponse('tok1'));
    const manager = new TokenManager(opts);

    const [t1, t2, t3] = await Promise.all([
      manager.getAccessToken(),
      manager.getAccessToken(),
      manager.getAccessToken(),
    ]);

    expect(t1).toBe('tok1');
    expect(t2).toBe('tok1');
    expect(t3).toBe('tok1');
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test('refreshes token when near expiry', async () => {
    mockPost.mockResolvedValueOnce(makeResponse('tok1'));
    const manager = new TokenManager(opts);

    const token1 = await manager.getAccessToken();
    expect(token1).toBe('tok1');
    expect(mockPost).toHaveBeenCalledTimes(1);

    // Force token into near-expiry window
    (manager as any).expiresAt = Date.now() + 300 * 1000 - 1000;

    mockPost.mockResolvedValueOnce(makeResponse('tok2'));
    const token2 = await manager.getAccessToken();

    expect(token2).toBe('tok2');
    expect(mockPost).toHaveBeenCalledTimes(2);
  });
});
