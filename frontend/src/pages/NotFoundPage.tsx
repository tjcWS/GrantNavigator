import { Link as RouterLink } from 'react-router-dom';
import { Button, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Страница не найдена
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Проверьте адрес или вернитесь в каталог конкурсов.
      </Typography>
      <Button component={RouterLink} to="/grants" variant="contained">
        В каталог
      </Button>
    </>
  );
}
