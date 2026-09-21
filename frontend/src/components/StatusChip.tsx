import { Chip } from '@mui/material';
import type { ApplicationStatus } from '../types';
import { STATUS_LABELS } from '../data/constants';

const COLORS: Record<ApplicationStatus, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  preparation: 'default',
  ready: 'info',
  submitted: 'primary',
  review: 'warning',
  result: 'success',
};

export default function StatusChip({ status }: { status: ApplicationStatus }) {
  return <Chip size="small" label={STATUS_LABELS[status]} color={COLORS[status]} variant={status === 'preparation' ? 'outlined' : 'filled'} />;
}
