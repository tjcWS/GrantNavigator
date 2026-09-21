export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function daysLeft(iso: string): number {
  const end = new Date(iso).getTime() + 24 * 60 * 60 * 1000;
  return Math.floor((end - Date.now()) / (24 * 60 * 60 * 1000));
}

export function pluralDays(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return 'день';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'дня';
  return 'дней';
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
