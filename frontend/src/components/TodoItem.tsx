'use client';

import React from 'react';
import { Box, Checkbox, IconButton, Typography, Chip, Tooltip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import { Todo } from '@/types';

const CAT_COLOR: Record<string, { bg: string; text: string }> = {
  Work:     { bg: '#ede9fe', text: '#6d28d9' },
  Personal: { bg: '#fce7f3', text: '#be185d' },
  Shopping: { bg: '#fef3c7', text: '#b45309' },
  Health:   { bg: '#d1fae5', text: '#065f46' },
  Learning: { bg: '#dbeafe', text: '#1d4ed8' },
};

interface Props {
  todo: Todo;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  isPendingRemoval: boolean;
}

export const TodoItem: React.FC<Props> = ({
  todo, selected, onToggleSelect, onToggleComplete, onDelete, isPendingRemoval,
}) => {
  const color = CAT_COLOR[todo.category_name] ?? { bg: '#f3f4f6', text: '#374151' };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        mb: 0.75,
        borderRadius: 2,
        border: '1.5px solid',
        borderColor: todo.completed
          ? 'success.light'
          : selected
          ? 'primary.light'
          : 'divider',
        bgcolor: todo.completed
          ? '#f0fdf4'
          : selected
          ? '#f0f0ff'
          : 'background.paper',
        opacity: isPendingRemoval ? 0.75 : 1,
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: todo.completed ? 'success.main' : 'primary.light' },
      }}
    >
      {/* Row-select checkbox */}
      <Checkbox
        size="small"
        checked={selected}
        onChange={() => onToggleSelect(todo.id)}
        sx={{ p: 0.25, color: 'divider', '&.Mui-checked': { color: 'primary.main' } }}
      />

      {/* Done / Undo button */}
      {todo.completed ? (
        <Tooltip title="Mark as not done">
          <Button
            size="small"
            variant="contained"
            color="success"
            aria-label="Mark as not done"
            onClick={() => onToggleComplete(todo)}
            sx={{
              minWidth: 0,
              width: 28,
              height: 28,
              p: 0,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          >
            <ReplayIcon sx={{ fontSize: 14 }} />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Mark as done">
          <Button
            size="small"
            variant="outlined"
            aria-label="Mark as done"
            onClick={() => onToggleComplete(todo)}
            sx={{
              minWidth: 0,
              width: 28,
              height: 28,
              p: 0,
              borderRadius: '50%',
              flexShrink: 0,
              borderColor: 'divider',
              color: 'text.disabled',
              '&:hover': {
                borderColor: 'success.main',
                color: 'success.main',
                bgcolor: '#f0fdf4',
              },
            }}
          >
            <CheckIcon sx={{ fontSize: 14 }} />
          </Button>
        </Tooltip>
      )}

      {/* Text */}
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontWeight: 500,
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? 'text.disabled' : 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {todo.text}
      </Typography>

      {/* Category chip */}
      <Chip
        label={todo.category_name}
        size="small"
        sx={{
          bgcolor: color.bg,
          color: color.text,
          border: 'none',
          height: 22,
          fontSize: '0.68rem',
          flexShrink: 0,
        }}
      />

      {/* Delete */}
      <Tooltip title="Delete">
        <IconButton
          size="small"
          aria-label="Delete task"
          onClick={() => onDelete(todo)}
          sx={{ color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'error.main' } }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
