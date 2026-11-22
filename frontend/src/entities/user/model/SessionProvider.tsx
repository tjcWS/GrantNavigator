import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { userApi } from '../api/userApi';
import { User } from './types';

interface SessionValue { user: User | null; loading: boolean; setUser: (user: User | null) => void; logout: () => void; }
const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    userApi.restoreSession().then((restored) => { if (active) setUser(restored); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    void userApi.logout().catch(() => undefined);
  }, []);
  const value = useMemo(() => ({ user, loading, setUser, logout }), [user, loading, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession нужно использовать внутри SessionProvider');
  return ctx;
}
