import { Chip } from '@mui/material';
import EventIcon from '@mui/icons-material/EventOutlined';
import { daysLeft, formatDate, pluralize } from '@/shared/lib';

/** Срок подачи: цвет зависит от того, сколько осталось дней. */
export function DeadlineChip({ deadline }: { deadline: string }) {
  const left = daysLeft(deadline);

  let label = `До ${formatDate(deadline)}`;
  let color: 'default' | 'warning' | 'error' = 'default';

  if (left < 0) {
    label = 'Срок подачи истёк';
  } else if (left === 0) {
    label = 'Сегодня последний день';
    color = 'error';
  } else if (left <= 7) {
    label = `Осталось ${left} ${pluralize(left, ['день', 'дня', 'дней'])}`;
    color = 'warning';
  }

  return <Chip size="small" icon={<EventIcon />} label={label} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />;
}
