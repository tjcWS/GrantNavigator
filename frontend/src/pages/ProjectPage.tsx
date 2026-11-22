import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Collapse, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { ApplicationStatusChip, applicationApi } from '@/entities/application';
import { DeadlineChip } from '@/entities/grant';
import { ProjectInput, ProjectWithStats, projectApi } from '@/entities/project';
import { DeleteProjectButton } from '@/features/project-delete';
import { ProjectForm } from '@/features/project-edit';
import { useAsync } from '@/shared/lib';
import { AsyncBoundary, PageHeader, useNotify } from '@/shared/ui';

const FIELDS: Array<{ key: keyof ProjectInput; label: string }> = [
  { key: 'shortDescription', label: 'Краткое описание' },
  { key: 'fullDescription', label: 'Полное описание' },
  { key: 'goals', label: 'Цели' },
  { key: 'tasks', label: 'Задачи' },
  { key: 'targetAudience', label: 'Целевая аудитория' },
  { key: 'expectedResults', label: 'Ожидаемые результаты' },
];

/** Один экран в трёх состояниях: создание, просмотр, редактирование. */
export function ProjectPage() {
  const id = useParams().id;
  return <ProjectPageContent key={id ?? 'new'} projectId={id ? Number(id) : null} />;
}

function ProjectPageContent({ projectId }: { projectId: number | null }) {
  const isNew = projectId === null;
  const navigate = useNavigate();
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const grantId = Number(searchParams.get('grantId')) || null; // пришли из «Участвовать → Создать новый проект»

  const [editing, setEditing] = useState(isNew);
  const project = useAsync<ProjectWithStats | null>(() => (projectId === null ? Promise.resolve(null) : projectApi.getById(projectId)), [projectId]);
  const applications = useAsync(() => (projectId === null ? Promise.resolve([]) : applicationApi.list({ projectId })), [projectId]);

  const handleSubmit = async (values: ProjectInput) => {
    if (projectId === null) {
      const created = await projectApi.create(values);
      notify('Проект создан');
      if (grantId) {
        // Если начинали участие в конкурсе — сразу создаём заявку
        try {
          const application = await applicationApi.create({ projectId: created.id, grantId });
          navigate(`/applications/${application.id}`, { replace: true });
          return;
        } catch {
          notify('Проект создан, но заявку создать не удалось — попробуйте из каталога', 'warning');
        }
      }
      navigate(`/projects/${created.id}`, { replace: true });
    } else {
      project.mutate(await projectApi.update(projectId, values));
      notify('Изменения сохранены');
      setEditing(false);
    }
  };

  const data = project.data ?? null;

  return (
    <>
      <Button component={RouterLink} to="/projects" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Мои проекты
      </Button>

      <AsyncBoundary loading={!isNew && project.initialLoading} error={project.initialError} onRetry={project.reload}>
        <PageHeader
          title={isNew ? 'Новый проект' : (data?.title ?? 'Проект')}
          subtitle={isNew ? 'Заполните основные сведения — позже их можно изменить' : undefined}
          actions={
            !isNew && data && !editing ? (
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                  Редактировать
                </Button>
                <DeleteProjectButton
                  projectId={data.id}
                  projectTitle={data.title}
                  applicationsCount={data.applicationsCount}
                  onDeleted={() => navigate('/projects', { replace: true })}
                />
              </Stack>
            ) : undefined
          }
        />

        {/* Форма плавно раскрывается при редактировании, режим просмотра — сворачивается */}
        <Collapse in={editing} unmountOnExit>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <ProjectForm
              initialValues={data ?? undefined}
              submitLabel={isNew ? 'Создать проект' : 'Сохранить'}
              onSubmit={handleSubmit}
              onCancel={() => (isNew ? navigate('/projects') : setEditing(false))}
            />
          </Paper>
        </Collapse>

        <Collapse in={!editing && !isNew} unmountOnExit>
          {data && (
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {FIELDS.map(({ key, label }) => (
                      <Box key={key}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{data[key] || '—'}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Заявки проекта ({data.applicationsCount})
                  </Typography>
                  <AsyncBoundary
                    loading={applications.initialLoading}
                    error={applications.initialError}
                    onRetry={applications.reload}
                    isEmpty={(applications.data ?? []).length === 0}
                    emptyState={
                      <Typography color="text.secondary">
                        Заявок пока нет. Выберите конкурс в{' '}
                        <Link component={RouterLink} to="/grants">
                          каталоге
                        </Link>{' '}
                        и нажмите «Участвовать».
                      </Typography>
                    }
                  >
                    <Stack spacing={1.5}>
                      {(applications.data ?? []).map((a) => (
                        <Stack key={a.id} direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Link component={RouterLink} to={`/applications/${a.id}`} fontWeight={600}>
                            {a.grantTitle}
                          </Link>
                          <ApplicationStatusChip status={a.status} />
                          <DeadlineChip deadline={a.grantDeadline} />
                        </Stack>
                      ))}
                    </Stack>
                  </AsyncBoundary>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Collapse>
      </AsyncBoundary>
    </>
  );
}
