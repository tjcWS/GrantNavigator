/** Раздел заявки, который требует конкурс (например, «Цели и задачи»). */
export interface GrantSection {
  key: string;
  title: string;
  hint: string;
  required: boolean;
  minLength?: number;
  maxLength: number;
  /** Нужны ли в тексте числа (измеримые показатели, суммы) */
  needsNumbers?: boolean;
}

export interface Grant {
  id: number;
  title: string;
  organizer: string;
  description: string;
  requirements: string;
  criteria: string[];
  fundingAmount: number;
  /** Срок подачи, YYYY-MM-DD */
  deadline: string;
  directions: string[];
  sections: GrantSection[];
}
