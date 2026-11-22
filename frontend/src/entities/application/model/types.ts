export type ApplicationStatus = 'preparation' | 'ready' | 'submitted' | 'under_review' | 'result_received';
export type IssueSeverity = 'error' | 'warning' | 'info';

export interface CheckIssue {
  severity: IssueSeverity;
  /** Ключ раздела заявки, к которому относится замечание (или null — общее) */
  sectionKey: string | null;
  message: string;
  recommendation: string;
}

export interface CheckResult {
  checkedAt: string;
  /** Оценка соответствия, 0–100 */
  score: number;
  summary: string;
  issues: CheckIssue[];
}

export interface Application {
  id: number;
  projectId: number;
  grantId: number;
  title: string;
  /** Ответы по разделам: { ключ_раздела: текст } */
  answers: Record<string, string>;
  status: ApplicationStatus;
  checkResult: CheckResult | null;
  createdAt: string;
  updatedAt: string;
  /** Когда в последний раз менялся текст заявки (нужно, чтобы понять, что проверка устарела) */
  contentUpdatedAt: string;
}

/** Заявка с данными конкурса и проекта для списков */
export interface ApplicationListItem extends Application {
  grantTitle: string;
  grantDeadline: string;
  projectTitle: string;
}
