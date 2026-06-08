'use client';

import React, { useState } from 'react';
import {
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, Stack, Typography, Box, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { AxiosError } from 'axios';
import { Category, Todo, CreateTodoPayload, ApiError } from '@/types';
import { createTodo } from '@/api/todos';

interface FormValues {
  text: string;
  category_id: string;
}

const CAT_COLOR: Record<string, string> = {
  Work: '#6d28d9', Personal: '#be185d', Shopping: '#b45309',
  Health: '#065f46', Learning: '#1d4ed8',
};

interface Props {
  categories: Category[];
  onCreated: (todo: Todo) => void;
  isOnline: boolean;
}

export const CreateTodoForm: React.FC<Props> = ({ categories, onCreated, isOnline }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { text: '', category_id: '' } });

  const selectedCatId = watch('category_id');
  const selectedCat = categories.find((c) => c.id === selectedCatId);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const payload: CreateTodoPayload = { text: values.text.trim(), category_id: values.category_id };
      const todo = await createTodo(payload, isOnline);
      onCreated(todo);
      reset();
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      setSubmitError(e.response?.data?.error ?? 'Failed to create task.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          p: 2.5,
        }}
      >
        {/* Header */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.3 }}>
            NEW TASK
          </Typography>
          {selectedCat && (
            <Chip
              label={selectedCat.name}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: `${CAT_COLOR[selectedCat.name] ?? '#6b7280'}14`,
                color: CAT_COLOR[selectedCat.name] ?? '#6b7280',
                border: `1px solid ${CAT_COLOR[selectedCat.name] ?? '#6b7280'}30`,
              }}
            />
          )}
        </Stack>

        <Stack spacing={2}>
          {/* Text input */}
          <TextField
            placeholder="What needs to be done?"
            size="small"
            fullWidth
            error={!!errors.text}
            helperText={errors.text?.message}
            {...register('text', { required: 'Enter task text' })}
            slotProps={{ htmlInput: { autoComplete: 'off' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f9fafb',
                '& fieldset': { borderColor: '#e5e7eb' },
                '&:hover fieldset': { borderColor: '#d1d5db' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
              },
            }}
          />

          {/* Category + button */}
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Controller
              name="category_id"
              control={control}
              rules={{ required: 'Choose a category' }}
              render={({ field }) => (
                <FormControl
                  size="small"
                  error={!!errors.category_id}
                  sx={{ flex: '1 1 140px', minWidth: 140 }}
                >
                  <InputLabel sx={{ color: 'text.disabled' }}>Category</InputLabel>
                  <Select
                    {...field}
                    label="Category"
                    sx={{
                      bgcolor: '#f9fafb',
                      '& fieldset': { borderColor: '#e5e7eb' },
                      '&:hover fieldset': { borderColor: '#d1d5db' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
                    }}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            bgcolor: CAT_COLOR[c.name] ?? '#9ca3af',
                          }} />
                          {c.name}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category_id && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.25, ml: 1.5 }}>
                      {errors.category_id.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              sx={{ height: 40, flex: '0 0 auto', px: 2.5, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
            >
              {isSubmitting ? 'Adding…' : 'Add task'}
            </Button>
          </Stack>
        </Stack>

        {submitError && (
          <Alert severity="error" onClose={() => setSubmitError(null)} sx={{ mt: 2, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}
      </Box>
    </form>
  );
};
