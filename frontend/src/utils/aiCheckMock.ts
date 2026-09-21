import type { CheckIssue, CheckResult, Grant } from '../types';
import { today } from './dates';

// ДЕМО-проверка!!!!: настоящий ИИ подключим в следующих лабораторных.
// Пока правило простое: пустой раздел — ошибка, короткий (<200 символов) — предупреждение.
export function runMockCheck(grant: Grant, content: Record<string, string>): CheckResult {
  const issues: CheckIssue[] = grant.sections.map((section) => {
    const length = (content[section.id] ?? '').trim().length;
    if (length === 0) {
      return { sectionTitle: section.title, severity: 'error', message: 'Раздел не заполнен. Он обязателен по требованиям конкурса.' };
    }
    if (length < 200) {
      return {
        sectionTitle: section.title,
        severity: 'warning',
        message: `Раздел раскрыт слишком кратко (${length} симв.). Добавьте цифры, сроки и примеры.`,
      };
    }
    return { sectionTitle: section.title, severity: 'ok', message: 'Раздел заполнен достаточно подробно.' };
  });

  const points = issues.reduce((sum, i) => sum + (i.severity === 'ok' ? 1 : i.severity === 'warning' ? 0.5 : 0), 0);
  const score = Math.round((points / issues.length) * 100);

  const recommendations = issues
    .filter((i) => i.severity !== 'ok')
    .map((i) => (i.severity === 'error' ? `Заполните раздел «${i.sectionTitle}».` : `Дополните раздел «${i.sectionTitle}» конкретными фактами.`));
  recommendations.push(`Проверьте, что заявка отвечает критерию конкурса: «${grant.criteria[0]}».`);

  return { score, issues, recommendations, checkedAt: today() };
}
