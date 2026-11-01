import { AppError } from '@/shared/lib/errors';

const FAIL_KEY = 'gn_force_error';

export const isFailureForced = (): boolean => localStorage.getItem(FAIL_KEY) === '1';

export function setFailureForced(value: boolean): void {
  if (value) localStorage.setItem(FAIL_KEY, '1');
  else localStorage.removeItem(FAIL_KEY);
}

/**
 * Имитация сетевого запроса: ответ приходит с задержкой.
 * Если включён режим «сбой сервера» — запрос завершается ошибкой (для проверки состояния ошибки).
 * В следующей лабораторной вызовы respond(...) заменятся на fetch к FastAPI.
 */
export function respond<T>(action: () => T, delay = 500): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (isFailureForced()) {
        reject(new AppError('Не удалось связаться с сервером. Проверьте соединение и попробуйте ещё раз.'));
        return;
      }
      try {
        resolve(action());
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}
