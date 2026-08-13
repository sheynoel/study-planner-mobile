import type { User } from './auth.types.ts';

export function normalizeUser(value: unknown): User | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.email !== 'string') return null;
  if (!isIsoDateTime(value.createdAt) || !isIsoDateTime(value.updatedAt)) return null;
  if (value.timezone !== undefined && value.timezone !== null && typeof value.timezone !== 'string') return null;
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    timezone: value.timezone ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
