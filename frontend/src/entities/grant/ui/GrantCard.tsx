import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/AutoAwesome';
import { formatMoney, isExpired } from '@/shared/lib';
import { Grant } from '../model/types';
import { DeadlineChip } from './DeadlineChip';

interface GrantCardProps {
  grant: Grant;
  recommended?: boolean;
  onParticipate: (grant: Grant) => void;
}

export function GrantCard({ grant, recommended, onParticipate }: GrantCardProps) {
  const expired = isExpired(grant.deadline);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .2s ease, box-shadow .2s ease',
        opacity: expired ? 0.75 : 1,
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, minHeight: 24 }}>
          {recommended && <Chip size="small" color="secondary" icon={<StarIcon />} label="Рекомендуем вам" />}
        </Stack>
        <Typography variant="h6" component="h2" fontWeight={700} gutterBottom>
          {grant.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {grant.organizer}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {grant.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {grant.directions.map((d) => (
            <Chip key={d} size="small" label={d} />
          ))}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <DeadlineChip deadline={grant.deadline} />
          <Typography variant="body2" fontWeight={600}>
            до {formatMoney(grant.fundingAmount)}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={RouterLink} to={`/grants/${grant.id}`}>
          Подробнее
        </Button>
        <Tooltip title={expired ? 'Приём заявок завершён' : ''}>
          <span>
            <Button variant="contained" disabled={expired} onClick={() => onParticipate(grant)}>
              Участвовать
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
