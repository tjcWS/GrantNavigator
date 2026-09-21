import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import DeadlineInfo from '../components/DeadlineInfo';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockGrants } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/dates';
import type { Application } from '../types';

// Экран 8: все заявки пользователя со статусами и дедлайнами.
export default function ApplicationsPage() {
  const { applications, projects, deleteApplication } = useApp();
  const [toDelete, setToDelete] = useState<Application | null>(null);
  const sorted = [...applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHeader title="Мои заявки" subtitle="Следите за сроками подачи и статусом каждой заявки." />

      {sorted.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ mb: 2 }}>Заявок пока нет. Найдите подходящий конкурс и нажмите «Участвовать».</Typography>
          <Button component={RouterLink} to="/grants" variant="contained">
            Открыть каталог
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Заявка</TableCell>
                <TableCell>Конкурс</TableCell>
                <TableCell>Проект</TableCell>
                <TableCell>Дедлайн</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Проверка</TableCell>
                <TableCell>Изменена</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((a) => {
                const grant = mockGrants.find((g) => g.id === a.grantId);
                const project = projects.find((p) => p.id === a.projectId);
                return (
                  <TableRow key={a.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{a.title}</TableCell>
                    <TableCell>{grant?.title}</TableCell>
                    <TableCell>{project?.title}</TableCell>
                    <TableCell>{grant && <DeadlineInfo deadline={grant.deadline} />}</TableCell>
                    <TableCell>
                      <StatusChip status={a.status} />
                    </TableCell>
                    <TableCell>
                      {a.check ? <Chip size="small" color={a.check.score >= 80 ? 'success' : 'warning'} label={`Проверена: ${a.check.score}%`} /> : <Chip size="small" variant="outlined" label="Не проверялась" />}
                    </TableCell>
                    <TableCell>{formatDate(a.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                        <Button component={RouterLink} to={`/applications/${a.id}`} size="small" variant="outlined">
                          Открыть
                        </Button>
                        <Button component={RouterLink} to={`/grants/${a.grantId}`} size="small">
                          Конкурс
                        </Button>
                        <IconButton aria-label="Удалить заявку" color="error" size="small" onClick={() => setToDelete(a)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить заявку?"
        text={`Заявка «${toDelete?.title ?? ''}» будет удалена. Проект останется.`}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteApplication(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}
