import { db, nextId, requireUserId, respond, save } from '@/shared/api';
import { AppError } from '@/shared/lib';
import { ExperienceLevel, StoredUser, User } from '../model/types';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  password: string;
}

export interface ProfilePatch {
  firstName?: string;
  lastName?: string;
  email?: string;
  login?: string;
  interests?: string[];
  experience?: ExperienceLevel;
}

function toUser(stored: StoredUser): User {
  const { password: _password, ...user } = stored;
  return { ...user, interests: [...user.interests] };
}

function assertUnique(email: string | undefined, login: string | undefined, exceptId?: number) {
  const others = db().users.filter((u) => u.id !== exceptId);
  if (email && others.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new AppError('Пользователь с таким email уже существует');
  }
  if (login && others.some((u) => u.login.toLowerCase() === login.toLowerCase())) {
    throw new AppError('Пользователь с таким логином уже существует');
  }
}

export const userApi = {
  /** Пользователь из сохранённой сессии (синхронно — нужен при старте приложения) */
  getCurrentSync(): User | null {
    const id = db().sessionUserId;
    const stored = db().users.find((u) => u.id === id);
    return stored ? toUser(stored) : null;
  },

  register: (input: RegisterInput): Promise<User> =>
    respond(() => {
      assertUnique(input.email, input.login);
      const stored: StoredUser = {
        id: nextId(db().users),
        ...input,
        email: input.email.trim().toLowerCase(),
        interests: [],
        experience: 'none',
      };
      db().users.push(stored);
      db().sessionUserId = stored.id;
      save();
      return toUser(stored);
    }),

  login: (loginOrEmail: string, password: string): Promise<User> =>
    respond(() => {
      const value = loginOrEmail.trim().toLowerCase();
      const stored = db().users.find((u) => u.login.toLowerCase() === value || u.email.toLowerCase() === value);
      if (!stored || stored.password !== password) throw new AppError('Неверный логин или пароль');
      db().sessionUserId = stored.id;
      save();
      return toUser(stored);
    }),

  logout(): void {
    db().sessionUserId = null;
    save();
  },

  updateProfile: (patch: ProfilePatch): Promise<User> =>
    respond(() => {
      const stored = db().users.find((u) => u.id === requireUserId());
      if (!stored) throw new AppError('Пользователь не найден');
      assertUnique(patch.email, patch.login, stored.id);
      Object.assign(stored, patch, patch.email ? { email: patch.email.trim().toLowerCase() } : {});
      save();
      return toUser(stored);
    }),

  changePassword: (oldPassword: string, newPassword: string): Promise<void> =>
    respond(() => {
      const stored = db().users.find((u) => u.id === requireUserId());
      if (!stored) throw new AppError('Пользователь не найден');
      if (stored.password !== oldPassword) throw new AppError('Текущий пароль указан неверно');
      stored.password = newPassword;
      save();
    }),

  /** Ответ всегда одинаковый — чтобы нельзя было выяснить, зарегистрирован ли email. */
  requestPasswordReset: (_email: string): Promise<void> => respond(() => undefined, 700),
};
