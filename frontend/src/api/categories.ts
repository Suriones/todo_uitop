import { apiClient } from './client';
import { Category } from '@/types';
import { localGetCategories } from '@/lib/localDb';

export const fetchCategories = async (isOnline = true): Promise<Category[]> => {
  if (!isOnline) return localGetCategories();
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
};
