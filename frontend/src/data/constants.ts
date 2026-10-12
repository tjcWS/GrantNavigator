import type { ApplicationStatus, ExperienceLevel } from '../types';

export const DIRECTIONS = [
  'Экология',
  'Образование',
  'Молодёжные инициативы',
  'Социальная поддержка',
  'Культура и искусство',
  'Наука и технологии',
];

export const ACTIVITY_FIELDS = [
  'НКО и общественные организации',
  'Образовательное учреждение',
  'Инициативная группа',
  'Малый бизнес',
  'Другое',
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  preparation: 'Подготовка',
  ready: 'Готова к подаче',
  submitted: 'Подана',
  review: 'Рассматривается',
  result: 'Результат получен',
};

export const STATUS_ORDER: ApplicationStatus[] = ['preparation', 'ready', 'submitted', 'review', 'result'];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  none: 'Пока нет опыта',
  some: 'Участвовал(а) 1–3 раза',
  expert: 'Опытный участник',
};
