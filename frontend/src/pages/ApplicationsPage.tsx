import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Tab, Tabs } from '@mui/material';
import { ApplicationCard, ApplicationStatus, STATUS_LABELS, STATUS_ORDER, applicationApi } from '@/entities/application';
import { DeleteApplicationButton } from '@/features/application-delete';
import { useAsync } from '@/shared/lib';
import { AsyncBoundary, EmptyState, LoadingBlock, PageHeader, Reveal } from '@/shared/ui';

type StatusFilter = ApplicationStatus | 'all';

/** Мои заявки: статусы, дедлайны, состояние проверки. */
export function ApplicationsPage() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const applications = useAsync(() => applicationApi.list(status === 'all' ? {} : { status }), [status]);
  const list = applications.data ?? [];

  return (
    <>
      <PageHeader title="Мои заявки" subtitle="Следите за сроками подачи и статусами" />

      <Tabs value={status} onChange={(_, v: StatusFilter) => setStatus(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        <Tab value="all" label="Все" />
        {STATUS_ORDER.map((s) => (
          <Tab key={s} value={s} label={STATUS_LABELS[s]} />
        ))}
      </Tabs>

      <AsyncBoundary
        loading={applications.initialLoading}
        error={applications.initialError}
        onRetry={applications.reload}
        skeleton={<LoadingBlock label="Загружаем заявки…" />}
        isEmpty={list.length === 0}
        emptyState={
          <EmptyState
            title={status === 'all' ? 'Заявок пока нет' : `Нет заявок со статусом «${STATUS_LABELS[status]}»`}
            description="Выберите конкурс в каталоге и нажмите «Участвовать»."
            action={
              <Button variant="contained" component={RouterLink} to="/grants">
                Перейти в каталог
              </Button>
            }
          />
        }
      >
        <Stack spacing={2}>
          {list.map((item, index) => (
            <Reveal key={item.id} index={index}>
              <ApplicationCard
                item={item}
                actions={<DeleteApplicationButton applicationId={item.id} title={item.title} onDeleted={applications.reload} />}
              />
            </Reveal>
          ))}
        </Stack>
      </AsyncBoundary>
    </>
  );
}
