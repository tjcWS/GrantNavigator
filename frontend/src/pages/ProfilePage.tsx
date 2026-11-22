import { Card, CardContent, Stack, Typography } from '@mui/material';
import { ChangePasswordForm, ProfileForm } from '@/features/edit-profile';
import { PageHeader, Reveal } from '@/shared/ui';

export function ProfilePage() {
  return (
    <>
      <PageHeader title="Профиль" subtitle="Личные данные и интересы" />
      <Stack spacing={3} sx={{ maxWidth: 820 }}>
        <Reveal index={0}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <ProfileForm />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal index={1}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Пароль
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Пароль не отображается — его можно только изменить.
              </Typography>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </Reveal>
      </Stack>
    </>
  );
}
