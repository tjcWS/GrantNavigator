export type ExperienceLevel = 'none' | 'beginner' | 'experienced';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  interests: string[];
  experience: ExperienceLevel;
}

/** Пользователь вместе с паролем — только внутри демо-хранилища. */
export interface StoredUser extends User {
  password: string;
}
