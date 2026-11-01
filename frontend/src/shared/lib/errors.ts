/** Ошибка с понятным пользователю текстом (аналог HTTP 400/404/409 от backend). */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}
