import { Box, Chip, Collapse, FormHelperText, Typography } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { DIRECTIONS } from '@/shared/config/directions';

interface InterestsPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

/** Выбор направлений грантов: нажатие на «чип» включает/выключает направление. */
export function InterestsPicker({ value, onChange, error }: InterestsPickerProps) {
  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {DIRECTIONS.map((name) => {
          const selected = value.includes(name);
          return (
            <Chip
              key={name}
              label={name}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              icon={selected ? <DoneIcon /> : undefined}
              onClick={() => toggle(name)}
              sx={{ transition: 'all .2s ease' }}
            />
          );
        })}
      </Box>
      <Collapse in={value.length > 0}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Выбрано направлений: {value.length}
        </Typography>
      </Collapse>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
