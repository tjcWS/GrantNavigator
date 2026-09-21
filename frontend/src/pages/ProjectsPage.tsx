import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, IconButton, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/dates';
import type { Project } from '../types';

// Экран 6: список проектов пользователя.
export default function ProjectsPage() {
  const { projects, applications, deleteProject } = useApp();
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const createButton = (
    <Button component={RouterLink} to="/projects/new" variant="contained" startIcon={<AddIcon />}>
      Создать проект
    </Button>
  );

  return (
    <>
      <PageHeader title="Мои проекты" subtitle="Один проект можно использовать для заявок на разные конкурсы." actions={createButton} />

      {projects.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ mb: 2 }}>У вас пока нет проектов. Опишите свою инициативу, и её можно будет подать на конкурс.</Typography>
          {createButton}
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {projects.map((project) => {
            const count = applications.filter((a) => a.projectId === project.id).length;
            return (
              <Card key={project.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2">
                    {project.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ my: 1 }}>
                    {project.shortDescription}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Изменён: {formatDate(project.updatedAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Заявок: {count}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button component={RouterLink} to={`/projects/${project.id}`} variant="outlined">
                    Открыть
                  </Button>
                  <Button component={RouterLink} to={`/projects/${project.id}?edit=1`}>
                    Редактировать
                  </Button>
                  <IconButton aria-label="Удалить проект" color="error" sx={{ ml: 'auto' }} onClick={() => setToDelete(project)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить проект?"
        text={`Проект «${toDelete?.title ?? ''}» и все связанные с ним заявки будут удалены.`}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteProject(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}
