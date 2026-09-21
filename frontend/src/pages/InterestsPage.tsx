import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Paper, Stack, Typography } from '@mui/material';
import InterestsFields, { type InterestsValue } from '../components/InterestsFields';
import { useApp } from '../context/AppContext';

// Экран 2: настройка интересов после регистрации.
export default function InterestsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useApp();
  const [value, setValue] = useState<InterestsValue>({
    directions: profile.directions,
    activityField: profile.activityField,
    experience: profile.experience,
  });

  const save = () => {
    updateProfile(value);
    navigate('/grants');
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
        Что вам интересно?
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        По этим данным мы отметим подходящие конкурсы в каталоге. Изменить выбор можно в профиле.
      </Typography>
      <InterestsFields value={value} onChange={setValue} />
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 4 }}>
        <Button onClick={() => navigate('/grants')}>Пропустить</Button>
        <Button variant="contained" onClick={save}>
          Сохранить
        </Button>
      </Stack>
    </Paper>
  );
}
