import { Box, Chip, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { ExperienceLevel } from '../types';
import { ACTIVITY_FIELDS, DIRECTIONS, EXPERIENCE_LABELS } from '../data/constants';

export interface InterestsValue {
  directions: string[];
  activityField: string;
  experience: ExperienceLevel;
}

interface Props {
  value: InterestsValue;
  onChange: (value: InterestsValue) => void;
}


export default function InterestsFields({ value, onChange }: Props) {
  const toggleDirection = (direction: string) => {
    const directions = value.directions.includes(direction)
      ? value.directions.filter((d) => d !== direction)
      : [...value.directions, direction];
    onChange({ ...value, directions });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Интересующие направления грантов
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {DIRECTIONS.map((direction) => {
            const selected = value.directions.includes(direction);
            return (
              <Chip
                key={direction}
                label={direction}
                clickable
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => toggleDirection(direction)}
              />
            );
          })}
        </Stack>
      </Box>

      <TextField select label="Сфера деятельности" value={value.activityField} onChange={(e) => onChange({ ...value, activityField: e.target.value })}>
        {ACTIVITY_FIELDS.map((field) => (
          <MenuItem key={field} value={field}>
            {field}
          </MenuItem>
        ))}
      </TextField>

      <Box>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Опыт участия в грантовых конкурсах
        </Typography>
        <ToggleButtonGroup
          exclusive
          color="primary"
          value={value.experience}
          onChange={(_, next: ExperienceLevel | null) => next && onChange({ ...value, experience: next })}
          sx={{ flexWrap: 'wrap' }}
        >
          {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((level) => (
            <ToggleButton key={level} value={level} sx={{ textTransform: 'none' }}>
              {EXPERIENCE_LABELS[level]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  );
}
