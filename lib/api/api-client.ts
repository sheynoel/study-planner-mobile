import { getApiBaseUrl } from '@/lib/config/environment';

const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiClientErrorKind = 'timeout' | 'network' | 'http' | 'invalid-response';

type RequestOptions = {
  acceptedStatuses?: readonly number[];
  headers?: HeadersInit;
  timeoutMs?: number;
};

type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly kind: ApiClientErrorKind,
    readonly status?: number,
    readonly code?: string,
    readonly details?: readonly string[],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeoutMs = DEFAULT_TIMEOUT_MS,
  ) {}

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { method: 'GET', headers: options.headers }, options);
  }

  post<TResponse, TBody = never>(
    path: string,
    body?: TBody,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(
      path,
      {
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: options.headers,
        method: 'POST',
      },
      options,
    );
  }

  postForm<TResponse>(
    path: string,
    body: FormData,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(
      path,
      { body, headers: options.headers, method: 'POST' },
      options,
    );
  }

  patch<TResponse, TBody>(
    path: string,
    body: TBody,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>(
      path,
      {
        body: JSON.stringify(body),
        headers: options.headers,
        method: 'PATCH',
      },
      options,
    );
  }

  delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', headers: options.headers }, options);
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    options: RequestOptions,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);

    let response: Response;
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    if (init.body !== undefined && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      response = await fetch(this.createUrl(path), {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      if (didTimeout || (error instanceof Error && error.name === 'AbortError')) {
        throw new ApiClientError(
          `The API did not respond within ${Math.round(timeoutMs / 1000)} seconds. Check that the backend is running and the API URL is reachable from this device.`,
          'timeout',
        );
      }

      throw new ApiClientError(
        `Could not reach the API at ${this.baseUrl}. Check that the backend is running and that this device is on the same network.`,
        'network',
      );
    } finally {
      clearTimeout(timeout);
    }

    const acceptedStatuses = options.acceptedStatuses ?? [200];

    if (!acceptedStatuses.includes(response.status)) {
      const errorEnvelope = await this.readErrorEnvelope(response);

      throw new ApiClientError(
        errorEnvelope?.error.message ??
          `The API returned HTTP ${response.status}. Verify the configured URL and backend status.`,
        'http',
        response.status,
        errorEnvelope?.error.code,
        errorEnvelope?.error.details,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiClientError(
        'The API returned a response that was not valid JSON.',
        'invalid-response',
      );
    }
  }

  private createUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  private async readErrorEnvelope(response: Response): Promise<ApiErrorEnvelope | null> {
    try {
      const value = (await response.json()) as unknown;

      if (typeof value !== 'object' || value === null || !('error' in value)) {
        return null;
      }

      const error = (value as { error?: unknown }).error;

      if (typeof error !== 'object' || error === null) {
        return null;
      }

      const candidate = error as Partial<ApiErrorEnvelope['error']>;

      if (typeof candidate.code !== 'string' || typeof candidate.message !== 'string') {
        return null;
      }

      if (
        candidate.details !== undefined &&
        (!Array.isArray(candidate.details) ||
          !candidate.details.every((detail) => typeof detail === 'string'))
      ) {
        return null;
      }

      return {
        error: {
          code: candidate.code,
          message: candidate.message,
          details: candidate.details,
        },
      };
    } catch {
      return null;
    }
  }
}

export function createApiClientErrorFromBody(status: number, body: string): ApiClientError {
  try {
    const parsed = JSON.parse(body) as unknown;
    if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) {
      const error = (parsed as { error?: unknown }).error;
      if (typeof error === 'object' && error !== null) {
        const candidate = error as { code?: unknown; message?: unknown; details?: unknown };
        if (typeof candidate.code === 'string' && typeof candidate.message === 'string') {
          return new ApiClientError(
            candidate.message,
            'http',
            status,
            candidate.code,
            Array.isArray(candidate.details)
              ? candidate.details.filter((detail): detail is string => typeof detail === 'string')
              : undefined,
          );
        }
      }
    }
  } catch {
    // Fall through to the generic HTTP error.
  }
  return new ApiClientError(`The API returned HTTP ${status}.`, 'http', status);
}

let apiClient: ApiClient | undefined;

export function getApiClient(): ApiClient {
  apiClient ??= new ApiClient(getApiBaseUrl());
  return apiClient;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError && error.details?.length) {
    return `${error.message} ${error.details.join(' ')}`;
  }

  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
