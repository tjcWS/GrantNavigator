import type { Grant } from '@/entities/grant/model/types';
import type { Project } from '@/entities/project/model/types';
import { clone, db, nextId, requireUserId, respond, save } from '@/shared/api';
import { AppError, isExpired } from '@/shared/lib';
import { getCompletion } from '../model/completion';
import { Application, ApplicationListItem, ApplicationStatus } from '../model/types';
import { buildCheckResult } from './mockAiCheck';

export interface ApplicationDetails {
  application: Application;
  grant: Grant;
  project: Project;
}

function findOwned(id: number): Application {
  const userId = requireUserId();
  const application = db().applications.find((a) => a.id === id);
  const project = application && db().projects.find((p) => p.id === application.projectId);
  if (!application || !project || project.ownerId !== userId) throw new AppError('Заявка не найдена');
  return application;
}

function getGrant(id: number): Grant {
  const grant = db().grants.find((g) => g.id === id);
  if (!grant) throw new AppError('Конкурс не найден');
  return grant;
}

/** Предзаполнение заявки данными проекта */
function prefillAnswers(project: Project, grant: Grant): Record<string, string> {
  const source: Record<string, string> = {
    problem: project.fullDescription || project.shortDescription,
    goals: [project.goals, project.tasks].filter(Boolean).join('\n\n'),
    audience: project.targetAudience,
    results: project.expectedResults,
  };
  const answers: Record<string, string> = {};
  for (const section of grant.sections) {
    if (source[section.key]) answers[section.key] = source[section.key];
  }
  return answers;
}

export const applicationApi = {
  list: (filter: { status?: ApplicationStatus; projectId?: number } = {}): Promise<ApplicationListItem[]> =>
    respond(() => {
      const userId = requireUserId();
      const ownedProjects = new Map(db().projects.filter((p) => p.ownerId === userId).map((p) => [p.id, p]));
      return db()
        .applications.filter((a) => ownedProjects.has(a.projectId))
        .filter((a) => !filter.status || a.status === filter.status)
        .filter((a) => filter.projectId === undefined || a.projectId === filter.projectId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((a) => ({
          ...clone(a),
          grantTitle: getGrant(a.grantId).title,
          grantDeadline: getGrant(a.grantId).deadline,
          projectTitle: ownedProjects.get(a.projectId)?.title ?? '',
        }));
    }),

  getById: (id: number): Promise<ApplicationDetails> =>
    respond(() => {
      const application = findOwned(id);
      const project = db().projects.find((p) => p.id === application.projectId) as Project;
      return { application: clone(application), grant: clone(getGrant(application.grantId)), project: clone(project) };
    }),

  create: (input: { projectId: number; grantId: number }): Promise<Application> =>
    respond(() => {
      const userId = requireUserId();
      const project = db().projects.find((p) => p.id === input.projectId && p.ownerId === userId);
      if (!project) throw new AppError('Проект не найден');
      const grant = getGrant(input.grantId);
      if (isExpired(grant.deadline)) throw new AppError('Срок подачи заявок на этот конкурс уже истёк');
      if (db().applications.some((a) => a.projectId === project.id && a.grantId === grant.id)) {
        throw new AppError('Заявка этого проекта на данный конкурс уже существует. Найдите её в разделе «Мои заявки».');
      }
      const now = new Date().toISOString();
      const application: Application = {
        id: nextId(db().applications),
        projectId: project.id,
        grantId: grant.id,
        title: `${project.title} — ${grant.title}`.slice(0, 200),
        answers: prefillAnswers(project, grant),
        status: 'preparation',
        checkResult: null,
        createdAt: now,
        updatedAt: now,
        contentUpdatedAt: now,
      };
      db().applications.push(application);
      save();
      return clone(application);
    }),

  save: (id: number, input: { title: string; answers: Record<string, string> }): Promise<Application> =>
    respond(() => {
      const application = findOwned(id);
      const now = new Date().toISOString();
      if (JSON.stringify(application.answers) !== JSON.stringify(input.answers)) application.contentUpdatedAt = now;
      application.title = input.title;
      application.answers = input.answers;
      application.updatedAt = now;
      save();
      return clone(application);
    }),

  setStatus: (id: number, status: ApplicationStatus): Promise<Application> =>
    respond(() => {
      const application = findOwned(id);
      if (status !== 'preparation') {
        const { missing } = getCompletion(getGrant(application.grantId).sections, application.answers);
        if (missing.length > 0) {
          throw new AppError(
            `Нельзя изменить статус: не заполнены обязательные разделы (${missing.map((s) => `«${s.title}»`).join(', ')})`,
          );
        }
      }
      application.status = status;
      application.updatedAt = new Date().toISOString();
      save();
      return clone(application);
    }, 350),

  runCheck: (id: number): Promise<Application> =>
    respond(() => {
      const application = findOwned(id);
      application.checkResult = buildCheckResult(getGrant(application.grantId), application.answers);
      application.updatedAt = new Date().toISOString();
      save();
      return clone(application);
    }, 1800),

  remove: (id: number): Promise<void> =>
    respond(() => {
      const application = findOwned(id);
      db().applications = db().applications.filter((a) => a.id !== application.id);
      save();
    }),
};
