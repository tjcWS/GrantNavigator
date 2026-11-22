import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Grant, GrantCard, grantApi } from '@/entities/grant';
import { useSession } from '@/entities/user';
import { DEFAULT_FILTERS, GrantFilterState, GrantFilters, filterGrants } from '@/features/grant-search';
import { SelectProjectDialog } from '@/features/participate';
import { useAsync } from '@/shared/lib';
import { AsyncBoundary, CardGridSkeleton, EmptyState, PageHeader, Reveal } from '@/shared/ui';

/** Каталог конкурсов: поиск, фильтры, рекомендации, запуск участия. */
export function GrantsPage() {
  const { user } = useSession();
  const grants = useAsync(() => grantApi.list(), []);
  const [filters, setFilters] = useState<GrantFilterState>(DEFAULT_FILTERS);
  const [participateIn, setParticipateIn] = useState<Grant | null>(null);

  const visible = useMemo(
    () => (grants.data ? filterGrants(grants.data, filters, user?.interests ?? []) : []),
    [grants.data, filters, user?.interests],
  );

  return (
    <>
      <PageHeader title="Каталог конкурсов" subtitle="Найдите грант, подходящий вашему проекту" />
      <GrantFilters value={filters} onChange={setFilters} />

      <AsyncBoundary
        loading={grants.initialLoading}
        error={grants.initialError}
        onRetry={grants.reload}
        skeleton={<CardGridSkeleton />}
        isEmpty={visible.length === 0}
        emptyState={
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте изменить запрос или сбросить фильтры."
            action={<Button onClick={() => setFilters(DEFAULT_FILTERS)}>Сбросить фильтры</Button>}
          />
        }
      >
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {visible.map(({ grant, recommended }, index) => (
            <Reveal key={grant.id} index={index}>
              <GrantCard grant={grant} recommended={recommended} onParticipate={setParticipateIn} />
            </Reveal>
          ))}
        </Box>
      </AsyncBoundary>

      <SelectProjectDialog grant={participateIn} onClose={() => setParticipateIn(null)} />
    </>
  );
}
