import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Application, CheckResult, Project, ProjectInput, UserProfile } from '../types';
import { mockApplications, mockGrants, mockProfile, mockProjects } from '../data/mockData';
import { today } from '../utils/dates';

interface AppContextValue {
  projects: Project[];
  applications: Application[];
  profile: UserProfile;
  addProject: (data: ProjectInput) => Project;
  updateProject: (id: string, data: ProjectInput) => void;
  deleteProject: (id: string) => void;
  createApplication: (grantId: string, projectId: string) => Application;
  updateApplication: (id: string, patch: Partial<Pick<Application, 'content' | 'status'>> & { check?: CheckResult | null }) => void;
  deleteApplication: (id: string) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);

  const addProject: AppContextValue['addProject'] = (data) => {
    const project: Project = { ...data, id: uid(), updatedAt: today() };
    setProjects((prev) => [project, ...prev]);
    return project;
  };

  const updateProject: AppContextValue['updateProject'] = (id, data) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: today() } : p)));
  };

  const deleteProject: AppContextValue['deleteProject'] = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setApplications((prev) => prev.filter((a) => a.projectId !== id)); // заявки удалённого проекта тоже удаляем
  };

  const createApplication: AppContextValue['createApplication'] = (grantId, projectId) => {
    const existing = applications.find((a) => a.grantId === grantId && a.projectId === projectId);
    if (existing) return existing;
    const project = projects.find((p) => p.id === projectId);
    const grant = mockGrants.find((g) => g.id === grantId);
    const application: Application = {
      id: uid(),
      title: `Заявка: ${project?.title ?? grant?.title ?? 'без названия'}`,
      grantId,
      projectId,
      status: 'preparation',
      content: {},
      check: null,
      updatedAt: today(),
    };
    setApplications((prev) => [application, ...prev]);
    return application;
  };

  const updateApplication: AppContextValue['updateApplication'] = (id, patch) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: today() } : a)));
  };

  const deleteApplication: AppContextValue['deleteApplication'] = (id) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const updateProfile: AppContextValue['updateProfile'] = (patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AppContext.Provider
      value={{ projects, applications, profile, addProject, updateProject, deleteProject, createApplication, updateApplication, deleteApplication, updateProfile }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp нужно вызывать внутри AppProvider');
  return ctx;
}

