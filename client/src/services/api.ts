import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;
  private tokenKey = 'sf_token';

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    // Request interceptor — attach token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — handle 401
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only dispatch global logout for 401s on non-auth routes.
        // A 401 on /auth/login or /auth/verify-token is expected and
        // should NOT trigger a global logout loop.
        const url: string = error.config?.url || '';
        const isAuthRoute = url.includes('/auth/');

        if (error.response?.status === 401 && !isAuthRoute) {
          this.clearToken();
          window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
      }
    );
  }

  // Token stored in sessionStorage (more secure than localStorage for tokens)
  setToken(token: string) { sessionStorage.setItem(this.tokenKey, token); }
  getToken(): string | null { return sessionStorage.getItem(this.tokenKey); }
  clearToken() { sessionStorage.removeItem(this.tokenKey); }

  /** Extract a clean error message from an axios error or plain Error */
  extractErrorMessage(err: unknown): string {
    if (!err) return 'An unexpected error occurred';
    // Axios response error — server returned an error body
    if ((err as any)?.response?.data?.message) {
      return (err as any).response.data.message;
    }
    // Axios network error (no response — server unreachable)
    if ((err as any)?.code === 'ERR_NETWORK' || (err as any)?.message === 'Network Error') {
      return 'Cannot reach the server. Please make sure the backend is running.';
    }
    // Axios timeout
    if ((err as any)?.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    // Plain Error
    if ((err as Error)?.message) {
      return (err as Error).message;
    }
    return 'An unexpected error occurred';
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params });
    return res.data;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
    return res.data;
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
    return res.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
    return res.data;
  }
}

export const api = new ApiClient();
export default api;
