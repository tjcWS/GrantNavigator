import { useState } from 'react';
import { Button } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { projectApi } from '@/entities/project';
import { getErrorMessage } from '@/shared/lib';
import { ConfirmDialog, useNotify } from '@/shared/ui';

interface DeleteProjectButtonProps {
  projectId: number;
  projectTitle: string;
  applicationsCount: number;
  onDeleted: () => void;
}

export function DeleteProjectButton({ projectId, projectTitle, applicationsCount, onDeleted }: DeleteProjectButtonProps) {
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await projectApi.remove(projectId);
      notify('Проект удалён');
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
        title="Удалить проект?"
        text={`Проект «${projectTitle}» будет удалён${applicationsCount ? ` вместе с заявками (${applicationsCount})` : ''}. Это действие нельзя отменить.`}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
