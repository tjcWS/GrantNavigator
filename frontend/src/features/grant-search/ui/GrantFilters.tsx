import { Button, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Paper, Select, Stack, Switch, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DIRECTIONS } from '@/shared/config/directions';
import { DEFAULT_FILTERS, GrantFilterState } from '../model/filterGrants';

interface GrantFiltersProps {
  value: GrantFilterState;
  onChange: (value: GrantFilterState) => void;
}

export function GrantFilters({ value, onChange }: GrantFiltersProps) {
  const isDefault = JSON.stringify(value) === JSON.stringify(DEFAULT_FILTERS);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <TextField
          label="Поиск по названию и описанию"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="direction-label">Направление</InputLabel>
          <Select
            labelId="direction-label"
            label="Направление"
            value={value.direction}
            onChange={(e) => onChange({ ...value, direction: e.target.value })}
          >
            <MenuItem value="">Все направления</MenuItem>
            {DIRECTIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          sx={{ whiteSpace: 'nowrap', mr: 0 }}
          control={<Switch checked={value.onlyActive} onChange={(e) => onChange({ ...value, onlyActive: e.target.checked })} />}
          label="Только открытые"
        />
        <Button onClick={() => onChange(DEFAULT_FILTERS)} disabled={isDefault}>
          Сбросить
        </Button>
      </Stack>
    </Paper>
  );
}
