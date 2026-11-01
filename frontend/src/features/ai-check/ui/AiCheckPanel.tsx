import { useState } from 'react';
import { Alert, AlertTitle, Box, Button, Card, CardContent, Chip, CircularProgress, Collapse, Fade, LinearProgress, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Application, applicationApi, isCheckOutdated } from '@/entities/application';
import { formatDateTime, getErrorMessage } from '@/shared/lib';
import { Reveal } from '@/shared/ui';

interface AiCheckPanelProps {
  application: Application;
  /** Если задано — кнопка заблокирована, причина показывается пользователю */
  disabledReason?: string;
  onChecked: (application: Application) => void;
}

function scoreColor(score: number): 'success' | 'warning' | 'error' {
  return score >= 85 ? 'success' : score >= 60 ? 'warning' : 'error';
}

/** Панель результатов ИИ-проверки внутри редактора заявки. */
export function AiCheckPanel({ application, disabledReason, onChecked }: AiCheckPanelProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const result = application.checkResult;
  const outdated = isCheckOutdated(application);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      onChecked(await applicationApi.runCheck(application.id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <AutoAwesomeIcon color="secondary" />
          <Typography variant="h6" fontWeight={700}>
            ИИ-проверка
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ассистент сверит заявку с требованиями конкурса и подскажет, что доработать.
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={run}
          disabled={running || Boolean(disabledReason)}
          startIcon={running ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
        >
          {running ? 'Проверяем…' : result ? 'Проверить ещё раз' : 'Проверить заявку'}
        </Button>

        <Collapse in={Boolean(disabledReason) && !running}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {disabledReason}
          </Typography>
        </Collapse>

        <Collapse in={running}>
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              Анализируем разделы заявки…
            </Typography>
          </Box>
        </Collapse>

        <Collapse in={Boolean(error)}>
          <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={run}>Повторить</Button>}>
            {error}
          </Alert>
        </Collapse>

        {!result && !running && !error && (
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            Проверка ещё не проводилась.
          </Alert>
        )}

        {result && (
          <Fade in key={result.checkedAt} timeout={500}>
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={result.score} size={84} thickness={5} color={scoreColor(result.score)} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography fontWeight={700}>{result.score}%</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography fontWeight={600}>{result.summary}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Проверено {formatDateTime(result.checkedAt)}
                  </Typography>
                  {outdated && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip size="small" color="warning" label="Текст изменён после проверки" />
                    </Box>
                  )}
                </Box>
              </Stack>

              {result.issues.length === 0 ? (
                <Alert severity="success">Замечаний нет — заявка полностью соответствует требованиям.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {result.issues.map((issue, index) => (
                    <Reveal key={`${issue.sectionKey}-${index}`} index={index}>
                      <Alert severity={issue.severity} variant="outlined">
                        <AlertTitle>{issue.message}</AlertTitle>
                        {issue.recommendation}
                      </Alert>
                    </Reveal>
                  ))}
                </Stack>
              )}
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
}
