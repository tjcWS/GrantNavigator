import { Chip } from '@mui/material';
import { STATUS_COLORS, STATUS_LABELS, isCheckOutdated } from '../model/status';
import { Application, ApplicationStatus } from '../model/types';

export function ApplicationStatusChip({ status }: { status: ApplicationStatus }) {
  return <Chip size="small" label={STATUS_LABELS[status]} color={STATUS_COLORS[status]} />;
}

/** Состояние ИИ-проверки: не проводилась / оценка / устарела */
export function CheckStateChip({ application }: { application: Pick<Application, 'checkResult' | 'contentUpdatedAt'> }) {
  const { checkResult } = application;
  if (!checkResult) return <Chip size="small" variant="outlined" label="Не проверена" />;
  if (isCheckOutdated(application)) return <Chip size="small" variant="outlined" color="warning" label={`Проверка устарела (${checkResult.score}%)`} />;
  const color = checkResult.score >= 85 ? 'success' : checkResult.score >= 60 ? 'warning' : 'error';
  return <Chip size="small" variant="outlined" color={color} label={`Проверена: ${checkResult.score}%`} />;
}
