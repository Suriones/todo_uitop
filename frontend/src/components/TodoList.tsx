'use client';

import React from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Checkbox, Divider, Stack,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Todo } from '@/types';
import { TodoItem } from './TodoItem';

interface Props {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  pendingRemovals: Map<string, unknown>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onBulkComplete: () => void;
}

export const TodoList: React.FC<Props> = ({
  todos, loading, error, selectedIds, pendingRemovals,
  onToggleSelect, onToggleSelectAll, onToggleComplete, onDelete, onBulkComplete,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">Loading tasks…</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2, mt: 1 }}>{error}</Alert>;
  }

  if (todos.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1 }}>
        <AssignmentTurnedInIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.4 }} />
        <Typography variant="subtitle1" color="text.secondary">No tasks</Typography>
        <Typography variant="body2" color="text.disabled">Add your first task above</Typography>
      </Box>
    );
  }

  const allSelected = todos.length > 0 && selectedIds.size === todos.length;
  const indeterminate = selectedIds.size > 0 && selectedIds.size < todos.length;
  const hasUncompletedSelected = Array.from(selectedIds).some(
    (id) => !todos.find((t) => t.id === id)?.completed
  );

  return (
    <Box>
      {/* Bulk bar */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={indeterminate}
            onChange={onToggleSelectAll}
            sx={{ p: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </Typography>
        </Stack>

        {selectedIds.size > 0 && hasUncompletedSelected && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<DoneAllIcon />}
            onClick={onBulkComplete}
            sx={{ borderRadius: 2, fontSize: '0.75rem' }}
          >
            Complete selected
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Box>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            selected={selectedIds.has(todo.id)}
            onToggleSelect={onToggleSelect}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            isPendingRemoval={pendingRemovals.has(todo.id)}
          />
        ))}
      </Box>
    </Box>
  );
};
