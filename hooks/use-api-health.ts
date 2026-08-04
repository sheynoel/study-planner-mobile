import { useCallback, useEffect, useState } from 'react';

import { getHealth, HealthResponse } from '@/lib/api/health';

type HealthCheckState =
  | { status: 'loading'; health: null; error: null }
  | { status: 'success'; health: HealthResponse; error: null }
  | { status: 'error'; health: null; error: string };

export function useApiHealth() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<HealthCheckState>({
    status: 'loading',
    health: null,
    error: null,
  });

  useEffect(() => {
    let isCurrent = true;

    setState({ status: 'loading', health: null, error: null });

    void getHealth()
      .then((health) => {
        if (isCurrent) {
          setState({ status: 'success', health, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState({
            status: 'error',
            health: null,
            error: error instanceof Error ? error.message : 'An unexpected connection error occurred.',
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return { ...state, retry };
}
