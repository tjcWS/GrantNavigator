import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from './errors';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

/**
 * Загрузка данных с тремя состояниями: загрузка / ошибка / данные.
 * deps — список зависимостей: при их изменении запрос повторяется.
 */
export function useAsync<T>(load: () => Promise<T>, deps: ReadonlyArray<unknown>) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loadRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: undefined, loading: false, error: getErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const mutate = useCallback((data: T) => setState({ data, loading: false, error: null }), []);

  return {
    data: state.data,
    /** true только пока данных ещё нет (при повторной загрузке старые данные остаются на экране) */
    initialLoading: state.loading && state.data === undefined,
    initialError: state.data === undefined ? state.error : null,
    reload,
    mutate,
  };
}
