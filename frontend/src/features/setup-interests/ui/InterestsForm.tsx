import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { EXPERIENCE_LABELS, EXPERIENCE_LEVELS, ExperienceLevel, InterestsPicker, userApi, useSession } from '@/entities/user';
import { rules, useForm } from '@/shared/lib';
import { FormAlert } from '@/shared/ui';

type Values = { interests: string[]; experience: ExperienceLevel };

interface InterestsFormProps {
  onSaved: () => void;
  onSkip?: () => void;
}

/** Настройка интересов и опыта (экран после регистрации). */
export function InterestsForm({ onSaved, onSkip }: InterestsFormProps) {
  const { user, setUser } = useSession();

  const form = useForm<Values>({
    initialValues: { interests: user?.interests ?? [], experience: user?.experience ?? 'none' },
    schema: { interests: [rules.minItems(1, 'Выберите хотя бы одно направление или пропустите настройку')] },
    onSubmit: async (values) => {
      setUser(await userApi.updateProfile(values));
      onSaved();
    },
  });

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <FormAlert message={form.submitError} />
      <Stack spacing={3}>
        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Интересующие направления
          </Typography>
          <InterestsPicker
            value={form.values.interests}
            onChange={(next) => form.setValue('interests', next)}
            error={form.getError('interests')}
          />
        </Box>
        <FormControl>
          <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Опыт участия в грантовых конкурсах</FormLabel>
          <RadioGroup value={form.values.experience} onChange={(e) => form.setValue('experience', e.target.value as ExperienceLevel)}>
            {EXPERIENCE_LEVELS.map((level) => (
              <FormControlLabel key={level} value={level} control={<Radio />} label={EXPERIENCE_LABELS[level]} />
            ))}
          </RadioGroup>
        </FormControl>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onSkip && (
            <Button type="button" onClick={onSkip} disabled={form.submitting}>
              Пропустить
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={form.submitting}>
            {form.submitting ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
