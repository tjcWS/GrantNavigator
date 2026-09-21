import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader';
import DeadlineInfo from '../components/DeadlineInfo';
import ProjectSelectDialog from '../components/ProjectSelectDialog';
import { mockGrants } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { isRecommended } from '../utils/grants';
import { daysLeft } from '../utils/dates';

function BulletList({ items }: { items: string[] }) {
  return (
    <Box component="ul" sx={{ pl: 2.5, my: 0 }}>
      {items.map((item) => (
        <li key={item}>
          <Typography>{item}</Typography>
        </li>
      ))}
    </Box>
  );
}

// Экран 4: подробная страница конкурса.
export default function GrantDetailPage() {
  const { id } = useParams();
  const { profile } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const grant = mockGrants.find((g) => g.id === id);

  if (!grant) {
    return (
      <>
        <PageHeader title="Конкурс не найден" backTo="/grants" backLabel="В каталог" />
        <Alert severity="warning">Такого конкурса нет. Вернитесь в каталог и выберите другой.</Alert>
      </>
    );
  }

  const recommended = isRecommended(grant, profile);
  const closed = daysLeft(grant.deadline) < 0;
  const matched = grant.directions.filter((d) => profile.directions.includes(d));

  return (
    <>
      <PageHeader title={grant.title} subtitle={`Организатор: ${grant.organizer}`} backTo="/grants" backLabel="В каталог" />

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, alignItems: 'start' }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                О конкурсе
              </Typography>
              <Typography>{grant.description}</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1.5 }}>
                {grant.directions.map((d) => (
                  <Chip key={d} label={d} color="primary" variant="outlined" size="small" />
                ))}
                {grant.tags.map((t) => (
                  <Chip key={t} label={t} size="small" />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Требования к участникам
              </Typography>
              <BulletList items={grant.requirements} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Критерии оценки
              </Typography>
              <BulletList items={grant.criteria} />
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Размер финансирования
                </Typography>
                <Typography variant="h6">{grant.funding}</Typography>
              </Box>
              <DeadlineInfo deadline={grant.deadline} />
              <Button variant="contained" size="large" disabled={closed} onClick={() => setDialogOpen(true)}>
                Участвовать
              </Button>
            </Stack>
          </Paper>
          <Alert severity={recommended ? 'success' : 'info'}>
            {recommended ? `Ассистент рекомендует: конкурс совпадает с вашими интересами (${matched.join(', ')}).` : 'Направления конкурса не совпадают с вашими интересами, но вы можете подать заявку.'}
          </Alert>
        </Stack>
      </Box>

      <ProjectSelectDialog open={dialogOpen} grantId={grant.id} onClose={() => setDialogOpen(false)} />
    </>
  );
}
