import { ReactNode } from 'react';
import { Box, Button, CircularProgress, Fade, Skeleton, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

/** Состояние «загрузка» */
export function LoadingBlock({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <Fade in appear timeout={400}>
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <CircularProgress />
        <Typography color="text.secondary">{label}</Typography>
      </Stack>
    </Fade>
  );
}

/** Скелетоны-карточки для сетки (каталог, проекты) */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={230} animation="wave" />
      ))}
    </Box>
  );
}

/** Состояние «ошибка» с кнопкой повтора */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Fade in appear>
      <Stack alignItems="center" spacing={1.5} sx={{ py: 8, textAlign: 'center' }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 56 }} />
        <Typography variant="h6">Не удалось загрузить данные</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
          {message}
        </Typography>
        {onRetry && (
          <Button variant="outlined" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </Stack>
    </Fade>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Состояние «данных нет» */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Fade in appear>
      <Stack alignItems="center" spacing={1.5} sx={{ py: 8, textAlign: 'center' }}>
        <InboxOutlinedIcon color="disabled" sx={{ fontSize: 56 }} />
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
            {description}
          </Typography>
        )}
        {action}
      </Stack>
    </Fade>
  );
}

interface AsyncBoundaryProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  skeleton?: ReactNode;
  children: ReactNode;
}

/** Показывает нужное состояние: загрузка → ошибка → пусто → данные. */
export function AsyncBoundary({ loading, error, onRetry, isEmpty, emptyState, skeleton, children }: AsyncBoundaryProps) {
  if (loading) return <>{skeleton ?? <LoadingBlock />}</>;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return <>{emptyState}</>;
  return <>{children}</>;
}
