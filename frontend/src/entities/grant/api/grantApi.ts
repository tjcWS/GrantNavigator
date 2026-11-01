import { clone, db, respond } from '@/shared/api';
import { AppError } from '@/shared/lib';
import { Grant } from '../model/types';

export const grantApi = {
  list: (): Promise<Grant[]> => respond(() => clone(db().grants)),

  getById: (id: number): Promise<Grant> =>
    respond(() => {
      const grant = db().grants.find((g) => g.id === id);
      if (!grant) throw new AppError('Конкурс не найден. Возможно, он был удалён.');
      return clone(grant);
    }),
};
