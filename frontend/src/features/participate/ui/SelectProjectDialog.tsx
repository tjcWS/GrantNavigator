import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Stack, Typography,
} from '@mui/material';
import { applicationApi } from '@/entities/application';
import { Grant } from '@/entities/grant';
import { projectApi } from '@/entities/project';
import { getErrorMessage, useAsync } from '@/shared/lib';
import { ErrorState, LoadingBlock, useNotify } from '@/shared/ui';

interface SelectProjectDialogProps {
  /** Конкурс, в котором хотим участвовать; null — окно закрыто */
  grant: Grant | null;
  onClose: () => void;
}

/** Модальное окно «Участвовать в конкурсе → выберите проект». Проект + конкурс = заявка. */
export function SelectProjectDialog({ grant, onClose }: SelectProjectDialogProps) {
  const navigate = useNavigate();
  const notify = useNotify();
  const projects = useAsync(() => (grant ? projectApi.list() : Promise.resolve([])), [grant?.id]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setError(null);
  }, [grant?.id]);

  const handleContinue = async () => {
    if (!grant || selected === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const application = await applicationApi.create({ projectId: selected, grantId: grant.id });
      notify('Заявка создана — данные проекта подставлены автоматически');
      onClose();
      navigate(`/applications/${application.id}`);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProject = () => {
    if (!grant) return;
    onClose();
    navigate(`/projects/new?grantId=${grant.id}`);
  };

  const list = projects.data ?? [];

  return (
    <Dialog open={grant !== null} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Участвовать в конкурсе</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {grant?.title}
        </Typography>

        {projects.initialLoading && <LoadingBlock label="Загружаем ваши проекты…" />}
        {projects.initialError && <ErrorState message={projects.initialError} onRetry={projects.reload} />}

        {!projects.initialLoading && !projects.initialError && list.length === 0 && (
          <Alert severity="info">У вас пока нет проектов. Создайте проект — он автоматически станет основой заявки.</Alert>
        )}

        {list.length > 0 && (
          <>
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Выберите проект:
            </Typography>
            <RadioGroup value={selected ?? ''} onChange={(e) => setSelected(Number(e.target.value))}>
              {list.map((p) => (
                <FormControlLabel key={p.id} value={p.id} control={<Radio />} label={p.title} />
              ))}
            </RadioGroup>
          </>
        )}

        <Collapse in={Boolean(error)}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Collapse>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }} useFlexGap>
          <Button onClick={handleCreateProject} disabled={submitting}>
            Создать новый проект
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={submitting}>
              Отмена
            </Button>
            <Button variant="contained" onClick={handleContinue} disabled={selected === null || submitting}>
              {submitting ? 'Создаём…' : 'Продолжить'}
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
