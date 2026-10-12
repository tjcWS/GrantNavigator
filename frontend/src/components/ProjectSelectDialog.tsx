import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useApp } from '../context/AppContext';

interface Props {
  open: boolean;
  grantId: string | null;
  onClose: () => void;
}


export default function ProjectSelectDialog({ open, grantId, onClose }: Props) {
  const navigate = useNavigate();
  const { projects, createApplication } = useApp();
  const [selected, setSelected] = useState('');

  const handleClose = () => {
    setSelected('');
    onClose();
  };

  const handleContinue = () => {
    if (!grantId || !selected) return;
    const application = createApplication(grantId, selected);
    setSelected('');
    onClose();
    navigate(`/applications/${application.id}`);
  };

  const handleCreateProject = () => {
    setSelected('');
    onClose();
    navigate('/projects/new');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Участвовать в конкурсе</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Выберите проект:
        </Typography>
        {projects.length === 0 ? (
          <Typography>У вас пока нет проектов. Создайте первый, чтобы подать заявку.</Typography>
        ) : (
          <RadioGroup value={selected} onChange={(e) => setSelected(e.target.value)}>
            {projects.map((project) => (
              <FormControlLabel key={project.id} value={project.id} control={<Radio />} label={project.title} />
            ))}
          </RadioGroup>
        )}
        <Button onClick={handleCreateProject} sx={{ mt: 1 }}>
          Создать новый проект
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button variant="contained" disabled={!selected} onClick={handleContinue}>
          Продолжить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
