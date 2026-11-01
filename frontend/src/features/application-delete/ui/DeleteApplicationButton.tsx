import { useState } from 'react';
import { Button } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { applicationApi } from '@/entities/application';
import { getErrorMessage } from '@/shared/lib';
import { ConfirmDialog, useNotify } from '@/shared/ui';

interface DeleteApplicationButtonProps {
  applicationId: number;
  title: string;
  onDeleted: () => void;
}

export function DeleteApplicationButton({ applicationId, title, onDeleted }: DeleteApplicationButtonProps) {
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await applicationApi.remove(applicationId);
      notify('Заявка удалена');
      setOpen(false);
      onDeleted();
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setOpen(true)}>
        Удалить
      </Button>
      <ConfirmDialog
        open={open}
        loading={loading}
        title="Удалить заявку?"
        text={`Заявка «${title}» будет удалена вместе с результатами проверки. Проект останется.`}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
