import { useMemo, useState } from 'react';
import { Box, FormControlLabel, InputAdornment, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageHeader from '../components/PageHeader';
import GrantCard from '../components/GrantCard';
import ProjectSelectDialog from '../components/ProjectSelectDialog';
import { DIRECTIONS } from '../data/constants';
import { mockGrants } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { isRecommended, matchesSearch } from '../utils/grants';

// Экран 3: каталог конкурсов с поиском и фильтрами.
export default function GrantsPage() {
  const { profile } = useApp();
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState('');
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [participateId, setParticipateId] = useState<string | null>(null);

  const grants = useMemo(
    () =>
      mockGrants.filter(
        (g) =>
          matchesSearch(g, query) &&
          (!direction || g.directions.includes(direction)) &&
          (!onlyRecommended || isRecommended(g, profile)),
      ),
    [query, direction, onlyRecommended, profile],
  );

  return (
    <>
      <PageHeader title="Каталог грантовых конкурсов" subtitle="Найдите конкурс, под который у вас уже есть проект, и подготовьте заявку." />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 3 }}>
        <TextField
          placeholder="Поиск по названию, организатору, тегам"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{ input: { startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ) } }}
          sx={{ bgcolor: 'background.paper' }}
        />
        <TextField select label="Направление" value={direction} onChange={(e) => setDirection(e.target.value)} sx={{ minWidth: 240, bgcolor: 'background.paper' }}>
          <MenuItem value="">Все направления</MenuItem>
          {DIRECTIONS.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          sx={{ flexShrink: 0, mx: 0 }}
          control={<Switch checked={onlyRecommended} onChange={(e) => setOnlyRecommended(e.target.checked)} />}
          label="Только рекомендованные"
        />
      </Stack>

      {grants.length === 0 ? (
        <Typography color="text.secondary">Ничего не найдено. Попробуйте изменить запрос или сбросить фильтры.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} recommended={isRecommended(grant, profile)} onParticipate={setParticipateId} />
          ))}
        </Box>
      )}

      <ProjectSelectDialog open={participateId !== null} grantId={participateId} onClose={() => setParticipateId(null)} />
    </>
  );
}
