import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { getErrorMessage } from './errors';
import { Schema, validate } from './validation';

interface UseFormOptions<V extends object> {
  initialValues: V;
  schema: Schema<V>;
  onSubmit: (values: V) => Promise<void> | void;
}

/**
 * Маленький хук для форм: значения, ошибки, «тронутые» поля, отправка.
 * Ошибка поля показывается после ухода из поля (blur) или после нажатия кнопки отправки.
 */
export function useForm<V extends object>({ initialValues, schema, onSubmit }: UseFormOptions<V>) {
  const initialRef = useRef<V>(initialValues);
  const [values, setValues] = useState<V>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = validate(values, schema);
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialRef.current);

  const getError = (name: keyof V): string | undefined =>
    touched[name] || attempted ? errors[name] : undefined;

  const setValue = <K extends keyof V>(name: K, value: V[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }) as V);
    setSubmitError(null);
  };

  /** Свойства для текстового поля MUI: <TextField {...form.register('email')} /> */
  const register = (name: keyof V & string) => ({
    name,
    value: String(values[name] ?? ''),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(name, event.target.value as V[typeof name]),
    onBlur: () => setTouched((prev) => ({ ...prev, [name]: true })),
    error: Boolean(getError(name)),
    helperText: getError(name),
  });

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    setAttempted(true);
    if (!isValid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
      initialRef.current = values; // после успешной отправки форма снова «чистая»
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, isValid, isDirty, submitting, submitError, setValue, register, getError, handleSubmit };
}
