import { useState } from 'react';
import { Box, Button, Collapse, Stack, TextField } from '@mui/material';
import { userApi } from '@/entities/user';
import { rules, useForm } from '@/shared/lib';
import { FormAlert, useNotify } from '@/shared/ui';

type Values = { oldPassword: string; newPassword: string; repeat: string };

function PasswordFields({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const notify = useNotify();

  const form = useForm<Values>({
    initialValues: { oldPassword: '', newPassword: '', repeat: '' },
    schema: {
      oldPassword: [rules.required('Введите текущий пароль')],
      newPassword: [
        rules.required('Введите новый пароль'),
        rules.minLength(8, 'Пароль должен быть не короче 8 символов'),
        rules.pattern(/^(?=.*\p{L})(?=.*\d).+$/u, 'Пароль должен содержать букву и цифру'),
      ],
      repeat: [rules.required('Повторите новый пароль'), rules.sameAs<Values>('newPassword', 'Пароли не совпадают')],
    },
    onSubmit: async ({ oldPassword, newPassword }) => {
      await userApi.changePassword(oldPassword, newPassword);
      notify('Пароль изменён');
      onDone();
    },
  });

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit} sx={{ pt: 1 }}>
      <FormAlert message={form.submitError} />
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        <TextField label="Текущий пароль" type="password" autoComplete="current-password" {...form.register('oldPassword')} />
        <TextField label="Новый пароль" type="password" autoComplete="new-password" {...form.register('newPassword')} />
        <TextField label="Повторите новый пароль" type="password" autoComplete="new-password" {...form.register('repeat')} />
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={form.submitting}>
            {form.submitting ? 'Сохраняем…' : 'Сменить пароль'}
          </Button>
          <Button type="button" onClick={onCancel} disabled={form.submitting}>
            Отмена
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/** Пароль не показывается — только возможность его изменить. */
export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0); // меняем key, чтобы форма очищалась при закрытии

  const close = () => {
    setOpen(false);
    setTimeout(() => setVersion((v) => v + 1), 300);
  };

  return (
    <Box>
      <Button variant="outlined" onClick={() => setOpen((v) => !v)}>
        {open ? 'Скрыть' : 'Изменить пароль'}
      </Button>
      <Collapse in={open} unmountOnExit>
        <PasswordFields key={version} onDone={close} onCancel={close} />
      </Collapse>
    </Box>
  );
}
