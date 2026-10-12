import { useState } from 'react';
import { Alert, Button, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader';
import InterestsFields, { type InterestsValue } from '../components/InterestsFields';
import { useApp } from '../context/AppContext';

// Экран 11: профиль и настройки.
export default function ProfilePage() {
  const { profile, updateProfile } = useApp();
  const [personal, setPersonal] = useState({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, login: profile.login });
  const [interests, setInterests] = useState<InterestsValue>({ directions: profile.directions, activityField: profile.activityField, experience: profile.experience });
  const [passwords, setPasswords] = useState({ current: '', next: '', repeat: '' });
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');

  const savePersonalAndInterests = () => {
    updateProfile({ ...personal, ...interests });
    setMessage('Профиль сохранён');
  };

  const changePassword = () => {
    if (!passwords.current) return setPasswordError('Введите текущий пароль');
    if (passwords.next.length < 8) return setPasswordError('Новый пароль — минимум 8 символов');
    if (passwords.next !== passwords.repeat) return setPasswordError('Пароли не совпадают');
    setPasswordError('');
    setPasswords({ current: '', next: '', repeat: '' });
    setMessage('Пароль изменён (демо)');
  };

  return (
    <>
      <PageHeader title="Профиль и настройки" />
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Личные данные
          </Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Имя" value={personal.firstName} onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })} />
              <TextField label="Фамилия" value={personal.lastName} onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })} />
            </Stack>
            <TextField label="Email" type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
            <TextField label="Логин" value={personal.login} onChange={(e) => setPersonal({ ...personal, login: e.target.value })} />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Интересы и опыт
          </Typography>
          <InterestsFields value={interests} onChange={setInterests} />
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="contained" onClick={savePersonalAndInterests}>
              Сохранить изменения
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Смена пароля
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Текущий пароль не отображается — его можно только заменить.
          </Typography>
          <Stack spacing={2}>
            {passwordError && <Alert severity="error">{passwordError}</Alert>}
            <TextField label="Текущий пароль" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            <TextField label="Новый пароль" type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
            <TextField label="Повторите новый пароль" type="password" value={passwords.repeat} onChange={(e) => setPasswords({ ...passwords, repeat: e.target.value })} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="outlined" onClick={changePassword}>
                Изменить пароль
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
      <Snackbar open={message !== ''} autoHideDuration={2500} onClose={() => setMessage('')} message={message} />
    </>
  );
}
