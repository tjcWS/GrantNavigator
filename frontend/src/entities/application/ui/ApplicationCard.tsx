import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Link, Stack, Typography } from '@mui/material';
import { DeadlineChip } from '@/entities/grant';
import { formatDateTime } from '@/shared/lib';
import { ApplicationListItem } from '../model/types';
import { ApplicationStatusChip, CheckStateChip } from './chips';

interface ApplicationCardProps {
  item: ApplicationListItem;
  actions?: ReactNode;
}

export function ApplicationCard({ item, actions }: ApplicationCardProps) {
  return (
    <Card sx={{ transition: 'box-shadow .2s ease', '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <div>
            <Typography variant="h6" component="h2" fontWeight={700}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Конкурс:{' '}
              <Link component={RouterLink} to={`/grants/${item.grantId}`}>
                {item.grantTitle}
              </Link>
              {' · '}Проект:{' '}
              <Link component={RouterLink} to={`/projects/${item.projectId}`}>
                {item.projectTitle}
              </Link>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Изменена {formatDateTime(item.updatedAt)}
            </Typography>
          </div>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="flex-start">
            <ApplicationStatusChip status={item.status} />
            <CheckStateChip application={item} />
            <DeadlineChip deadline={item.grantDeadline} />
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" component={RouterLink} to={`/applications/${item.id}`}>
          Открыть
        </Button>
        {actions}
      </CardActions>
    </Card>
  );
}
