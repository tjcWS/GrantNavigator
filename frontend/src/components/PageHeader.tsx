import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}


export default function PageHeader({ title, subtitle, backTo, backLabel = 'Назад', actions }: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      {backTo && (
        <Button component={RouterLink} to={backTo} startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 1, ml: -1 }}>
          {backLabel}
        </Button>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Stack direction="row" spacing={1} flexShrink={0}>{actions}</Stack>}
      </Stack>
    </Box>
  );
}
