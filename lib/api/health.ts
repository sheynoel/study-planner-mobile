import { ApiClientError, getApiClient } from '@/lib/api/api-client';

export type HealthResponse = {
  status: 'ok' | 'error';
  api: {
    status: 'up';
  };
  database: {
    status: 'up' | 'down';
  };
  timestamp: string;
};

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Partial<HealthResponse>;

  return (
    (response.status === 'ok' || response.status === 'error') &&
    response.api?.status === 'up' &&
    (response.database?.status === 'up' || response.database?.status === 'down') &&
    typeof response.timestamp === 'string' &&
    !Number.isNaN(Date.parse(response.timestamp))
  );
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await getApiClient().get<unknown>('/health', {
    acceptedStatuses: [200, 503],
  });

  if (!isHealthResponse(response)) {
    throw new ApiClientError(
      'The API returned an unexpected health response. Check that the mobile and backend versions match.',
      'invalid-response',
    );
  }

  return response;
}
