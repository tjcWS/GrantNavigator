import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, AlertColor, Snackbar } from '@mui/material';

type Notify = (message: string, severity?: AlertColor) => void;

const NotifierContext = createContext<Notify | null>(null);

interface Message {
  text: string;
  severity: AlertColor;
  key: number;
}

/** Всплывающие уведомления: const notify = useNotify(); notify('Сохранено'); */
export function NotifierProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback<Notify>((text, severity = 'success') => {
    setMessage({ text, severity, key: Date.now() });
    setOpen(true);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <NotifierContext.Provider value={value}>
      {children}
      <Snackbar
        key={message?.key}
        open={open}
        autoHideDuration={3500}
        onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={message?.severity ?? 'success'} variant="filled" onClose={() => setOpen(false)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </NotifierContext.Provider>
  );
}

export function useNotify(): Notify {
  const ctx = useContext(NotifierContext);
  if (!ctx) throw new Error('useNotify нужно использовать внутри NotifierProvider');
  return ctx;
}
