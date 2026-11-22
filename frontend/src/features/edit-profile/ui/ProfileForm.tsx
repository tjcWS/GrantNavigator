import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { EXPERIENCE_LABELS, EXPERIENCE_LEVELS, ExperienceLevel, InterestsPicker, userApi, useSession } from '@/entities/user';
import { rules, useForm } from '@/shared/lib';
import { FormAlert, useNotify } from '@/shared/ui';

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  interests: string[];
  experience: ExperienceLevel;
};

export function ProfileForm() {
  const { user, setUser } = useSession();
  const notify = useNotify();

  const form = useForm<Values>({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      login: user?.login ?? '',
      interests: user?.interests ?? [],
      experience: user?.experience ?? 'none',
    },
    schema: {
      firstName: [rules.required('Введите имя'), rules.minLength(2), rules.maxLength(100)],
      lastName: [rules.required('Введите фамилию'), rules.minLength(2), rules.maxLength(100)],
      email: [rules.required('Введите email'), rules.email()],
      login: [
        rules.required('Введите логин'),
        rules.pattern(/^[A-Za-z0-9_.-]{3,30}$/, 'От 3 до 30 символов: латиница, цифры, «_», «.», «-»'),
      ],
    },
    onSubmit: async (values) => {
      setUser(await userApi.updateProfile(values));
      notify('Профиль сохранён');
    },
  });

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <FormAlert message={form.submitError} />
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Имя" fullWidth {...form.register('firstName')} />
          <TextField label="Фамилия" fullWidth {...form.register('lastName')} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Email" type="email" fullWidth {...form.register('email')} />
          <TextField label="Логин" fullWidth {...form.register('login')} />
        </Stack>
        <Box>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Интересующие направления
          </Typography>
          <InterestsPicker value={form.values.interests} onChange={(next) => form.setValue('interests', next)} />
        </Box>
        <FormControl>
          <FormLabel sx={{ fontWeight: 600, color: 'text.primary' }}>Опыт участия</FormLabel>
          <RadioGroup value={form.values.experience} onChange={(e) => form.setValue('experience', e.target.value as ExperienceLevel)}>
            {EXPERIENCE_LEVELS.map((level) => (
              <FormControlLabel key={level} value={level} control={<Radio />} label={EXPERIENCE_LABELS[level]} />
            ))}
          </RadioGroup>
        </FormControl>
        <Box>
          <Button type="submit" variant="contained" disabled={form.submitting || !form.isDirty}>
            {form.submitting ? 'Сохраняем…' : 'Сохранить изменения'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
