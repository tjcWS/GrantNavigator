import { useState } from 'react';
import { Box, Button, FormControlLabel, Switch, Typography } from '@mui/material';
import { isFailureForced, resetDb, setFailureForced } from '@/shared/api';

/** Служебные переключатели для проверки лабораторной (в реальном приложении будут удалены). */
export function DemoControls() {
  const [failure, setFailure] = useState(isFailureForced());

  const toggleFailure = (value: boolean) => {
    setFailureForced(value);
    setFailure(value);
  };

  const reset = () => {
    resetDb();
    setFailureForced(false);
    window.location.assign('/registration');
  };

  return (
    <Box sx={{ mt: 6, pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        Демо-режим:
      </Typography>
      <FormControlLabel
        control={<Switch size="small" checked={failure} onChange={(e) => toggleFailure(e.target.checked)} />}
        label={<Typography variant="caption">Имитировать сбой сервера</Typography>}
      />
      <Button size="small" onClick={reset}>
        Сбросить демо-данные
      </Button>
    </Box>
  );
}
