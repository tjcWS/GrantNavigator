import { Alert, Box, Button, Chip, CircularProgress, LinearProgress, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { CheckResult } from '../types';
import { formatDate } from '../utils/dates';

interface Props {
  result: CheckResult | null;
  loading: boolean;
  onRun: () => void;
}

const SEVERITY_LABEL = { error: 'Не заполнено', warning: 'Нужно дополнить', ok: 'Хорошо' } as const;
const SEVERITY_COLOR = { error: 'error', warning: 'warning', ok: 'success' } as const;

// Панель результатов ИИ-проверки внутри редактора заявки.
export default function AiCheckPanel({ result, loading, onRun }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h6" component="h2">
          Проверка ИИ-ассистентом
        </Typography>
      </Stack>

      <Button variant="contained" fullWidth onClick={onRun} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
        {loading ? 'Проверяем…' : result ? 'Проверить ещё раз' : 'Проверить заявку'}
      </Button>

      {!result && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Заполните разделы и запустите проверку — ассистент найдёт пропуски и подскажет, что улучшить. Сейчас это демо-версия проверки.
        </Alert>
      )}

      {result && !loading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Соответствие требованиям: {result.score}% (проверено {formatDate(result.checkedAt)})
          </Typography>
          <LinearProgress variant="determinate" value={result.score} sx={{ height: 8, borderRadius: 4, my: 1 }} />

          <Typography fontWeight={700} sx={{ mt: 2 }}>
            Результат по разделам
          </Typography>
          <List dense disablePadding>
            {result.issues.map((issue) => (
              <ListItem key={issue.sectionTitle} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <span>{issue.sectionTitle}</span>
                      <Chip size="small" label={SEVERITY_LABEL[issue.severity]} color={SEVERITY_COLOR[issue.severity]} />
                    </Stack>
                  }
                  secondary={issue.message}
                />
              </ListItem>
            ))}
          </List>

          <Typography fontWeight={700} sx={{ mt: 2 }}>
            Рекомендации
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, my: 0.5 }}>
            {result.recommendations.map((text) => (
              <li key={text}>
                <Typography variant="body2">{text}</Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
