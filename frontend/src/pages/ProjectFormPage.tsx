import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, List, ListItemButton, ListItemText, Paper, Stack, TextField, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusChip from '../components/StatusChip';
import { mockGrants } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type { ProjectInput } from '../types';

const FIELDS: { key: keyof ProjectInput; label: string; rows: number }[] = [
  { key: 'title', label: 'Название проекта', rows: 1 },
  { key: 'shortDescription', label: 'Краткое описание', rows: 2 },
  { key: 'fullDescription', label: 'Полное описание', rows: 5 },
  { key: 'goals', label: 'Цели', rows: 3 },
  { key: 'tasks', label: 'Задачи', rows: 3 },
  { key: 'audience', label: 'Целевая аудитория', rows: 2 },
  { key: 'results', label: 'Ожидаемые результаты', rows: 3 },
];

const EMPTY: ProjectInput = { title: '', shortDescription: '', fullDescription: '', goals: '', tasks: '', audience: '', results: '' };

// Экран 7: один экран в трёх состояниях — создание (/projects/new), просмотр (/projects/:id), редактирование (/projects/:id?edit=1).
export default function ProjectFormPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects, applications, addProject, updateProject, deleteProject } = useApp();

  const project = projects.find((p) => p.id === id);
  const original: ProjectInput = project
    ? { title: project.title, shortDescription: project.shortDescription, fullDescription: project.fullDescription, goals: project.goals, tasks: project.tasks, audience: project.audience, results: project.results }
    : EMPTY;

  const [form, setForm] = useState<ProjectInput>(original);
  const [titleError, setTitleError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mode: 'create' | 'edit' | 'view' = !id ? 'create' : params.get('edit') === '1' ? 'edit' : 'view';

  if (id && !project) {
    return (
      <>
        <PageHeader title="Проект не найден" backTo="/projects" backLabel="Мои проекты" />
        <Alert severity="warning">Возможно, проект был удалён.</Alert>
      </>
    );
  }

  const save = () => {
    if (!form.title.trim()) {
      setTitleError('Укажите название проекта');
      return;
    }
    if (mode === 'create') {
      const created = addProject(form);
      navigate(`/projects/${created.id}`);
    } else if (project) {
      updateProject(project.id, form);
      setParams({});
    }
  };

  const cancel = () => {
    if (mode === 'create') {
      navigate('/projects');
    } else {
      setForm(original);
      setTitleError('');
      setParams({});
    }
  };

  const linked = project ? applications.filter((a) => a.projectId === project.id) : [];
  const title = mode === 'create' ? 'Новый проект' : mode === 'edit' ? 'Редактирование проекта' : project?.title ?? '';

  const actions =
    mode === 'view' ? (
      <>
        <Button variant="contained" onClick={() => setParams({ edit: '1' })}>
          Редактировать
        </Button>
        <Button color="error" onClick={() => setConfirmOpen(true)}>
          Удалить
        </Button>
      </>
    ) : null;

  return (
    <>
      <PageHeader title={title} backTo="/projects" backLabel="Мои проекты" actions={actions} />

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, maxWidth: 820 }}>
        {mode === 'view' ? (
          <Stack spacing={2.5}>
            {FIELDS.filter((f) => f.key !== 'title').map((f) => (
              <Box key={f.key}>
                <Typography variant="caption" color="text.secondary">
                  {f.label}
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-line' }}>{project?.[f.key] || '—'}</Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {FIELDS.map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                required={f.key === 'title'}
                multiline={f.rows > 1}
                minRows={f.rows}
                value={form[f.key]}
                error={f.key === 'title' && Boolean(titleError)}
                helperText={f.key === 'title' ? titleError : undefined}
                onChange={(e) => {
                  setForm({ ...form, [f.key]: e.target.value });
                  if (f.key === 'title') setTitleError('');
                }}
              />
            ))}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={cancel}>Отмена</Button>
              <Button variant="contained" onClick={save}>
                Сохранить
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>

      {mode === 'view' && (
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, mt: 3, maxWidth: 820 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Связанные заявки
          </Typography>
          {linked.length === 0 ? (
            <Typography color="text.secondary">Заявок пока нет. Выберите конкурс в каталоге и нажмите «Участвовать».</Typography>
          ) : (
            <List disablePadding>
              {linked.map((a) => (
                <ListItemButton key={a.id} component={RouterLink} to={`/applications/${a.id}`} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={mockGrants.find((g) => g.id === a.grantId)?.title} secondary={a.title} />
                  <StatusChip status={a.status} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить проект?"
        text="Проект и все связанные с ним заявки будут удалены."
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (project) deleteProject(project.id);
          navigate('/projects');
        }}
      />
    </>
  );
}
