import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface TokenManagerOptions {
  appId: string;
  appSecret: string;
  baseUrl: string;
  refreshBufferSeconds?: number;
}

interface TokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

export class TokenManager {
  private appId: string;
  private appSecret: string;
  private baseUrl: string;
  private refreshBufferSeconds: number;
  private axiosInstance: AxiosInstance;

  private token: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(options: TokenManagerOptions) {
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.baseUrl = options.baseUrl;
    this.refreshBufferSeconds = options.refreshBufferSeconds ?? 300;
    this.axiosInstance = axios.create();
  }

  async getAccessToken(): Promise<string> {
    if (this.token && !this.isExpiringSoon()) {
      logger.debug('Returning cached token');
      return this.token;
    }

    if (this.refreshPromise) {
      logger.debug('Reusing in-flight refresh request');
      return this.refreshPromise;
    }

    this.refreshPromise = this.fetchToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async fetchToken(): Promise<string> {
    try {
      logger.info('Fetching new token from Lark');
      const url = `${this.baseUrl}/auth/v3/tenant_access_token/internal`;
      const response = await this.axiosInstance.post<TokenResponse>(url, {
        app_id: this.appId,
        app_secret: this.appSecret,
      });

      const { code, msg, tenant_access_token, expire } = response.data;

      if (code !== 0) {
        throw new Error(`Lark API error: code=${code}, msg=${msg}`);
      }

      const expiresIn = expire || 7200;
      this.token = tenant_access_token;
      this.expiresAt = Date.now() + expiresIn * 1000;

      logger.info(`Token fetched successfully, expires in ${expiresIn} seconds`);
      return this.token;
    } catch (error: unknown) {
      logger.error('Failed to fetch token', error);
      throw error;
    }
  }

  private isExpiringSoon(): boolean {
    const timeUntilExpiry = this.expiresAt - Date.now();
    const bufferMs = this.refreshBufferSeconds * 1000;
    return timeUntilExpiry < bufferMs;
  }
}
