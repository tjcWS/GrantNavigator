import { Box, Button, Stack, TextField } from '@mui/material';
import { ProjectInput } from '@/entities/project';
import { counter, rules, useForm } from '@/shared/lib';
import { FormAlert } from '@/shared/ui';

type Values = ProjectInput;

const EMPTY: Values = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  goals: '',
  tasks: '',
  targetAudience: '',
  expectedResults: '',
};

interface ProjectFormProps {
  initialValues?: ProjectInput;
  submitLabel: string;
  onSubmit: (values: ProjectInput) => Promise<void>;
  onCancel: () => void;
}

/** Форма создания и редактирования проекта. */
export function ProjectForm({ initialValues = EMPTY, submitLabel, onSubmit, onCancel }: ProjectFormProps) {
  const form = useForm<Values>({
    initialValues,
    schema: {
      title: [rules.required('Введите название проекта'), rules.minLength(3), rules.maxLength(200)],
      shortDescription: [rules.required('Добавьте краткое описание'), rules.minLength(10), rules.maxLength(300)],
      fullDescription: [rules.maxLength(3000)],
      goals: [rules.required('Опишите цели проекта'), rules.minLength(10), rules.maxLength(1500)],
      tasks: [rules.maxLength(1500)],
      targetAudience: [rules.maxLength(800)],
      expectedResults: [rules.maxLength(1500)],
    },
    onSubmit,
  });

  const area = (name: keyof Values & string, label: string, max: number, rows = 3) => (
    <TextField
      label={label}
      fullWidth
      multiline
      minRows={rows}
      {...form.register(name)}
      helperText={form.getError(name) ?? counter(form.values[name], max)}
    />
  );

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <FormAlert message={form.submitError} />
      <Stack spacing={2.5}>
        <TextField label="Название проекта" fullWidth required {...form.register('title')} />
        {area('shortDescription', 'Краткое описание *', 300, 2)}
        {area('fullDescription', 'Полное описание', 3000, 5)}
        {area('goals', 'Цели *', 1500)}
        {area('tasks', 'Задачи', 1500)}
        {area('targetAudience', 'Целевая аудитория', 800, 2)}
        {area('expectedResults', 'Ожидаемые результаты', 1500)}
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={form.submitting}>
            {form.submitting ? 'Сохраняем…' : submitLabel}
          </Button>
          <Button type="button" onClick={onCancel} disabled={form.submitting}>
            Отмена
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
