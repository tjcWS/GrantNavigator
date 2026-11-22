import { ExperienceLevel } from './types';

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  none: 'Опыта участия нет',
  beginner: 'Участвовал(а) 1–2 раза',
  experienced: 'Опытный участник (3 и более раз)',
};

export const EXPERIENCE_LEVELS = Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[];
