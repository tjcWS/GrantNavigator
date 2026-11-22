import { useEffect } from 'react';
import { Alert, Box, Button, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import { Application, getCompletion } from '@/entities/application';
import { Grant } from '@/entities/grant';
import { counter, rules, Schema, useForm } from '@/shared/lib';
import { FormAlert, Reveal } from '@/shared/ui';

/** Значения формы: title + по одному ключу на каждый раздел конкурса. */
type Values = Record<string, string>;

interface ApplicationFormProps {
  application: Application;
  grant: Grant;
  onSave: (input: { title: string; answers: Record<string, string> }) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
}

export function ApplicationForm({ application, grant, onSave, onDirtyChange }: ApplicationFormProps) {
  const initialValues: Values = { title: application.title };
  for (const section of grant.sections) initialValues[section.key] = application.answers[section.key] ?? '';

  // Черновик можно сохранять неполным, поэтому обязательность разделов не блокирует «Сохранить»,
  // но блокируют превышение объёма и слишком короткий (но непустой) текст.
  const schema: Schema<Values> = { title: [rules.required('Введите название заявки'), rules.minLength(3), rules.maxLength(200)] };
  for (const section of grant.sections) {
    schema[section.key] = [
      ...(section.minLength ? [rules.minLength(section.minLength)] : []),
      rules.maxLength(section.maxLength),
    ];
  }

  const form = useForm<Values>({
    initialValues,
    schema,
    onSubmit: async (values) => {
      const { title, ...answers } = values;
      await onSave({ title, answers });
    },
  });

  useEffect(() => {
    onDirtyChange?.(form.isDirty);
  }, [form.isDirty, onDirtyChange]);

  const { title: _title, ...currentAnswers } = form.values;
  const completion = getCompletion(grant.sections, currentAnswers);

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <FormAlert message={form.submitError} />

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="body2" fontWeight={600}>
            Заполнено обязательных разделов: {completion.filled} из {completion.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completion.percent}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={completion.percent}
          color={completion.percent === 100 ? 'success' : 'primary'}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Stack spacing={3}>
        <TextField label="Название заявки" fullWidth {...form.register('title')} />
        {grant.sections.map((section, index) => (
          <Reveal key={section.key} index={index}>
            <TextField
              label={`${section.title}${section.required ? ' *' : ''}`}
              fullWidth
              multiline
              minRows={4}
              placeholder={section.hint}
              {...form.register(section.key)}
              helperText={form.getError(section.key) ?? `${section.hint} · ${counter(form.values[section.key], section.maxLength)}`}
            />
          </Reveal>
        ))}
        {form.isDirty && <Alert severity="info">Есть несохранённые изменения.</Alert>}
        <Box>
          <Button type="submit" variant="contained" size="large" disabled={form.submitting || !form.isDirty}>
            {form.submitting ? 'Сохраняем…' : 'Сохранить заявку'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
