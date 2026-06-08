import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { CreateTodoForm } from '@/components/CreateTodoForm';
import { Category } from '@/types';
import * as todosApi from '@/api/todos';

jest.mock('@/api/todos');

const theme = createTheme();

const categories: Category[] = [
  { id: 'cat-1', name: 'Work', created_at: '' },
  { id: 'cat-2', name: 'Personal', created_at: '' },
];

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('CreateTodoForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders text input, category select and submit button', () => {
    renderWithTheme(<CreateTodoForm categories={categories} onCreated={jest.fn()} isOnline={true} />);
    expect(screen.getByPlaceholderText(/what needs to be done/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('shows validation error when submitted with empty text', async () => {
    renderWithTheme(<CreateTodoForm categories={categories} onCreated={jest.fn()} isOnline={true} />);
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => {
      expect(screen.getByText(/enter task text/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when no category selected', async () => {
    renderWithTheme(<CreateTodoForm categories={categories} onCreated={jest.fn()} isOnline={true} />);
    await userEvent.type(screen.getByPlaceholderText(/what needs to be done/i), 'My task');
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => {
      expect(screen.getByText(/choose a category/i)).toBeInTheDocument();
    });
  });

  it('calls onCreated and resets form on successful submit', async () => {
    const newTodo = {
      id: '1', text: 'New task', category_id: 'cat-1',
      category_name: 'Work', completed: false, created_at: '',
    };
    (todosApi.createTodo as jest.Mock).mockResolvedValueOnce(newTodo);
    const onCreated = jest.fn();

    renderWithTheme(<CreateTodoForm categories={categories} onCreated={onCreated} isOnline={true} />);

    await userEvent.type(screen.getByPlaceholderText(/what needs to be done/i), 'New task');

    // Open and select category
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => screen.getByText('Work'));
    fireEvent.click(screen.getByRole('option', { name: /work/i }));

    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(newTodo);
    });
  });

  it('shows API error when category is full (400)', async () => {
    const axiosError = {
      response: { data: { error: 'Category already has 5 tasks.' } },
      isAxiosError: true,
    };
    (todosApi.createTodo as jest.Mock).mockRejectedValueOnce(axiosError);

    renderWithTheme(<CreateTodoForm categories={categories} onCreated={jest.fn()} isOnline={true} />);

    await userEvent.type(screen.getByPlaceholderText(/what needs to be done/i), 'Task');
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => screen.getByText('Work'));
    fireEvent.click(screen.getByRole('option', { name: /work/i }));
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText(/Category already has 5 tasks/i)).toBeInTheDocument();
    });
  });
});
