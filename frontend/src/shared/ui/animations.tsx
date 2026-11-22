import { ReactNode } from 'react';
import { Alert, Collapse, Grow } from '@mui/material';

/** Плавное появление элемента списка; index задаёт небольшую задержку («каскад»). */
export function Reveal({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <Grow in appear timeout={300 + Math.min(index, 8) * 70}>
      <div>{children}</div>
    </Grow>
  );
}

/** Сообщение об ошибке отправки формы: плавно раскрывается и сворачивается. */
export function FormAlert({ message }: { message: string | null }) {
  return (
    <Collapse in={Boolean(message)}>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message}
      </Alert>
    </Collapse>
  );
}
