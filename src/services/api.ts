import axios, {
  AxiosError,
  type AxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { tokenStorage } from './tokenStorage';

type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: unknown;
};

function getApiBaseUrl(): string {
  const environmentUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (environmentUrl) return environmentUrl.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.replace(/^.*?:\/\//, '').split(':')[0];
    return `http://${host}:3000`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly details?: unknown;
  readonly isConnectionError: boolean;

  constructor(
    message: string,
    options: {
      status?: number | null;
      details?: unknown;
      isConnectionError?: boolean;
    } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? null;
    this.details = options.details;
    this.isConnectionError = options.isConnectionError ?? false;
  }
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return new ApiError('Não foi possível concluir a operação.');
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  if (!axiosError.response) {
    return new ApiError(
      'Não foi possível conectar à API. Verifique sua conexão e o endereço configurado.',
      { isConnectionError: true },
    );
  }

  const body = axiosError.response.data;
  return new ApiError(
    body?.error || body?.message || 'A API não conseguiu concluir a operação.',
    {
      status: axiosError.response.status,
      details: body?.details,
    },
  );
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalized = normalizeError(error);
    if (normalized.status === 401) await tokenStorage.clear();
    return Promise.reject(normalized);
  },
);

export async function request<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await api.request<T>(config);
  return response.data;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.';
}

export const apiBaseUrl = api.defaults.baseURL;
