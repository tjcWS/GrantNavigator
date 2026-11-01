import { useState } from 'react';
import { Box, Button, Link, Stack, TextField } from '@mui/material';
import { User, userApi, useSession } from '@/entities/user';
import { rules, useForm } from '@/shared/lib';
import { FormAlert } from '@/shared/ui';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';

type Values = { login: string; password: string };

export function LoginForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const { setUser } = useSession();
  const [forgotOpen, setForgotOpen] = useState(false);

  const form = useForm<Values>({
    initialValues: { login: '', password: '' },
    schema: {
      login: [rules.required('Введите логин или email')],
      password: [rules.required('Введите пароль')],
    },
    onSubmit: async ({ login, password }) => {
      const user = await userApi.login(login, password);
      setUser(user);
      onSuccess(user);
    },
  });

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <FormAlert message={form.submitError} />
      <Stack spacing={2}>
        <TextField label="Логин или email" fullWidth autoComplete="username" {...form.register('login')} />
        <TextField label="Пароль" type="password" fullWidth autoComplete="current-password" {...form.register('password')} />
        <Button type="submit" variant="contained" size="large" disabled={form.submitting}>
          {form.submitting ? 'Входим…' : 'Войти'}
        </Button>
        <Link component="button" type="button" variant="body2" onClick={() => setForgotOpen(true)} sx={{ alignSelf: 'center' }}>
          Забыли пароль?
        </Link>
      </Stack>
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  );
}
