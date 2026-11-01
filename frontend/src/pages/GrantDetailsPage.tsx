import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DeadlineChip, grantApi } from '@/entities/grant';
import { SelectProjectDialog } from '@/features/participate';
import { formatMoney, isExpired, useAsync } from '@/shared/lib';
import { AsyncBoundary, LoadingBlock } from '@/shared/ui';

export function GrantDetailsPage() {
  const id = Number(useParams().id);
  const grant = useAsync(() => (Number.isFinite(id) ? grantApi.getById(id) : Promise.reject(new Error('Некорректный адрес конкурса'))), [id]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const data = grant.data;
  const expired = data ? isExpired(data.deadline) : false;

  return (
    <>
      <Button component={RouterLink} to="/grants" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Назад в каталог
      </Button>

      <AsyncBoundary loading={grant.initialLoading} error={grant.initialError} onRetry={grant.reload} skeleton={<LoadingBlock label="Загружаем конкурс…" />}>
        {data && (
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight={800}>
                    {data.title}
                  </Typography>
                  <Typography color="text.secondary">Организатор: {data.organizer}</Typography>
                </Box>
                <Box>
                  <Tooltip title={expired ? 'Приём заявок завершён' : ''}>
                    <span>
                      <Button variant="contained" size="large" disabled={expired} onClick={() => setDialogOpen(true)}>
                        Участвовать
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                <DeadlineChip deadline={data.deadline} />
                <Chip size="small" label={`Финансирование: до ${formatMoney(data.fundingAmount)}`} />
                {data.directions.map((d) => (
                  <Chip key={d} size="small" variant="outlined" label={d} />
                ))}
              </Stack>

              <Typography paragraph>{data.description}</Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Требования к участникам
              </Typography>
              <Typography paragraph>{data.requirements}</Typography>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Критерии оценки
              </Typography>
              <List dense disablePadding sx={{ mb: 2 }}>
                {data.criteria.map((c) => (
                  <ListItem key={c} disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleOutlineIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={c} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Что нужно описать в заявке
              </Typography>
              <List dense disablePadding>
                {data.sections.map((s) => (
                  <ListItem key={s.key} disableGutters>
                    <ListItemText primary={`${s.title}${s.required ? '' : ' (по желанию)'}`} secondary={s.hint} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </AsyncBoundary>

      <SelectProjectDialog grant={dialogOpen ? (data ?? null) : null} onClose={() => setDialogOpen(false)} />
    </>
  );
}
