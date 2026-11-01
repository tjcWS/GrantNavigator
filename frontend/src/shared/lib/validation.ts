/**
 * Клиентская валидация форм.
 * Схема = для каждого поля список правил; правила проверяются по порядку,
 * показывается сообщение первого сработавшего правила.
 */
export type RuleFn<T, V> = (value: T, values: V) => string | undefined;
export type Schema<V> = { [K in keyof V]?: Array<RuleFn<V[K], V>> };
export type FormErrors<V> = Partial<Record<keyof V, string>>;

export function validate<V extends object>(values: V, schema: Schema<V>): FormErrors<V> {
  const errors: FormErrors<V> = {};
  for (const key of Object.keys(schema) as Array<keyof V>) {
    const fieldRules = schema[key] as Array<RuleFn<V[keyof V], V>> | undefined;
    if (!fieldRules) continue;
    for (const rule of fieldRules) {
      const message = rule(values[key], values);
      if (message) {
        errors[key] = message;
        break;
      }
    }
  }
  return errors;
}

export const rules = {
  required:
    (message = 'Обязательное поле') =>
    (value: string) =>
      value.trim() ? undefined : message,

  minLength: (min: number, message?: string) => (value: string) =>
    value.trim().length > 0 && value.trim().length < min
      ? (message ?? `Минимум ${min} симв. (сейчас ${value.trim().length})`)
      : undefined,

  maxLength: (max: number, message?: string) => (value: string) =>
    value.length > max ? (message ?? `Максимум ${max} симв. (сейчас ${value.length})`) : undefined,

  email:
    (message = 'Введите корректный email') =>
    (value: string) =>
      !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : message,

  pattern: (regexp: RegExp, message: string) => (value: string) =>
    !value || regexp.test(value) ? undefined : message,

  mustBeTrue: (message: string) => (value: boolean) => (value ? undefined : message),

  minItems: (min: number, message: string) => (value: string[]) => (value.length >= min ? undefined : message),

  /** Значение должно совпадать с другим полем формы (например, повтор пароля). */
  sameAs:
    <V,>(field: keyof V, message: string) =>
    (value: string, values: V) =>
      value === (values[field] as unknown) ? undefined : message,
};

/** Подпись-счётчик под многострочным полем: "123 / 500". */
export const counter = (value: string, max: number): string => `${value.length} / ${max}`;
