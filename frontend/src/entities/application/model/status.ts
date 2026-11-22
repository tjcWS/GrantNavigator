import { Application, ApplicationStatus } from './types';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  preparation: 'Подготовка',
  ready: 'Готова к подаче',
  submitted: 'Подана',
  under_review: 'Рассматривается',
  result_received: 'Результат получен',
};

export const STATUS_ORDER = Object.keys(STATUS_LABELS) as ApplicationStatus[];

export const STATUS_COLORS: Record<ApplicationStatus, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  preparation: 'default',
  ready: 'info',
  submitted: 'primary',
  under_review: 'warning',
  result_received: 'success',
};

/** ИИ-проверка устарела, если текст заявки менялся после неё. */
export function isCheckOutdated(application: Pick<Application, 'checkResult' | 'contentUpdatedAt'>): boolean {
  return Boolean(application.checkResult) && application.contentUpdatedAt > (application.checkResult?.checkedAt ?? '');
}
