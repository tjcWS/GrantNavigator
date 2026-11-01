import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { userApi } from '../api/userApi';
import { User } from './types';

interface SessionValue {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

/** Хранит текущего пользователя. Подключается один раз в app/App.tsx. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => userApi.getCurrentSync());

  const logout = useCallback(() => {
    userApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, setUser, logout }), [user, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession нужно использовать внутри SessionProvider');
  return ctx;
}
