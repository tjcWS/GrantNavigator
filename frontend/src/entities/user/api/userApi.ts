import { apiRequest, authRequest, clearTokens, getRefreshToken, saveTokens } from '@/shared/api';
import { ExperienceLevel, User } from '../model/types';
import { AppError } from '@/shared/lib';

export interface RegisterInput { firstName: string; lastName: string; email: string; login: string; password: string; }
export interface ProfilePatch { firstName?: string; lastName?: string; email?: string; login?: string; interests?: string[]; experience?: ExperienceLevel; }
interface ApiUser { id: number; email: string; login: string; first_name: string; last_name: string; experience: string; directions?: { id: number; name: string }[]; }
interface TokenPair { access_token: string; refresh_token: string; user: ApiUser; }
function toUser(u: ApiUser): User {
  const experience: ExperienceLevel = u.experience === 'expert' ? 'experienced' : u.experience === 'some' ? 'beginner' : 'none';
  return { id: u.id, email: u.email, login: u.login, firstName: u.first_name, lastName: u.last_name, experience, interests: (u.directions || []).map((d) => d.name) };
}
async function acceptPair(pair: TokenPair): Promise<User> {
  saveTokens(pair.access_token, pair.refresh_token);
  const user = toUser(pair.user);
  return user;
}

export const userApi = {
  async restoreSession(): Promise<User | null> {
    if (!getRefreshToken()) { clearTokens(); return null; }
    try {
      const raw = await apiRequest<ApiUser>('/auth/me');
      const user = toUser(raw);
      return user;
    } catch { clearTokens(); return null; }
  },
  async register(input: RegisterInput): Promise<User> {
    const pair = await authRequest<TokenPair>('/auth/register', {
      first_name: input.firstName, last_name: input.lastName, email: input.email,
      login: input.login, password: input.password, direction_ids: [], experience: 'none',
    });
    return acceptPair(pair);
  },
  async login(loginOrEmail: string, password: string): Promise<User> {
    return acceptPair(await authRequest<TokenPair>('/auth/login', { login: loginOrEmail, password }));
  },
  async logout(): Promise<void> {
    const refresh_token = getRefreshToken();
    try {
      if (refresh_token) {
        // Сначала гарантируем актуальную пару: apiRequest при 401 ротирует refresh.
        await apiRequest<ApiUser>('/auth/me');
        const activeRefresh = getRefreshToken();
        if (activeRefresh) await apiRequest<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: activeRefresh }) });
      }
    } finally { clearTokens(); }
  },
  async updateProfile(patch: ProfilePatch): Promise<User> {
    const payload: Record<string, unknown> = {};
    if (patch.firstName !== undefined) payload.first_name = patch.firstName;
    if (patch.lastName !== undefined) payload.last_name = patch.lastName;
    if (patch.email !== undefined) payload.email = patch.email;
    if (patch.login !== undefined) payload.login = patch.login;
    if (patch.experience !== undefined) payload.experience = patch.experience === 'experienced' ? 'expert' : patch.experience === 'beginner' ? 'some' : 'none';
    if (patch.interests !== undefined) {
      const directions = await apiRequest<{ id: number; name: string }[]>('/directions');
      payload.direction_ids = directions.filter((d) => patch.interests?.includes(d.name)).map((d) => d.id);
    }
    const user = toUser(await apiRequest<ApiUser>('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }));
    return user;
  },
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiRequest<void>('/users/me/password', { method: 'PATCH', body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) });
  },
  requestPasswordReset: async (_email: string): Promise<void> => { throw new AppError('Восстановление пароля пока не реализовано'); },
};
