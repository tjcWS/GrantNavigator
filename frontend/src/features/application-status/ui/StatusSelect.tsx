import { useState } from 'react';
import { Alert, Collapse, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Application, ApplicationStatus, STATUS_LABELS, STATUS_ORDER, applicationApi } from '@/entities/application';
import { getErrorMessage } from '@/shared/lib';
import { useNotify } from '@/shared/ui';

interface StatusSelectProps {
  application: Application;
  onChanged: (application: Application) => void;
}

/** Ручная смена статуса заявки. Правила (например, заполненность разделов) проверяет «сервер». */
export function StatusSelect({ application, onChanged }: StatusSelectProps) {
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (status: ApplicationStatus) => {
    setLoading(true);
    setError(null);
    try {
      onChanged(await applicationApi.setStatus(application.id, status));
      notify(`Статус изменён: «${STATUS_LABELS[status]}»`);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormControl fullWidth size="small" disabled={loading}>
        <InputLabel id="status-label">Статус заявки</InputLabel>
        <Select
          labelId="status-label"
          label="Статус заявки"
          value={application.status}
          onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
        >
          {STATUS_ORDER.map((s) => (
            <MenuItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Collapse in={Boolean(error)}>
        <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>
    </>
  );
}
