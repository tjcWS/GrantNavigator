import { Box, Typography } from '@mui/material';
import { daysLeft, formatDate, pluralDays } from '../utils/dates';


export default function DeadlineInfo({ deadline }: { deadline: string }) {
  const days = daysLeft(deadline);
  const closed = days < 0;
  const urgent = !closed && days <= 14;
  const color = closed ? 'text.disabled' : urgent ? 'warning.dark' : 'text.primary';
  const text = closed ? 'Приём завершён' : days === 0 ? 'Сегодня последний день' : `Осталось ${days} ${pluralDays(days)}`;

  return (
    <Box>
      <Typography variant="body2" fontWeight={700} color={color}>
        {text}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Подача до {formatDate(deadline)}
      </Typography>
    </Box>
  );
}
