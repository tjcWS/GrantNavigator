import { Box, Button, Checkbox, FormControlLabel, FormHelperText, Stack, TextField } from '@mui/material';
import { User, userApi, useSession } from '@/entities/user';
import { rules, useForm } from '@/shared/lib';
import { FormAlert } from '@/shared/ui';

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  password: string;
  passwordRepeat: string;
  consent: boolean;
};

export function RegisterForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const { setUser } = useSession();

  const form = useForm<Values>({
    initialValues: { firstName: '', lastName: '', email: '', login: '', password: '', passwordRepeat: '', consent: false },
    schema: {
      firstName: [rules.required('Введите имя'), rules.minLength(2), rules.maxLength(100)],
      lastName: [rules.required('Введите фамилию'), rules.minLength(2), rules.maxLength(100)],
      email: [rules.required('Введите email'), rules.email()],
      login: [
        rules.required('Придумайте логин'),
        rules.pattern(/^[A-Za-z0-9_.-]{3,30}$/, 'От 3 до 30 символов: латиница, цифры, «_», «.», «-»'),
      ],
      password: [
        rules.required('Придумайте пароль'),
        rules.minLength(8, 'Пароль должен быть не короче 8 символов'),
        rules.pattern(/^(?=.*\p{L})(?=.*\d).+$/u, 'Пароль должен содержать букву и цифру'),
      ],
      passwordRepeat: [rules.required('Повторите пароль'), rules.sameAs<Values>('password', 'Пароли не совпадают')],
      consent: [rules.mustBeTrue('Необходимо согласие на обработку персональных данных')],
    },
    onSubmit: async ({ firstName, lastName, email, login, password }) => {
      const user = await userApi.register({ firstName, lastName, email, login, password });
      setUser(user);
      onSuccess(user);
    },
  });

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <FormAlert message={form.submitError} />
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Имя" fullWidth autoComplete="given-name" {...form.register('firstName')} />
          <TextField label="Фамилия" fullWidth autoComplete="family-name" {...form.register('lastName')} />
        </Stack>
        <TextField label="Email" type="email" fullWidth autoComplete="email" {...form.register('email')} />
        <TextField label="Логин" fullWidth autoComplete="username" {...form.register('login')} />
        <TextField label="Пароль" type="password" fullWidth autoComplete="new-password" {...form.register('password')} />
        <TextField label="Повторите пароль" type="password" fullWidth autoComplete="new-password" {...form.register('passwordRepeat')} />
        <Box>
          <FormControlLabel
            control={<Checkbox checked={form.values.consent} onChange={(e) => form.setValue('consent', e.target.checked)} />}
            label="Согласен(на) на обработку персональных данных"
          />
          {form.getError('consent') && <FormHelperText error>{form.getError('consent')}</FormHelperText>}
        </Box>
        <Button type="submit" variant="contained" size="large" disabled={form.submitting}>
          {form.submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>
      </Stack>
    </Box>
  );
}
