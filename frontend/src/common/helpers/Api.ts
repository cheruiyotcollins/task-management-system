// helpers/Api.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosError,
} from "axios";
import { store } from "../../store/index";
import { setAuth } from "../../store/auth/actions";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

class Api {
  private readonly http: AxiosInstance;
  private readonly httpNoAuth: AxiosInstance;
  private accessToken: string | null;
  private refreshToken: string | null;
  private isRefreshing: boolean;
  private requestQueue: ((token: string | null) => void)[];

  constructor() {
    const baseURL = "http://localhost:9002/api";
    const timeout = 45000;

    this.accessToken = localStorage.getItem("token");
    this.refreshToken = localStorage.getItem("refreshToken");
    this.isRefreshing = false;
    this.requestQueue = [];

    this.http = axios.create({ baseURL, timeout });
    this.httpNoAuth = axios.create({ baseURL, timeout });

    this.http.interceptors.request.use((config) => {
      this.accessToken = localStorage.getItem("token");
      config.headers = config.headers ?? {};
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.refreshToken
        ) {
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
              const res = await this.refreshAccessToken();

              this.setAccessToken(res.accessToken);
              this.setRefreshToken(res.refreshToken);

              let user = null;
              try {
                user = JSON.parse(localStorage.getItem("user") || "{}");
              } catch {}

              store.dispatch(
                setAuth({
                  isLoggedIn: true,
                  currentUser: user,
                  token: res.accessToken,
                  refreshToken: res.refreshToken,
                })
              );

              this.processQueue(null, res.accessToken);
            } catch (refreshError) {
              this.processQueue(refreshError, null);
              this.clearTokensAndRedirect();
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          return new Promise((resolve, reject) => {
            this.requestQueue.push((token) => {
              if (token) {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.http(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await this.httpNoAuth.post("/auth/refresh", {
      refreshToken: this.refreshToken,
    });
    return response.data;
  }

  private processQueue(error: any, token: string | null) {
    this.requestQueue.forEach((callback) => callback(token));
    this.requestQueue = [];
  }

  private clearTokensAndRedirect() {
    this.setAccessToken(null);
    this.setRefreshToken(null);
    localStorage.removeItem("user");
    store.dispatch(
      setAuth({
        isLoggedIn: false,
        currentUser: null,
        token: null,
        refreshToken: null,
      })
    );
    window.location.href = "/login";
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    token
      ? localStorage.setItem("token", token)
      : localStorage.removeItem("token");
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token;
    token
      ? localStorage.setItem("refreshToken", token)
      : localStorage.removeItem("refreshToken");
  }

  private buildHeaders(config: AxiosRequestConfig = {}): AxiosRequestHeaders {
    return {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    };
  }

  // --- Public API Methods ---

  get(endpoint: string, query: Record<string, any> = {}) {
    return this.http.get(endpoint, { params: query });
  }

  getNoToken(
    endpoint: string,
    query: Record<string, any> = {},
    config: AxiosRequestConfig = {}
  ) {
    const mergedConfig: AxiosRequestConfig = { ...config, params: query };
    delete mergedConfig.headers?.["Authorization"];
    return this.httpNoAuth.get(endpoint, mergedConfig);
  }

  post(endpoint: string, data: any, config: AxiosRequestConfig = {}) {
    return this.http.post(endpoint, data, {
      ...config,
      headers: this.buildHeaders(config),
    });
  }

  postNoToken(endpoint: string, data: any, config: AxiosRequestConfig = {}) {
    const headers = this.buildHeaders(config);
    delete headers["Authorization"];
    return this.httpNoAuth.post(endpoint, data, { ...config, headers });
  }

  postNoData(endpoint: string, config: AxiosRequestConfig = {}) {
    const headers = this.buildHeaders(config);
    delete headers["Authorization"];
    return this.httpNoAuth.post(endpoint, null, { ...config, headers });
  }

  put(endpoint: string, data: any, config: AxiosRequestConfig = {}) {
    return this.http.put(endpoint, data, {
      ...config,
      headers: this.buildHeaders(config),
    });
  }

  patch(endpoint: string, data: any, config: AxiosRequestConfig = {}) {
    return this.http.patch(endpoint, data, {
      ...config,
      headers: this.buildHeaders(config),
    });
  }

  patchNoData(endpoint: string, config: AxiosRequestConfig = {}) {
    return this.http.patch(
      endpoint,
      {},
      {
        ...config,
        headers: this.buildHeaders(config),
      }
    );
  }

  delete(endpoint: string, query: Record<string, any> = {}) {
    return this.http.delete(endpoint, { params: query });
  }
}

export default new Api();
