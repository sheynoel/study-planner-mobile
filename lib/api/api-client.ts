import { getApiBaseUrl } from '@/lib/config/environment';
import { createSingleFlight } from '@/lib/auth/single-flight';

const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiClientErrorKind = 'timeout' | 'network' | 'http' | 'invalid-response';

type RequestOptions = {
  acceptedStatuses?: readonly number[];
  headers?: HeadersInit;
  timeoutMs?: number;
};

type ApiAuthHandlers = {
  refresh: () => Promise<string | null>;
  invalidate: () => Promise<void>;
};

let authHandlers: ApiAuthHandlers | null = null;
const runRefreshSingleFlight = createSingleFlight<string | null>();

export function setApiAuthHandlers(handlers: ApiAuthHandlers | null): void {
  authHandlers = handlers;
}

type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: string[];
    conflicts?: unknown;
  };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly kind: ApiClientErrorKind,
    readonly status?: number,
    readonly code?: string,
    readonly details?: readonly string[],
    readonly conflicts?: unknown,
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
    allowRefresh = true,
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

      if (response.status === 401 && allowRefresh && headers.has('Authorization') && authHandlers) {
        try {
          const nextAccessToken = await runRefreshSingleFlight(authHandlers.refresh);
          if (nextAccessToken) {
            headers.set('Authorization', `Bearer ${nextAccessToken}`);
            return this.request<T>(path, { ...init, headers }, options, false);
          }
          await authHandlers.invalidate();
        } catch (refreshError) {
          if (refreshError instanceof ApiClientError && refreshError.status === 401) {
            await authHandlers.invalidate();
          }
          throw refreshError;
        }
      }

      throw new ApiClientError(
        errorEnvelope?.error.message ??
          `The API returned HTTP ${response.status}. Verify the configured URL and backend status.`,
        'http',
        response.status,
        errorEnvelope?.error.code,
        errorEnvelope?.error.details,
        errorEnvelope?.error.conflicts,
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
          conflicts: candidate.conflicts,
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

  if (error instanceof ApiClientError && Array.isArray(error.conflicts)) {
    const lines = error.conflicts.flatMap((group) => {
      if (!group || typeof group !== 'object') return [];
      const value = group as { weekday?: unknown; date?: unknown; conflicts?: unknown; courseName?: unknown; startTime?: unknown; endTime?: unknown };
      if (typeof value.weekday === 'string' && Array.isArray(value.conflicts) && value.conflicts.length) {
        return value.conflicts.flatMap((conflict) => conflict && typeof conflict === 'object' ? [`${value.weekday}: ${String((conflict as { courseName?: unknown }).courseName ?? 'Class')} (${String((conflict as { startTime?: unknown }).startTime ?? '')}–${String((conflict as { endTime?: unknown }).endTime ?? '')})`] : []);
      }
      if (typeof value.date === 'string') return [`${value.date}: ${String(value.courseName ?? 'Class')} (${String(value.startTime ?? '')}–${String(value.endTime ?? '')})`];
      return [];
    });
    if (lines.length) return `${error.message}\n${lines.join('\n')}`;
  }

  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
