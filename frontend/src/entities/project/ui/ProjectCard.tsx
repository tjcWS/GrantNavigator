import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatDate } from '@/shared/lib';
import { ProjectWithStats } from '../model/types';

interface ProjectCardProps {
  project: ProjectWithStats;
  /** Дополнительные кнопки (например, «Удалить» из features) */
  actions?: ReactNode;
}

export function ProjectCard({ project, actions }: ProjectCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" fontWeight={700} gutterBottom>
          {project.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {project.shortDescription || 'Описание не заполнено'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`Заявок: ${project.applicationsCount}`} color={project.applicationsCount ? 'primary' : 'default'} variant="outlined" />
          <Chip size="small" label={`Изменён ${formatDate(project.updatedAt)}`} variant="outlined" />
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={RouterLink} to={`/projects/${project.id}`}>
          Открыть
        </Button>
        {actions}
      </CardActions>
    </Card>
  );
}
