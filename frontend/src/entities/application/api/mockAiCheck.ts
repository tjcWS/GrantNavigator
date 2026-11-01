import type { Grant } from '@/entities/grant/model/types';
import { CheckIssue, CheckResult } from '../model/types';

/**
 * Демо-«ИИ-проверка»: простые правила вместо настоящей модели.
 * В следующих лабораторных заменяется на вызов backend / LLM.
 */
export function buildCheckResult(grant: Grant, answers: Record<string, string>): CheckResult {
  const issues: CheckIssue[] = [];
  let good = 0;

  for (const section of grant.sections) {
    const text = (answers[section.key] ?? '').trim();

    if (!text) {
      issues.push({
        severity: section.required ? 'error' : 'info',
        sectionKey: section.key,
        message: section.required ? `Раздел «${section.title}» не заполнен` : `Раздел «${section.title}» пока пустой`,
        recommendation: section.hint,
      });
      continue;
    }

    if (text.length > section.maxLength) {
      issues.push({
        severity: 'error',
        sectionKey: section.key,
        message: `Раздел «${section.title}» превышает допустимый объём (${text.length} из ${section.maxLength} символов)`,
        recommendation: 'Сократите текст, оставив самое важное.',
      });
      continue;
    }

    if (section.minLength && text.length < section.minLength) {
      issues.push({
        severity: 'warning',
        sectionKey: section.key,
        message: `Раздел «${section.title}» раскрыт слишком кратко (${text.length} из ${section.minLength} символов)`,
        recommendation: section.hint,
      });
      continue;
    }

    if (section.needsNumbers && !/\d/.test(text)) {
      issues.push({
        severity: 'warning',
        sectionKey: section.key,
        message: `В разделе «${section.title}» нет конкретных чисел`,
        recommendation: 'Добавьте измеримые показатели: количество, сроки, суммы.',
      });
      continue;
    }

    good += 1;
  }

  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const score = Math.max(0, Math.min(100, Math.round((good / grant.sections.length) * 100) - warnings * 5));

  let summary = 'Заявка пока не соответствует требованиям конкурса — доработайте отмеченные разделы.';
  if (score >= 85) summary = 'Заявка выглядит сильной и готова к подаче.';
  else if (score >= 60) summary = 'Заявка в целом соответствует требованиям, но есть что улучшить.';

  const order = { error: 0, warning: 1, info: 2 } as const;
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return { checkedAt: new Date().toISOString(), score, summary, issues };
}
