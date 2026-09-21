export type ApplicationStatus = 'preparation' | 'ready' | 'submitted' | 'review' | 'result';
export type ExperienceLevel = 'none' | 'some' | 'expert';

export interface ApplicationSection {
  id: string;
  title: string;
  hint: string;
}

export interface Grant {
  id: string;
  title: string;
  organizer: string;
  shortDescription: string;
  description: string;
  directions: string[];
  requirements: string[];
  criteria: string[];
  funding: string;
  deadline: string; // дата в формате ГГГГ-ММ-ДД
  tags: string[];
  sections: ApplicationSection[];
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  goals: string;
  tasks: string;
  audience: string;
  results: string;
  updatedAt: string;
}

export type ProjectInput = Omit<Project, 'id' | 'updatedAt'>;

export interface CheckIssue {
  sectionTitle: string;
  severity: 'error' | 'warning' | 'ok';
  message: string;
}

export interface CheckResult {
  score: number;
  issues: CheckIssue[];
  recommendations: string[];
  checkedAt: string;
}

export interface Application {
  id: string;
  title: string;
  grantId: string;
  projectId: string;
  status: ApplicationStatus;
  content: Record<string, string>; // id раздела -> текст
  check: CheckResult | null;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  directions: string[];
  activityField: string;
  experience: ExperienceLevel;
}
