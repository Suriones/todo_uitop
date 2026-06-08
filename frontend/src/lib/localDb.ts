/**
 * localStorage-based data store — used when the backend is unavailable.
 * Mirrors the backend API shape exactly.
 */

import { Todo, Category, CreateTodoPayload } from '@/types';

const MAX_PER_CATEGORY = 5;

const STORAGE_KEY = 'todo_app_data';

interface Store {
  categories: Category[];
  todos: Todo[];
}

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-work',     name: 'Work',     created_at: new Date().toISOString() },
  { id: 'cat-personal', name: 'Personal', created_at: new Date().toISOString() },
  { id: 'cat-shopping', name: 'Shopping', created_at: new Date().toISOString() },
  { id: 'cat-health',   name: 'Health',   created_at: new Date().toISOString() },
  { id: 'cat-learning', name: 'Learning', created_at: new Date().toISOString() },
];

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // corrupted storage — reset
  }
  return { categories: SEED_CATEGORIES, todos: [] };
}

function save(store: Store): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function uuid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Categories ────────────────────────────────────────────────────────────────

export function localGetCategories(): Category[] {
  return load().categories;
}

// ── Todos ─────────────────────────────────────────────────────────────────────

export function localGetTodos(categoryId?: string): Todo[] {
  const { todos, categories } = load();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const enriched = todos.map((t) => ({ ...t, category_name: catMap[t.category_id] ?? '' }));
  if (categoryId) return enriched.filter((t) => t.category_id === categoryId);
  return enriched;
}

export function localCreateTodo(payload: CreateTodoPayload): Todo {
  const store = load();
  const category = store.categories.find((c) => c.id === payload.category_id);
  if (!category) throw { response: { data: { error: 'Category not found' } } };

  const count = store.todos.filter((t) => t.category_id === payload.category_id).length;
  if (count >= MAX_PER_CATEGORY) {
    throw { response: { data: { error: `Category already has ${MAX_PER_CATEGORY} tasks. Please complete or delete some tasks first.` } } };
  }

  const todo: Todo = {
    id: uuid(),
    text: payload.text,
    category_id: payload.category_id,
    category_name: category.name,
    completed: false,
    created_at: new Date().toISOString(),
  };

  store.todos.unshift(todo);
  save(store);
  return todo;
}

export function localUpdateTodo(id: string, completed: boolean): Todo {
  const store = load();
  const idx = store.todos.findIndex((t) => t.id === id);
  if (idx === -1) throw { response: { data: { error: 'Todo not found' } } };

  store.todos[idx] = { ...store.todos[idx], completed };
  save(store);

  const catName = store.categories.find((c) => c.id === store.todos[idx].category_id)?.name ?? '';
  return { ...store.todos[idx], category_name: catName };
}

export function localDeleteTodo(id: string): void {
  const store = load();
  const exists = store.todos.some((t) => t.id === id);
  if (!exists) throw { response: { data: { error: 'Todo not found' } } };
  store.todos = store.todos.filter((t) => t.id !== id);
  save(store);
}
