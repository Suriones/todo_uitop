import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { TodoItem } from '@/components/TodoItem';
import { Todo } from '@/types';

const theme = createTheme();

const mockTodo: Todo = {
  id: '1',
  text: 'Test task',
  category_id: 'cat-1',
  category_name: 'Work',
  completed: false,
  created_at: new Date().toISOString(),
};

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('TodoItem', () => {
  it('renders todo text and category chip', () => {
    renderWithTheme(
      <TodoItem
        todo={mockTodo}
        selected={false}
        onToggleSelect={jest.fn()}
        onToggleComplete={jest.fn()}
        onDelete={jest.fn()}
        isPendingRemoval={false}
      />
    );
    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls onToggleComplete when the done button is clicked', () => {
    const onToggleComplete = jest.fn();
    renderWithTheme(
      <TodoItem
        todo={mockTodo}
        selected={false}
        onToggleSelect={jest.fn()}
        onToggleComplete={onToggleComplete}
        onDelete={jest.fn()}
        isPendingRemoval={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /mark as done/i }));
    expect(onToggleComplete).toHaveBeenCalledWith(mockTodo);
  });

  it('shows undo button (replay icon) when task is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    renderWithTheme(
      <TodoItem
        todo={completedTodo}
        selected={false}
        onToggleSelect={jest.fn()}
        onToggleComplete={jest.fn()}
        onDelete={jest.fn()}
        isPendingRemoval={false}
      />
    );
    expect(screen.getByTestId('ReplayIcon')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    renderWithTheme(
      <TodoItem
        todo={mockTodo}
        selected={false}
        onToggleSelect={jest.fn()}
        onToggleComplete={jest.fn()}
        onDelete={onDelete}
        isPendingRemoval={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /delete task/i }));
    expect(onDelete).toHaveBeenCalledWith(mockTodo);
  });

  it('applies line-through style when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    renderWithTheme(
      <TodoItem
        todo={completedTodo}
        selected={false}
        onToggleSelect={jest.fn()}
        onToggleComplete={jest.fn()}
        onDelete={jest.fn()}
        isPendingRemoval={false}
      />
    );
    expect(screen.getByText('Test task')).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('calls onToggleSelect when selection checkbox is clicked', () => {
    const onToggleSelect = jest.fn();
    renderWithTheme(
      <TodoItem
        todo={mockTodo}
        selected={false}
        onToggleSelect={onToggleSelect}
        onToggleComplete={jest.fn()}
        onDelete={jest.fn()}
        isPendingRemoval={false}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith(mockTodo.id);
  });
});
