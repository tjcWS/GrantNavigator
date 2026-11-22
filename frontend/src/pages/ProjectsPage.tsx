import { Link as RouterLink } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ProjectCard, projectApi } from '@/entities/project';
import { DeleteProjectButton } from '@/features/project-delete';
import { useAsync } from '@/shared/lib';
import { AsyncBoundary, CardGridSkeleton, EmptyState, PageHeader, Reveal } from '@/shared/ui';

export function ProjectsPage() {
  const projects = useAsync(() => projectApi.list(), []);
  const list = projects.data ?? [];

  const createButton = (
    <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/projects/new">
      Создать проект
    </Button>
  );

  return (
    <>
      <PageHeader title="Мои проекты" subtitle="Один проект можно подавать на разные конкурсы" actions={createButton} />
      <AsyncBoundary
        loading={projects.initialLoading}
        error={projects.initialError}
        onRetry={projects.reload}
        skeleton={<CardGridSkeleton count={3} />}
        isEmpty={list.length === 0}
        emptyState={<EmptyState title="Проектов пока нет" description="Создайте первый проект — на его основе будут готовиться заявки." action={createButton} />}
      >
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {list.map((project, index) => (
            <Reveal key={project.id} index={index}>
              <ProjectCard
                project={project}
                actions={
                  <DeleteProjectButton
                    projectId={project.id}
                    projectTitle={project.title}
                    applicationsCount={project.applicationsCount}
                    onDeleted={projects.reload}
                  />
                }
              />
            </Reveal>
          ))}
        </Box>
      </AsyncBoundary>
    </>
  );
}
