import { apiClient } from './client';
import { Todo, CreateTodoPayload } from '@/types';
import {
  localGetTodos,
  localCreateTodo,
  localUpdateTodo,
  localDeleteTodo,
} from '@/lib/localDb';

// isOnline is passed in from BackendContext so each call knows the current mode
export const fetchTodos = async (categoryId?: string, isOnline = true): Promise<Todo[]> => {
  if (!isOnline) return localGetTodos(categoryId);
  const params = categoryId ? { category: categoryId } : {};
  const { data } = await apiClient.get<Todo[]>('/todos', { params });
  return data;
};

export const createTodo = async (payload: CreateTodoPayload, isOnline = true): Promise<Todo> => {
  if (!isOnline) return localCreateTodo(payload);
  const { data } = await apiClient.post<Todo>('/todos', payload);
  return data;
};

export const updateTodo = async (id: string, completed: boolean, isOnline = true): Promise<Todo> => {
  if (!isOnline) return localUpdateTodo(id, completed);
  const { data } = await apiClient.patch<Todo>(`/todos/${id}`, { completed });
  return data;
};

export const deleteTodo = async (id: string, isOnline = true): Promise<void> => {
  if (!isOnline) return localDeleteTodo(id);
  await apiClient.delete(`/todos/${id}`);
};

export const bulkCompleteTodos = async (ids: string[], isOnline = true): Promise<Todo[]> => {
  return Promise.all(ids.map((id) => updateTodo(id, true, isOnline)));
};
