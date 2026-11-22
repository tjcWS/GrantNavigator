import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Application, ApplicationStatusChip, applicationApi } from '@/entities/application';
import { DeadlineChip } from '@/entities/grant';
import { AiCheckPanel } from '@/features/ai-check';
import { ApplicationForm } from '@/features/application-edit';
import { StatusSelect } from '@/features/application-status';
import { useAsync } from '@/shared/lib';
import { AsyncBoundary, LoadingBlock, PageHeader, useNotify } from '@/shared/ui';

/** Редактор заявки: форма по разделам конкурса + статус + ИИ-проверка. */
export function ApplicationPage() {
  const id = Number(useParams().id);
  const notify = useNotify();
  const details = useAsync(() => (Number.isFinite(id) ? applicationApi.getById(id) : Promise.reject(new Error('Некорректный адрес заявки'))), [id]);
  const [dirty, setDirty] = useState(false);

  const data = details.data;
  const update = (patch: Partial<Application>) => {
    if (data) details.mutate({ ...data, application: { ...data.application, ...patch } });
  };

  return (
    <>
      <Button component={RouterLink} to="/applications" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Мои заявки
      </Button>

      <AsyncBoundary loading={details.initialLoading} error={details.initialError} onRetry={details.reload} skeleton={<LoadingBlock label="Загружаем заявку…" />}>
        {data && (
          <>
            <PageHeader title={data.application.title} actions={<ApplicationStatusChip status={data.application.status} />} />
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3, mt: -1.5 }}>
              <Typography color="text.secondary">
                Конкурс:{' '}
                <Link component={RouterLink} to={`/grants/${data.grant.id}`}>
                  {data.grant.title}
                </Link>
              </Typography>
              <DeadlineChip deadline={data.grant.deadline} />
            </Stack>

            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, alignItems: 'start' }}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <ApplicationForm
                    key={data.application.id}
                    application={data.application}
                    grant={data.grant}
                    onDirtyChange={setDirty}
                    onSave={async (input) => {
                      const saved = await applicationApi.save(data.application.id, input);
                      update(saved);
                      notify('Заявка сохранена');
                    }}
                  />
                </CardContent>
              </Card>

              <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 120 } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Статус
                    </Typography>
                    <StatusSelect application={data.application} onChanged={(app) => update({ status: app.status, updatedAt: app.updatedAt })} />
                  </CardContent>
                </Card>
                <AiCheckPanel
                  application={data.application}
                  disabledReason={dirty ? 'Сначала сохраните изменения — проверка анализирует сохранённый текст.' : undefined}
                  onChecked={(app) => update({ checkResult: app.checkResult, updatedAt: app.updatedAt })}
                />
              </Stack>
            </Box>
          </>
        )}
      </AsyncBoundary>
    </>
  );
}
