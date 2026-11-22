import { useState } from 'react';
import { Alert, Box, Button, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { userApi } from '@/entities/user';
import { FormAlert } from '@/shared/ui';
import { rules, useForm } from '@/shared/lib';

type Values = { email: string };

export function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    initialValues: { email: '' },
    schema: { email: [rules.required('Введите email'), rules.email()] },
    onSubmit: async ({ email }) => {
      await userApi.requestPasswordReset(email);
      setSent(true);
    },
  });

  const handleClose = () => {
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Box component="form" noValidate onSubmit={form.handleSubmit}>
        <DialogTitle>Восстановление пароля</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Укажите email — мы отправим ссылку для сброса пароля.</DialogContentText>
          <FormAlert message={form.submitError} />
          <TextField label="Email" type="email" fullWidth autoFocus disabled={sent} {...form.register('email')} />
          <Collapse in={sent}>
            <Alert severity="success" sx={{ mt: 2 }}>
              Если такой адрес зарегистрирован, письмо со ссылкой уже отправлено.
            </Alert>
          </Collapse>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>{sent ? 'Закрыть' : 'Отмена'}</Button>
          {!sent && (
            <Button type="submit" variant="contained" disabled={form.submitting}>
              {form.submitting ? 'Отправляем…' : 'Отправить'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
