'use client';

import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types';
import { fetchTodos, updateTodo, deleteTodo, bulkCompleteTodos } from '@/api/todos';

interface PendingRemoval {
  todo: Todo;
  timeoutId: ReturnType<typeof setTimeout>;
}

export function useTodos(categoryFilter: string, isOnline: boolean, backendChecked: boolean) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Map of todo id → pending removal (completed but not yet deleted)
  const [pendingRemovals, setPendingRemovals] = useState<Map<string, PendingRemoval>>(new Map());

  const load = useCallback(async () => {
    if (!backendChecked) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos(categoryFilter || undefined, isOnline);
      setTodos(data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, isOnline, backendChecked]);

  useEffect(() => {
    load();
  }, [load]);

  // Clear pending removals when filter changes
  useEffect(() => {
    setPendingRemovals((prev) => {
      prev.forEach((item) => clearTimeout(item.timeoutId));
      return new Map();
    });
  }, [categoryFilter]);

  const handleToggleComplete = useCallback(
    async (todo: Todo): Promise<{ undo: () => void } | null> => {
      const newCompleted = !todo.completed;
      if (!newCompleted) {
        // Un-completing — cancel the auto-delete timer if it's running
        setPendingRemovals((prev) => {
          const entry = prev.get(todo.id);
          if (entry) clearTimeout(entry.timeoutId);
          const next = new Map(prev);
          next.delete(todo.id);
          return next;
        });
        try {
          const updated = await updateTodo(todo.id, false, isOnline);
          setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
        } catch {
          setError('Failed to update task.');
        }
        return null;
      }

      // Marking as completed — optimistically update UI
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: true } : t)));

      try {
        await updateTodo(todo.id, true, isOnline);
      } catch {
        // Revert
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: false } : t)));
        setError('Failed to update task.');
        return null;
      }

      // Schedule auto-removal after 5 seconds
      const timeoutId = setTimeout(async () => {
        try {
          await deleteTodo(todo.id, isOnline);
          setTodos((prev) => prev.filter((t) => t.id !== todo.id));
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(todo.id);
            return next;
          });
        } catch {
          // Already deleted or network error — just remove from UI
          setTodos((prev) => prev.filter((t) => t.id !== todo.id));
        }
        setPendingRemovals((prev) => {
          const next = new Map(prev);
          next.delete(todo.id);
          return next;
        });
      }, 5000);

      setPendingRemovals((prev) => {
        const next = new Map(prev);
        next.set(todo.id, { todo, timeoutId });
        return next;
      });

      const undo = async () => {
        setPendingRemovals((prev) => {
          const entry = prev.get(todo.id);
          if (entry) clearTimeout(entry.timeoutId);
          const next = new Map(prev);
          next.delete(todo.id);
          return next;
        });
        try {
          const restored = await updateTodo(todo.id, false, isOnline);
          setTodos((prev) => prev.map((t) => (t.id === todo.id ? restored : t)));
        } catch {
          setError('Failed to undo.');
        }
      };

      return { undo };
    },
    [isOnline]
  );

  const handleDelete = useCallback(async (todo: Todo): Promise<{ undo: () => void }> => {
    // Cancel any pending removal for this todo
    setPendingRemovals((prev) => {
      const entry = prev.get(todo.id);
      if (entry) clearTimeout(entry.timeoutId);
      const next = new Map(prev);
      next.delete(todo.id);
      return next;
    });

    // Remove from UI immediately
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(todo.id);
      return next;
    });

    let deleted = false;
    try {
      await deleteTodo(todo.id, isOnline);
      deleted = true;
    } catch {
      // Revert
      setTodos((prev) => [todo, ...prev]);
      setError('Failed to delete task.');
    }

    const undo = async () => {
      if (!deleted) return;
      // Re-create isn't easily supported without re-insert; we reload from server
      await load();
    };

    return { undo };
  }, [load]);

  const handleBulkComplete = useCallback(async (): Promise<{ undo: () => void } | null> => {
    if (selectedIds.size === 0) return null;

    const targetIds = Array.from(selectedIds).filter((id) => {
      const todo = todos.find((t) => t.id === id);
      return todo && !todo.completed;
    });

    if (targetIds.length === 0) return null;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (targetIds.includes(t.id) ? { ...t, completed: true } : t))
    );

    try {
      await bulkCompleteTodos(targetIds, isOnline);
    } catch {
      setTodos((prev) =>
        prev.map((t) => (targetIds.includes(t.id) ? { ...t, completed: false } : t))
      );
      setError('Failed to bulk-complete tasks.');
      return null;
    }

    // Schedule removal for each
    targetIds.forEach((id) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const timeoutId = setTimeout(async () => {
        try {
          await deleteTodo(id, isOnline);
        } catch {
          // ignore
        }
        setTodos((prev) => prev.filter((t) => t.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setPendingRemovals((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }, 5000);

      setPendingRemovals((prev) => {
        const next = new Map(prev);
        next.set(id, { todo, timeoutId });
        return next;
      });
    });

    const undo = async () => {
      targetIds.forEach((id) => {
        setPendingRemovals((prev) => {
          const entry = prev.get(id);
          if (entry) clearTimeout(entry.timeoutId);
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      });
      try {
        await Promise.all(targetIds.map((id) => updateTodo(id, false, isOnline)));
        setTodos((prev) =>
          prev.map((t) => (targetIds.includes(t.id) ? { ...t, completed: false } : t))
        );
      } catch {
        setError('Failed to undo.');
      }
    };

    return { undo };
  }, [selectedIds, todos, isOnline]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === todos.length) return new Set();
      return new Set(todos.map((t) => t.id));
    });
  }, [todos]);

  return {
    todos,
    loading,
    error,
    setError,
    selectedIds,
    pendingRemovals,
    handleToggleComplete,
    handleDelete,
    handleBulkComplete,
    toggleSelect,
    toggleSelectAll,
    reload: load,
    addTodo: (todo: Todo) => setTodos((prev) => [todo, ...prev]),
  };
}
