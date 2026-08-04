export class EnvironmentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentConfigurationError';
  }
}

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new EnvironmentConfigurationError(
      'EXPO_PUBLIC_API_URL is not configured. Copy .env.example to .env.local and replace YOUR_COMPUTER_IP.',
    );
  }

  try {
    const parsedUrl = new URL(configuredUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    throw new EnvironmentConfigurationError(
      'EXPO_PUBLIC_API_URL must be a valid http:// or https:// URL.',
    );
  }

  return configuredUrl.replace(/\/+$/, '');
}
