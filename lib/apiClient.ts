/**
 * Client HTTP pour les appels API
 * 
 * Gère les requêtes vers l'API .NET 8 avec retry, timeout, et gestion d'erreurs
 */

import { apiConfig } from '../config/apiMode';

const TOKEN_KEY = 'sailingloc_auth_token';
const REFRESH_KEY = TOKEN_KEY + '_refresh';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = apiConfig.apiBaseUrl;
    this.timeout = apiConfig.options.timeout;
    this.retryAttempts = apiConfig.options.retryAttempts;
  }

  /**
   * Effectue une requête HTTP avec retry et timeout
   */
  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    attempt: number = 0
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // If body is FormData, don't set Content-Type (browser will set the correct boundary)
      const isFormData = options.body instanceof FormData;
      const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry en cas d'échec (sauf si c'est une erreur d'abort)
      if (attempt < this.retryAttempts && error instanceof Error && error.name !== 'AbortError') {
        console.warn(`Retry attempt ${attempt + 1} for ${url}`);
        await this.delay(1000 * (attempt + 1)); // Délai exponentiel
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      throw error;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return false;

    try {
      const resp = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!resp.ok) {
        // refresh failed, clear tokens
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        return false;
      }

      const data = await resp.json();
      const accessToken = data.accessToken || data.tokens?.accessToken || data.token;
      const newRefresh = data.refreshToken || data.tokens?.refreshToken;

      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }
      if (newRefresh) {
        localStorage.setItem(REFRESH_KEY, newRefresh);
      }

      return true;
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      return false;
    }
  }

  private async requestWithAuthRetry<T>(
    endpoint: string,
    options: RequestInit,
    retryAttempted = false
  ): Promise<ApiResponse<T>> {
    try {
      // Attach Authorization header if token present
      const token = localStorage.getItem(TOKEN_KEY);
      const headers = { ...(options.headers as Record<string, string> || {}) };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await this.fetchWithRetry(`${this.baseUrl}${endpoint}`, { ...options, headers });

      if (response.status === 401 && !retryAttempted) {
        // Try refresh
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry original request once with new token
          return this.requestWithAuthRetry<T>(endpoint, options, true);
        }
        return { error: `HTTP ${response.status}: ${response.statusText}`, status: response.status };
      }

      if (!response.ok) {
        // Try to parse a JSON error body to surface server messages (eg. { message: '...' })
        let serverMessage = '';
        try {
          const errBody = await response.json();
          if (errBody && typeof errBody === 'object') {
            serverMessage = (errBody.message && typeof errBody.message === 'string')
              ? errBody.message
              : JSON.stringify(errBody);
          }
        } catch (e) {
          // ignore parse errors
        }

        const composed = serverMessage ? `HTTP ${response.status}: ${response.statusText} - ${serverMessage}` : `HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(composed, response.status);
      }

      // Read body as text first — some successful endpoints return 200/204 with empty body.
      try {
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();

        if (!text || text.trim().length === 0) {
          // Empty body — return null data but keep status
          return { data: null as unknown as T, status: response.status };
        }

        if (contentType.includes('application/json')) {
          try {
            const parsed = JSON.parse(text);
            return { data: parsed as T, status: response.status };
          } catch (e) {
            // Failed to parse JSON despite content-type — return raw text
            return { data: text as unknown as T, status: response.status };
          }
        }

        // Not JSON content-type — return raw text
        return { data: text as unknown as T, status: response.status };
      } catch (e) {
        // If something unexpected happens reading the body, return null data.
        return { data: null as unknown as T, status: response.status };
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message, status: error.status };
      }
      return { error: error instanceof Error ? error.message : 'Unknown error', status: 500 };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.requestWithAuthRetry<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T, D = any>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    return this.requestWithAuthRetry<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  /**
   * POST request with FormData body (do not JSON.stringify)
   */
  async postForm<T>(endpoint: string, form: FormData): Promise<ApiResponse<T>> {
    return this.requestWithAuthRetry<T>(endpoint, { method: 'POST', body: form });
  }

  /**
   * PUT request
   */
  async put<T, D = any>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    return this.requestWithAuthRetry<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.requestWithAuthRetry<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T, D = any>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    return this.requestWithAuthRetry<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
  }

  /**
   * Download binary content from the API and return blob + metadata
   */
  async download(endpoint: string): Promise<{ blob?: Blob; contentType?: string | null; filename?: string | null; error?: string; status: number }> {
    try {
      // Attach token header
      const token = localStorage.getItem(TOKEN_KEY);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await this.fetchWithRetry(`${this.baseUrl}${endpoint}`, { method: 'GET', headers });

      if (response.status === 401) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // retry once
          const token2 = localStorage.getItem(TOKEN_KEY);
          const headers2: Record<string, string> = {};
          if (token2) headers2['Authorization'] = `Bearer ${token2}`;
          const resp2 = await this.fetchWithRetry(`${this.baseUrl}${endpoint}`, { method: 'GET', headers: headers2 });
          if (!resp2.ok) {
            return { error: `HTTP ${resp2.status}: ${resp2.statusText}`, status: resp2.status };
          }
          const blob2 = await resp2.blob();
          const ct2 = resp2.headers.get('content-type');
          const cd2 = resp2.headers.get('content-disposition');
          return { blob: blob2, contentType: ct2, filename: cd2 || null, status: resp2.status };
        }
        return { error: `HTTP 401: Unauthorized`, status: 401 };
      }

      if (!response.ok) {
        // try to parse JSON error
        try {
          const errBody = await response.json();
          return { error: JSON.stringify(errBody), status: response.status };
        } catch {
          return { error: `HTTP ${response.status}: ${response.statusText}`, status: response.status };
        }
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type');
      const contentDisp = response.headers.get('content-disposition');
      return { blob, contentType, filename: contentDisp || null, status: response.status };
    } catch (e: any) {
      return { error: e?.message || 'Unknown error', status: 500 };
    }
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient();
