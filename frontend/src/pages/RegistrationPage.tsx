import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Checkbox, FormControlLabel, FormHelperText, Link, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useApp } from '../context/AppContext';

type Mode = 'login' | 'register' | 'restore';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  password: string;
  password2: string;
  consent: boolean;
}

const EMPTY: FormState = { firstName: '', lastName: '', email: '', login: '', password: '', password2: '', consent: false };

// Экран 1: вход, регистрация и восстановление пароля (демо — без настоящей проверки).
export default function RegistrationPage() {
  const navigate = useNavigate();
  const { updateProfile } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [restoreSent, setRestoreSent] = useState(false);

  const set = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: key === 'consent' ? e.target.checked : e.target.value });

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setRestoreSent(false);
  };

  const submitLogin = () => {
    const next: typeof errors = {};
    if (!form.login.trim()) next.login = 'Введите логин или email';
    if (!form.password) next.password = 'Введите пароль';
    setErrors(next);
    if (Object.keys(next).length === 0) navigate('/grants');
  };

  const submitRegister = () => {
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = 'Введите имя';
    if (!form.lastName.trim()) next.lastName = 'Введите фамилию';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Введите корректный email';
    if (!form.login.trim()) next.login = 'Придумайте логин';
    if (form.password.length < 8) next.password = 'Пароль — минимум 8 символов';
    if (form.password2 !== form.password) next.password2 = 'Пароли не совпадают';
    if (!form.consent) next.consent = 'Нужно согласие на обработку данных';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      updateProfile({ firstName: form.firstName, lastName: form.lastName, email: form.email, login: form.login });
      navigate('/interests');
    }
  };

  const submitRestore = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErrors({ email: 'Введите корректный email' });
      return;
    }
    setErrors({});
    setRestoreSent(true);
  };

  const field = (key: keyof FormState, label: string, type = 'text') => (
    <TextField
      label={label}
      type={type}
      value={form[key] as string}
      onChange={set(key)}
      error={Boolean(errors[key])}
      helperText={errors[key]}
    />
  );

  if (mode === 'restore') {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          Восстановление пароля
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Укажите email, и мы отправим ссылку для смены пароля.
        </Typography>
        {restoreSent ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Ссылка отправлена на {form.email} (демо — письмо не уходит).
          </Alert>
        ) : (
          <Stack spacing={2}>
            {field('email', 'Email')}
            <Button variant="contained" size="large" onClick={submitRestore}>
              Отправить ссылку
            </Button>
          </Stack>
        )}
        <Button sx={{ mt: 2 }} onClick={() => switchMode('login')}>
          Вернуться ко входу
        </Button>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Tabs value={mode} onChange={(_, value: Mode) => switchMode(value)} variant="fullWidth" sx={{ mb: 3 }}>
        <Tab label="Вход" value="login" />
        <Tab label="Регистрация" value="register" />
      </Tabs>

      {mode === 'login' ? (
        <Stack spacing={2}>
          {field('login', 'Логин или email')}
          {field('password', 'Пароль', 'password')}
          <Link component="button" type="button" underline="hover" sx={{ alignSelf: 'flex-start' }} onClick={() => switchMode('restore')}>
            Забыли пароль?
          </Link>
          <Button variant="contained" size="large" onClick={submitLogin}>
            Войти
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('firstName', 'Имя')}
            {field('lastName', 'Фамилия')}
          </Stack>
          {field('email', 'Email', 'email')}
          {field('login', 'Логин')}
          {field('password', 'Пароль', 'password')}
          {field('password2', 'Повторите пароль', 'password')}
          <div>
            <FormControlLabel
              control={<Checkbox checked={form.consent} onChange={set('consent')} />}
              label="Согласен(на) на обработку персональных данных"
            />
            {errors.consent && <FormHelperText error>{errors.consent}</FormHelperText>}
          </div>
          <Button variant="contained" size="large" onClick={submitRegister}>
            Зарегистрироваться
          </Button>
        </Stack>
      )}
    </Paper>
  );
}
