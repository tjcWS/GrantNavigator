const MS_IN_DAY = 86_400_000;

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Дата через n дней от сегодня в формате YYYY-MM-DD (отрицательное n — в прошлом). */
export function daysFromNow(n: number): string {
  return toIsoDate(new Date(Date.now() + n * MS_IN_DAY));
}

/** Сколько дней осталось до даты (0 — сегодня, меньше 0 — срок прошёл). */
export function daysLeft(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  return Math.round((end.getTime() - today.getTime()) / MS_IN_DAY);
}

export const isExpired = (isoDate: string): boolean => daysLeft(isoDate) < 0;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const formatMoney = (value: number): string => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

/** pluralize(5, ['день', 'дня', 'дней']) -> "дней" */
export function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
