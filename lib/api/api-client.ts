import { getApiBaseUrl } from '@/lib/config/environment';

const DEFAULT_TIMEOUT_MS = 10_000;

type ApiClientErrorKind = 'timeout' | 'network' | 'http' | 'invalid-response';

type RequestOptions = {
  acceptedStatuses?: readonly number[];
  timeoutMs?: number;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly kind: ApiClientErrorKind,
    readonly status?: number,
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
    return this.request<T>(path, { method: 'GET' }, options);
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

    try {
      response = await fetch(this.createUrl(path), {
        ...init,
        headers: {
          Accept: 'application/json',
          ...init.headers,
        },
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
      throw new ApiClientError(
        `The API returned HTTP ${response.status}. Verify the configured URL and backend status.`,
        'http',
        response.status,
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
}

let apiClient: ApiClient | undefined;

export function getApiClient(): ApiClient {
  apiClient ??= new ApiClient(getApiBaseUrl());
  return apiClient;
}
