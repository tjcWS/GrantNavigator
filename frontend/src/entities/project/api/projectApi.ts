import { clone, db, nextId, requireUserId, respond, save } from '@/shared/api';
import { AppError } from '@/shared/lib';
import { Project, ProjectInput, ProjectWithStats } from '../model/types';

function withStats(project: Project): ProjectWithStats {
  const applicationsCount = db().applications.filter((a) => a.projectId === project.id).length;
  return { ...clone(project), applicationsCount };
}

function findOwned(id: number): Project {
  const project = db().projects.find((p) => p.id === id && p.ownerId === requireUserId());
  if (!project) throw new AppError('Проект не найден');
  return project;
}

export const projectApi = {
  list: (): Promise<ProjectWithStats[]> =>
    respond(() => {
      const userId = requireUserId();
      return db()
        .projects.filter((p) => p.ownerId === userId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(withStats);
    }),

  getById: (id: number): Promise<ProjectWithStats> => respond(() => withStats(findOwned(id))),

  create: (input: ProjectInput): Promise<ProjectWithStats> =>
    respond(() => {
      const now = new Date().toISOString();
      const project: Project = { ...input, id: nextId(db().projects), ownerId: requireUserId(), createdAt: now, updatedAt: now };
      db().projects.push(project);
      save();
      return withStats(project);
    }),

  update: (id: number, input: ProjectInput): Promise<ProjectWithStats> =>
    respond(() => {
      const project = findOwned(id);
      Object.assign(project, input, { updatedAt: new Date().toISOString() });
      save();
      return withStats(project);
    }),

  /** Вместе с проектом удаляются его заявки (как каскад в БД). */
  remove: (id: number): Promise<void> =>
    respond(() => {
      const project = findOwned(id);
      db().applications = db().applications.filter((a) => a.projectId !== project.id);
      db().projects = db().projects.filter((p) => p.id !== project.id);
      save();
    }),
};
