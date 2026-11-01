import type { Grant } from '@/entities/grant';
import { isExpired } from '@/shared/lib';

export interface GrantFilterState {
  search: string;
  direction: string; // '' = все направления
  onlyActive: boolean;
}

export const DEFAULT_FILTERS: GrantFilterState = { search: '', direction: '', onlyActive: false };

export interface GrantWithMeta {
  grant: Grant;
  recommended: boolean;
}

/** Фильтрация каталога; рекомендованные (по интересам пользователя) идут первыми. */
export function filterGrants(grants: Grant[], filters: GrantFilterState, interests: string[]): GrantWithMeta[] {
  const query = filters.search.trim().toLowerCase();

  return grants
    .filter((g) => {
      if (query && !`${g.title} ${g.description} ${g.organizer}`.toLowerCase().includes(query)) return false;
      if (filters.direction && !g.directions.includes(filters.direction)) return false;
      if (filters.onlyActive && isExpired(g.deadline)) return false;
      return true;
    })
    .map((grant) => ({ grant, recommended: grant.directions.some((d) => interests.includes(d)) && !isExpired(grant.deadline) }))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended) || a.grant.deadline.localeCompare(b.grant.deadline));
}
