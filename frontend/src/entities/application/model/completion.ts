import type { GrantSection } from '@/entities/grant/model/types';

export interface Completion {
  filled: number;
  total: number;
  percent: number;
  missing: GrantSection[];
}

/** Сколько обязательных разделов уже заполнено. */
export function getCompletion(sections: GrantSection[], answers: Record<string, string>): Completion {
  const required = sections.filter((s) => s.required);
  const missing = required.filter((s) => !(answers[s.key] ?? '').trim());
  const filled = required.length - missing.length;
  return {
    filled,
    total: required.length,
    percent: required.length === 0 ? 100 : Math.round((filled / required.length) * 100),
    missing,
  };
}
