export type SessionRestorationFailure = {
  kind?: string;
  status?: number;
};

export type SessionRestorationDecision = 'offline' | 'invalidate' | 'error';

export function classifySessionRestorationFailure(
  failure: SessionRestorationFailure,
): SessionRestorationDecision {
  if (failure.kind === 'network' || failure.kind === 'timeout') return 'offline';
  if (failure.kind === 'http' && failure.status === 401) return 'invalidate';
  return 'error';
}
