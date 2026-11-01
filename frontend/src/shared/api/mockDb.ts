/**
 * Демо-«база данных» в localStorage — заменяет backend до интеграции с API (лабораторная 4).
 * Типы берутся из entities (только `import type`, в сборку они не попадают).
 */
import type { Application } from '@/entities/application/model/types';
import type { Grant, GrantSection } from '@/entities/grant/model/types';
import type { Project } from '@/entities/project/model/types';
import type { StoredUser } from '@/entities/user/model/types';
import { AppError } from '@/shared/lib/errors';
import { daysFromNow } from '@/shared/lib/date';

interface DbShape {
  users: StoredUser[];
  projects: Project[];
  applications: Application[];
  grants: Grant[];
  sessionUserId: number | null;
}

const STORAGE_KEY = 'gn_db_v1';

const SECTIONS: GrantSection[] = [
  { key: 'problem', title: 'Описание проблемы и актуальность', hint: 'Опишите, какую проблему решает проект, и подтвердите актуальность фактами или данными.', required: true, minLength: 100, maxLength: 1500 },
  { key: 'goals', title: 'Цели и задачи', hint: 'Сформулируйте главную цель и 3–5 конкретных задач.', required: true, minLength: 80, maxLength: 1000 },
  { key: 'audience', title: 'Целевая аудитория', hint: 'Кто получит пользу от проекта и сколько человек вы охватите.', required: true, minLength: 40, maxLength: 800 },
  { key: 'results', title: 'Ожидаемые результаты', hint: 'Укажите измеримые показатели: количество участников, мероприятий, сроки.', required: true, minLength: 80, maxLength: 1000, needsNumbers: true },
  { key: 'team', title: 'Команда проекта', hint: 'Кто будет реализовывать проект и какой у команды опыт.', required: false, maxLength: 800 },
];

const withTeamRequired = SECTIONS.map((s) => (s.key === 'team' ? { ...s, required: true, minLength: 40 } : s));
const withBudget: GrantSection[] = [
  ...SECTIONS,
  { key: 'budget', title: 'Бюджет проекта', hint: 'Перечислите основные статьи расходов с суммами.', required: true, minLength: 60, maxLength: 1000, needsNumbers: true },
];

function seedGrants(): Grant[] {
  return [
    {
      id: 1,
      title: 'Экологические инициативы',
      organizer: 'Фонд «Зелёное будущее»',
      description: 'Конкурс поддерживает проекты по сохранению природы, раздельному сбору отходов и экологическому просвещению.',
      requirements: 'Заявитель — НКО или инициативная группа. Срок реализации проекта — до 12 месяцев.',
      criteria: ['Актуальность проблемы', 'Реалистичность бюджета', 'Измеримость результатов', 'Опыт команды'],
      fundingAmount: 1_500_000,
      deadline: daysFromNow(45),
      directions: ['Экология', 'Социальная сфера'],
      sections: SECTIONS,
    },
    {
      id: 2,
      title: 'Молодёжная лаборатория',
      organizer: 'Агентство по делам молодёжи',
      description: 'Грант на развитие молодёжных центров, образовательных мероприятий и социальных стартапов.',
      requirements: 'Возраст участников команды — от 18 до 35 лет. Обязательно описание команды.',
      criteria: ['Новизна идеи', 'Охват аудитории', 'Устойчивость проекта после окончания гранта'],
      fundingAmount: 800_000,
      deadline: daysFromNow(5),
      directions: ['Молодёжь', 'Образование'],
      sections: withTeamRequired,
    },
    {
      id: 3,
      title: 'Цифровое образование',
      organizer: 'Образовательный фонд «Знание»',
      description: 'Поддержка образовательных платформ, онлайн-курсов и инструментов для школьных учителей.',
      requirements: 'Опыт реализации образовательных проектов не менее года. Необходим подробный бюджет.',
      criteria: ['Качество методики', 'Масштабируемость', 'Обратная связь от аудитории', 'Прозрачность бюджета'],
      fundingAmount: 2_500_000,
      deadline: daysFromNow(75),
      directions: ['Образование', 'Наука'],
      sections: withBudget,
    },
    {
      id: 4,
      title: 'Культурное наследие региона',
      organizer: 'Министерство культуры',
      description: 'Конкурс на сохранение и популяризацию местных традиций, ремёсел и памятников культуры.',
      requirements: 'Заявитель — НКО или музей. Подтверждение партнёров приветствуется.',
      criteria: ['Культурная значимость', 'Вовлечение местных жителей'],
      fundingAmount: 1_000_000,
      deadline: daysFromNow(-10),
      directions: ['Культура'],
      sections: SECTIONS,
    },
    {
      id: 5,
      title: 'Здоровое поколение',
      organizer: 'Фонд «Спорт для всех»',
      description: 'Проекты по профилактике заболеваний, развитию массового спорта и здорового образа жизни.',
      requirements: 'Проект должен охватывать не менее 100 участников.',
      criteria: ['Охват участников', 'Измеримый эффект для здоровья', 'Квалификация команды'],
      fundingAmount: 1_200_000,
      deadline: daysFromNow(12),
      directions: ['Здравоохранение', 'Спорт'],
      sections: SECTIONS,
    },
    {
      id: 6,
      title: 'Наука — школьникам',
      organizer: 'Научный фонд «Горизонт»',
      description: 'Грант на кружки, лаборатории и научно-популярные мероприятия для школьников.',
      requirements: 'Партнёрство со школой или вузом.',
      criteria: ['Научная достоверность', 'Интерес для школьников', 'Масштабируемость'],
      fundingAmount: 900_000,
      deadline: daysFromNow(60),
      directions: ['Наука', 'Образование', 'Молодёжь'],
      sections: SECTIONS,
    },
  ];
}

function seed(): DbShape {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 1,
        firstName: 'Анна',
        lastName: 'Демонстрационная',
        email: 'demo@example.com',
        login: 'demo',
        password: 'demo12345', // демо-хранилище: в реальном приложении пароль хранится только в виде хеша на сервере
        interests: ['Экология', 'Образование'],
        experience: 'beginner',
      },
    ],
    projects: [
      {
        id: 1,
        ownerId: 1,
        title: 'Экологический центр',
        shortDescription: 'Городской центр экопросвещения и раздельного сбора отходов.',
        fullDescription:
          'В нашем районе нет ни одного пункта раздельного сбора отходов, а жители не знают, как правильно сортировать мусор. Центр станет площадкой для лекций, мастерских и приёма вторсырья.',
        goals: 'Сформировать у жителей района привычку раздельного сбора отходов и сократить объём мусора на полигоне.',
        tasks: 'Оборудовать пункт приёма вторсырья; провести 24 занятия; запустить школьную программу.',
        targetAudience: 'Жители района, школьники 10–17 лет, управляющие компании.',
        expectedResults: 'Не менее 1 500 участников занятий и 30 тонн вторсырья за первый год работы.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        ownerId: 1,
        title: 'Молодёжная лаборатория',
        shortDescription: 'Пространство для молодёжных проектов и стартапов.',
        fullDescription: '',
        goals: 'Помочь молодым людям запускать социальные проекты.',
        tasks: '',
        targetAudience: 'Молодёжь 16–25 лет.',
        expectedResults: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        ownerId: 1,
        title: 'Образовательная платформа',
        shortDescription: 'Онлайн-платформа с практическими курсами для школьных учителей.',
        fullDescription: '',
        goals: 'Сделать повышение квалификации учителей доступным и практичным.',
        tasks: '',
        targetAudience: 'Школьные учителя.',
        expectedResults: '',
        createdAt: now,
        updatedAt: now,
      },
    ],
    applications: [
      {
        id: 1,
        projectId: 1,
        grantId: 1,
        title: 'Экологический центр — Экологические инициативы',
        answers: {
          problem:
            'В нашем районе нет ни одного пункта раздельного сбора отходов, а жители не знают, как правильно сортировать мусор. Центр станет площадкой для лекций, мастерских и приёма вторсырья.',
          goals: 'Сформировать у жителей района привычку раздельного сбора отходов и сократить объём мусора на полигоне.',
        },
        status: 'preparation',
        checkResult: null,
        createdAt: now,
        updatedAt: now,
        contentUpdatedAt: now,
      },
    ],
    grants: seedGrants(),
    sessionUserId: null,
  };
}

let state: DbShape | null = null;

function load(): DbShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DbShape;
  } catch {
    /* повреждённые данные — создадим заново */
  }
  const fresh = seed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function db(): DbShape {
  if (!state) state = load();
  return state;
}

/** Сохранить изменения в localStorage */
export function save(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db()));
}

/** Вернуть демо-данные к исходным (и выйти из аккаунта) */
export function resetDb(): void {
  state = seed();
  save();
}

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const nextId = (items: Array<{ id: number }>): number => items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

/** id текущего пользователя; без входа — ошибка (как 401 от backend) */
export function requireUserId(): number {
  const id = db().sessionUserId;
  if (id === null) throw new AppError('Требуется вход в аккаунт');
  return id;
}
