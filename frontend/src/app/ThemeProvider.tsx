'use client';

import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5b5ef4', light: '#7c7ef7', dark: '#3d3fb8' },
    success: { main: '#22c55e', light: '#bbf7d0', dark: '#16a34a' },
    error: { main: '#ef4444', light: '#fecaca' },
    background: { default: '#f8f9ff', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#6b7280', disabled: '#9ca3af' },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8, padding: '8px 18px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
    MuiSelect: {
      styleOverrides: { outlined: { borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
