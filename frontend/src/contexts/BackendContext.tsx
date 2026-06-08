'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

type BackendStatus = 'checking' | 'online' | 'offline';

interface BackendCtx {
  status: BackendStatus;
  isOnline: boolean;
}

const BackendContext = createContext<BackendCtx>({ status: 'checking', isOnline: false });
export const useBackend = () => useContext(BackendContext);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();

    apiClient
      .get('/health', { signal: controller.signal, timeout: 3000 })
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'));

    return () => controller.abort();
  }, []);

  return (
    <BackendContext.Provider value={{ status, isOnline: status === 'online' }}>
      {children}
    </BackendContext.Provider>
  );
};
