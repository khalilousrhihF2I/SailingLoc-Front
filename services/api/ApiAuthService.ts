/**
 * Implémentation API du service Auth
 * Communique avec l'API .NET 8 pour l'authentification
 */

import { IAuthService, LoginCredentials, RegisterData, AuthResponse } from '../interfaces/IAuthService';
import { apiClient } from '../../lib/apiClient';
import { apiConfig } from '../../config/apiMode';
import { logApiOperation } from '../../config/apiMode';

export class ApiAuthService implements IAuthService {
  private readonly endpoint = '/auth';
  private readonly TOKEN_KEY = 'sailingloc_auth_token';
  private readonly USER_KEY = 'sailingloc_current_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    logApiOperation('auth', 'login', { email: credentials.email });
    const response = await apiClient.post<any>(`${this.endpoint}/login`, credentials);

    // Handle HTTP errors surfaced by apiClient
    if (response.error) {
      const message = response.status === 401 ? 'Invalid credentials' : response.error;
      return { success: false, message, user: { id: 0, name: '', email: '', type: 'renter' } };
    }

    const data = response.data;

    // API returns { accessToken, refreshToken, expiresAt }
    if (data && (data.accessToken || data.tokens || data.token)) {
      const accessToken = data.accessToken || data.tokens?.accessToken || data.token;
      const refreshToken = data.refreshToken || data.tokens?.refreshToken || '';
      const expiresAt = data.expiresAt || data.tokens?.expiresAt || null;

      // Store tokens and user
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(this.TOKEN_KEY + '_refresh', refreshToken);

      // If API returns user info separately, use it.
      if (data.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        return {
          success: true,
          message: data.message || 'Logged in',
          user: data.user,
          token: accessToken,
          tokens: data.tokens || (data.accessToken ? { accessToken, refreshToken, expiresAt } : undefined),
        };
      }

      // Otherwise, tokens are stored; call GET /auth/me to fetch user details
      try {
        const meResp = await apiClient.get<any>(`${this.endpoint}/me`);
        if (!meResp.error && meResp.data) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(meResp.data));
          return {
            success: true,
            message: data.message || 'Logged in',
            user: meResp.data,
            token: accessToken,
            tokens: data.tokens || (data.accessToken ? { accessToken, refreshToken, expiresAt } : undefined),
          };
        }
      } catch (e) {
        // ignore — return success with minimal info
      }

      return {
        success: true,
        message: data.message || 'Logged in',
        user: { id: 0, name: '', email: '', type: 'renter' },
        token: accessToken,
        tokens: data.tokens || (data.accessToken ? { accessToken, refreshToken, expiresAt } : undefined),
      };
    }

    return { success: false, message: 'Invalid response from auth service', user: { id: 0, name: '', email: '', type: 'renter' } };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    logApiOperation('auth', 'register', { ...data, password: '***' });
    const response = await apiClient.post<any>(`${this.endpoint}/register`, data);

    if (response.error) {
      // API may return 400 with identity errors; apiClient returns generic error message
      return { success: false, message: response.error, user: { id: 0, name: '', email: '', type: 'renter' } };
    }

    const resp = response.data;

    // Successful register may return 200 { message: "Registered" } or tokens/user
    if (resp) {
      // If backend returned ProblemDetails-like validation errors in the body, surface them as failure
      if (resp.errors && typeof resp.errors === 'object') {
        const errors: Array<{ code?: string; description?: string }> = [];
        for (const key of Object.keys(resp.errors)) {
          const arr = resp.errors[key];
          if (Array.isArray(arr)) {
            for (const msg of arr) {
              errors.push({ code: key, description: String(msg) });
            }
          }
        }

        return { success: false, message: resp.title || 'Validation failed', user: { id: 0, name: '', email: '', type: 'renter' }, errors } as any;
      }
      // If tokens provided, store them
      const accessToken = resp.accessToken || resp.tokens?.accessToken || resp.token;
      const refreshToken = resp.refreshToken || resp.tokens?.refreshToken || '';

      if (accessToken) {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        if (refreshToken) localStorage.setItem(this.TOKEN_KEY + '_refresh', refreshToken);
      }

      if (resp.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(resp.user));
        return {
          success: true,
          message: resp.message || 'Registered',
          user: resp.user,
          token: accessToken,
          tokens: resp.tokens || (accessToken ? { accessToken, refreshToken, expiresAt: resp.expiresAt } : undefined),
        };
      }

      // If no token was returned, auto-login the user using the credentials they just registered with
      if (!accessToken) {
        try {
          logApiOperation('auth', 'auto-login after register', { email: data.email });
          const loginResp = await apiClient.post<any>(`${this.endpoint}/login`, { 
            email: data.email, 
            password: data.password 
          });
          
          if (!loginResp.error && loginResp.data) {
            const loginData = loginResp.data;
            const loginAccessToken = loginData.accessToken || loginData.tokens?.accessToken || loginData.token;
            const loginRefreshToken = loginData.refreshToken || loginData.tokens?.refreshToken || '';
            
            if (loginAccessToken) {
              localStorage.setItem(this.TOKEN_KEY, loginAccessToken);
              if (loginRefreshToken) localStorage.setItem(this.TOKEN_KEY + '_refresh', loginRefreshToken);
            }
            
            if (loginData.user) {
              localStorage.setItem(this.USER_KEY, JSON.stringify(loginData.user));
              return {
                success: true,
                message: resp.message || 'Registered',
                user: loginData.user,
                token: loginAccessToken,
                tokens: loginData.tokens || (loginAccessToken ? { accessToken: loginAccessToken, refreshToken: loginRefreshToken, expiresAt: loginData.expiresAt } : undefined),
              };
            }
            
            // Try to GET /auth/me with the new token
            try {
              const meResp = await apiClient.get<any>(`${this.endpoint}/me`);
              if (!meResp.error && meResp.data) {
                localStorage.setItem(this.USER_KEY, JSON.stringify(meResp.data));
                return {
                  success: true,
                  message: resp.message || 'Registered',
                  user: meResp.data,
                  token: loginAccessToken,
                  tokens: loginData.tokens || (loginAccessToken ? { accessToken: loginAccessToken, refreshToken: loginRefreshToken, expiresAt: loginData.expiresAt } : undefined),
                };
              }
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          logApiOperation('auth', 'auto-login failed after register', { email: data.email });
          // Fall through to return success with minimal info
        }
      }

      return {
        success: true,
        message: resp.message || 'Registered',
        user: { id: 0, name: '', email: '', type: 'renter' },
        token: accessToken,
        tokens: resp.tokens || (accessToken ? { accessToken, refreshToken, expiresAt: resp.expiresAt } : undefined),
      };
    }

    return { success: false, message: 'Registration failed', user: { id: 0, name: '', email: '', type: 'renter' } };
  }

  async logout(): Promise<void> {
    logApiOperation('auth', 'logout');
    
    // Appeler l'API pour invalider le token côté serveur
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      try {
        await apiClient.post(`${this.endpoint}/logout`, {});
      } catch (err) {
        // ignore logout errors
      }
    }
    
    // Supprimer les données locales
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY + '_refresh');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    // If no token, not authenticated
    if (!token) return false;

    // If token exists but no user in localStorage, try to rehydrate from the API
    if (!user) {
      try {
        // Use a direct fetch to /auth/me to avoid apiClient refresh logic that may clear tokens on network errors
        const tokenValue = localStorage.getItem(this.TOKEN_KEY);
        const resp = await fetch(`${apiConfig.apiBaseUrl}${this.endpoint}/me`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tokenValue}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          localStorage.setItem(this.USER_KEY, JSON.stringify(data));
          return true;
        }
      } catch (e) {
        // network error - do not force token removal here
      }
    }

    // Validate token with API as a fallback (use apiClient which may attempt refresh)
    try {
      const response = await apiClient.get<{ valid: boolean }>(`${this.endpoint}/validate`);
      return response.data?.valid || false;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        // fallthrough to try /me
      }
    }

    // If not present locally but token exists, try to fetch /auth/me using a direct fetch
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      const resp = await fetch(`${apiConfig.apiBaseUrl}${this.endpoint}/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem(this.USER_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      // ignore network errors
    }

    return null;
  }

  // Password reset flow
  async requestPasswordResetCode(email: string): Promise<{ success: boolean; message?: string }> {
    logApiOperation('auth', 'requestPasswordResetCode', { email });
    const resp = await apiClient.post<{ message: string }>(`${this.endpoint}/request-password-reset-code`, { email });
    if (resp.error) return { success: false, message: resp.error };
    return { success: true, message: resp.data?.message };
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<{ success: boolean; resetToken?: string; message?: string }> {
    logApiOperation('auth', 'verifyPasswordResetCode', { email });
    const resp = await apiClient.post<{ resetToken: string }>(`${this.endpoint}/verify-password-reset-code`, { email, code });
    if (resp.error) return { success: false, message: resp.error };
    return { success: true, resetToken: resp.data?.resetToken };
  }

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ success: boolean; message?: string; errors?: Array<{ code?: string; description?: string }> }> {
    logApiOperation('auth', 'resetPassword', { email });
    // The backend expects ResetPasswordDto: { Token, NewPassword }
    const payload = { token: resetToken, newPassword };
    const resp = await apiClient.post<{ message: string }>(`${this.endpoint}/reset-password`, payload);

    if (resp.error) {
      // If apiClient returned a 400, the body may contain a validation problem details JSON
      if (resp.status === 400) {
        try {
          // Fetch the raw response body to extract detailed errors (apiClient returns only a generic message on non-ok)
          const fetchResp = await fetch(`${apiConfig.apiBaseUrl}${this.endpoint}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const body = await fetchResp.json();
          // ProblemDetails with 'errors' object
          if (body && body.errors) {
            // Convert errors object { Field: [msg] } into array
            const errors: Array<{ code?: string; description?: string }> = [];
            for (const key of Object.keys(body.errors)) {
              const arr = body.errors[key];
              if (Array.isArray(arr)) {
                for (const msg of arr) {
                  errors.push({ code: key, description: String(msg) });
                }
              }
            }
            return { success: false, message: body.title || 'Validation failed', errors };
          }

          // Fallback to message in body
          if (body && body.title) {
            return { success: false, message: body.title };
          }
        } catch (e) {
          // ignore and fallthrough to generic error
        }
      }

      return { success: false, message: resp.error };
    }

    return { success: true, message: resp.data?.message };
  }
}

