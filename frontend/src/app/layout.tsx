import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import ThemeProvider from './ThemeProvider';
import { SnackbarProvider } from '@/components/SnackbarProvider';
import { BackendProvider } from '@/contexts/BackendContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Todo Manager',
  description: 'Manage your tasks with categories',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0 }}>
        {/* AppRouterCacheProvider fixes MUI emotion hydration mismatch in Next.js App Router */}
        <AppRouterCacheProvider>
          <ThemeProvider>
            <BackendProvider>
              <SnackbarProvider>{children}</SnackbarProvider>
            </BackendProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
