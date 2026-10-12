import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { Grant } from '../types';
import { getDirectionMeta } from '../utils/directionMeta';
import { daysLeft } from '../utils/dates';
import DeadlineInfo from './DeadlineInfo';

interface Props {
  grant: Grant;
  recommended: boolean;
  onParticipate: (grantId: string) => void;
}


export default function GrantCard({ grant, recommended, onParticipate }: Props) {
  const meta = getDirectionMeta(grant.directions[0]);
  const closed = daysLeft(grant.deadline) < 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* "Иллюстрация": цветной блок с иконкой направления */}
      <Box sx={{ bgcolor: meta.bg, color: meta.fg, height: 96, display: 'flex', alignItems: 'center', px: 2.5, position: 'relative', '& svg': { fontSize: 48 } }}>
        {meta.icon}
        {recommended && <Chip size="small" color="primary" label="Рекомендовано" sx={{ position: 'absolute', top: 12, right: 12 }} />}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2">
          {grant.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {grant.organizer}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {grant.shortDescription}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1.5 }}>
          {grant.tags.map((tag) => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 2 }}>
          <DeadlineInfo deadline={grant.deadline} />
          <Typography variant="body2" fontWeight={700}>
            {grant.funding}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button component={RouterLink} to={`/grants/${grant.id}`} variant="outlined">
          Подробнее
        </Button>
        <Button variant="contained" disabled={closed} onClick={() => onParticipate(grant.id)}>
          Участвовать
        </Button>
      </CardActions>
    </Card>
  );
}
