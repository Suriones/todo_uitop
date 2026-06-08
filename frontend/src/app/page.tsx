'use client';

import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Stack, Divider, Chip,
} from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useCategories } from '@/hooks/useCategories';
import { useTodos } from '@/hooks/useTodos';
import { CreateTodoForm } from '@/components/CreateTodoForm';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TodoList } from '@/components/TodoList';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useBackend } from '@/contexts/BackendContext';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Todo } from '@/types';

export default function HomePage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const { isOnline, status } = useBackend();
  const backendChecked = status !== 'checking';
  const { categories } = useCategories(isOnline, backendChecked);
  const { showSnackbar, hideSnackbar } = useSnackbar();

  const {
    todos, loading, error,
    selectedIds, pendingRemovals,
    handleToggleComplete, handleDelete, handleBulkComplete,
    toggleSelect, toggleSelectAll, addTodo,
  } = useTodos(categoryFilter, isOnline, backendChecked);

  // Maps todo.id → snackbar notification id so we can close the right one on un-complete
  const toastIdRef = React.useRef<Map<string, string>>(new Map());

  const onToggleComplete = async (todo: Todo) => {
    if (!todo.completed) {
      const result = await handleToggleComplete(todo);
      if (result) {
        const toastId = showSnackbar('Task completed — removing in 5s', 'success', result.undo, todo.text);
        toastIdRef.current.set(todo.id, toastId);
      }
    } else {
      // Close the specific notification for this task
      const toastId = toastIdRef.current.get(todo.id);
      hideSnackbar(toastId);
      toastIdRef.current.delete(todo.id);
      await handleToggleComplete(todo);
    }
  };

  const onDelete = async (todo: Todo) => {
    const result = await handleDelete(todo);
    showSnackbar('Task deleted', 'info', result.undo, todo.text);
  };

  const onBulkComplete = async () => {
    const count = Array.from(selectedIds).filter(
      (id) => !todos.find((t) => t.id === id)?.completed
    ).length;
    const result = await handleBulkComplete();
    if (result) showSnackbar(`${count} task(s) completed`, 'success', result.undo);
  };

  const onCreated = (todo: Todo) => {
    addTodo(todo);
    showSnackbar(`"${todo.text}" added`, 'success');
  };

  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>

      <OfflineBanner />

      {/* Top bar */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
        <Container maxWidth="sm">
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <PlaylistAddCheckIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6">Todo Manager</Typography>
            </Stack>
            {todos.length > 0 && (
              <Stack direction="row" sx={{ gap: 1 }}>
                <Chip label={`${todos.length} tasks`} size="small" variant="outlined" />
                {doneCount > 0 && <Chip label={`${doneCount} done`} size="small" color="success" />}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 4 }}>

        {/* Add task card */}
        <Paper
          elevation={0}
          sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
        >
          <CreateTodoForm categories={categories} onCreated={onCreated} isOnline={isOnline} />
        </Paper>

        {/* Task list card */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
        >
          {/* Filter */}
          <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {categoryFilter ? `Filtered tasks` : 'All tasks'}
            </Typography>
            <CategoryFilter
              categories={categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          </Box>

          <Divider />

          <Box sx={{ px: 3, py: 2 }}>
            <TodoList
              todos={todos}
              loading={loading}
              error={error}
              selectedIds={selectedIds}
              pendingRemovals={pendingRemovals}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onBulkComplete={onBulkComplete}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
