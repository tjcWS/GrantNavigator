import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, LinearProgress, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageHeader from '../components/PageHeader';
import DeadlineInfo from '../components/DeadlineInfo';
import AiCheckPanel from '../components/AiCheckPanel';
import { STATUS_LABELS, STATUS_ORDER } from '../data/constants';
import { mockGrants } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { runMockCheck } from '../utils/aiCheckMock';
import type { ApplicationStatus } from '../types';

// Экраны 9–10: редактор заявки под требования конкурса + панель ИИ-проверки.
export default function ApplicationEditPage() {
  const { id } = useParams();
  const { applications, projects, updateApplication } = useApp();
  const application = applications.find((a) => a.id === id);
  const grant = mockGrants.find((g) => g.id === application?.grantId);
  const project = projects.find((p) => p.id === application?.projectId);

  const [content, setContent] = useState<Record<string, string>>(application?.content ?? {});
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!application || !grant) {
    return (
      <>
        <PageHeader title="Заявка не найдена" backTo="/applications" backLabel="Мои заявки" />
        <Alert severity="warning">Возможно, заявка была удалена.</Alert>
      </>
    );
  }

  const filled = grant.sections.filter((s) => (content[s.id] ?? '').trim().length > 0).length;
  const progress = Math.round((filled / grant.sections.length) * 100);

  const save = () => {
    updateApplication(application.id, { content });
    setSaved(true);
  };

  const runCheck = () => {
    updateApplication(application.id, { content });
    setChecking(true);
    // Имитация работы ассистента: задержка 1,2 секунды
    setTimeout(() => {
      updateApplication(application.id, { check: runMockCheck(grant, content) });
      setChecking(false);
    }, 1200);
  };

  return (
    <>
      <PageHeader
        title={application.title}
        subtitle={`Конкурс: ${grant.title}. Проект: ${project?.title ?? '—'}`}
        backTo="/applications"
        backLabel="Мои заявки"
        actions={
          <Button component={RouterLink} to={`/grants/${grant.id}`}>
            К конкурсу
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, alignItems: 'start' }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={3}>
            {grant.sections.map((section) => {
              const value = content[section.id] ?? '';
              return (
                <TextField
                  key={section.id}
                  label={section.title}
                  helperText={`${section.hint}. Символов: ${value.length}`}
                  multiline
                  minRows={4}
                  value={value}
                  onChange={(e) => setContent({ ...content, [section.id]: e.target.value })}
                />
              );
            })}
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={save}>
                Сохранить изменения
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <DeadlineInfo deadline={grant.deadline} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Заполнено разделов: {filled} из {grant.sections.length}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
              </Box>
              <TextField
                select
                label="Статус заявки"
                value={application.status}
                onChange={(e) => updateApplication(application.id, { status: e.target.value as ApplicationStatus })}
              >
                {STATUS_ORDER.map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Paper>

          <Accordion variant="outlined" disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700}>Требования конкурса</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 2.5, my: 0 }}>
                {[...grant.requirements, ...grant.criteria.map((c) => `Критерий: ${c}`)].map((r) => (
                  <li key={r}>
                    <Typography variant="body2">{r}</Typography>
                  </li>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <AiCheckPanel result={application.check} loading={checking} onRun={runCheck} />
        </Stack>
      </Box>

      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)} message="Изменения сохранены" />
    </>
  );
}
