export type SessionRestorationFailure = {
  kind?: string;
  status?: number;
};

export type SessionRestorationDecision = 'offline' | 'invalidate';

export function classifySessionRestorationFailure(
  failure: SessionRestorationFailure,
): SessionRestorationDecision {
  if (failure.status === 401) return 'invalidate';
  return 'offline';
}
