import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';

export function NotFoundPage() {
  return (
    <Container maxWidth="sm">
      <Stack alignItems="center" spacing={2} sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h2" fontWeight={800} color="primary">
          404
        </Typography>
        <Typography variant="h6">Такой страницы нет</Typography>
        <Button variant="contained" component={RouterLink} to="/grants">
          В каталог конкурсов
        </Button>
      </Stack>
    </Container>
  );
}
