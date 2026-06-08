'use client';

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Category } from '@/types';

interface Props {
  categories: Category[];
  value: string;
  onChange: (v: string) => void;
}

export const CategoryFilter: React.FC<Props> = ({ categories, value, onChange }) => (
  <FormControl size="small" sx={{ minWidth: 180 }}>
    <InputLabel>Filter by category</InputLabel>
    <Select
      value={value}
      label="Filter by category"
      onChange={(e) => onChange(e.target.value)}
    >
      <MenuItem value=""><em>All categories</em></MenuItem>
      {categories.map((c) => (
        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
      ))}
    </Select>
  </FormControl>
);
