'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { fetchCategories } from '@/api/categories';

export function useCategories(isOnline: boolean, backendChecked: boolean) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until we know whether the backend is up or not
    if (!backendChecked) return;

    let cancelled = false;
    setLoading(true);
    fetchCategories(isOnline)
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch(() => { if (!cancelled) setError('Failed to load categories.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isOnline, backendChecked]);

  return { categories, loading, error };
}
