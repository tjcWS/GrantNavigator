import type { Grant, UserProfile } from '../types';

// Конкурс рекомендован, если его направления пересекаются с интересами пользователя
export function isRecommended(grant: Grant, profile: UserProfile): boolean {
  return grant.directions.some((d) => profile.directions.includes(d));
}

export function matchesSearch(grant: Grant, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [grant.title, grant.shortDescription, grant.organizer, ...grant.tags].join(' ').toLowerCase().includes(q);
}
