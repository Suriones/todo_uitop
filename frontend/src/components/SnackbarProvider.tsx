'use client';

import React, {
  createContext, useContext, useState, useCallback, useRef, useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { Alert, Button, Box, Typography, LinearProgress } from '@mui/material';

interface Msg {
  id: string;
  message: string;
  taskName?: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  undoAction?: () => void;
  duration: number;
}

interface Ctx {
  showSnackbar: (msg: string, sev?: Msg['severity'], undo?: () => void, taskName?: string) => string;
  hideSnackbar: (id?: string) => void;
}

const SnackbarContext = createContext<Ctx>({
  showSnackbar: () => '',
  hideSnackbar: () => {},
});
export const useSnackbar = () => useContext(SnackbarContext);

function Toast({ msg, onClose }: { msg: Msg; onClose: (id: string) => void }) {
  const totalSec = msg.duration / 1000;
  const [remaining, setRemaining] = useState(totalSec);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => onClose(msg.id), msg.duration);
    return () => clearTimeout(t);
  }, [msg.id, msg.duration, onClose]);

  useEffect(() => {
    if (!msg.undoAction) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [msg.id, msg.undoAction]);

  return (
    <Alert
      severity={msg.severity}
      onClose={() => onClose(msg.id)}
      sx={{
        borderRadius: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        '& .MuiAlert-message': { width: '100%' },
        overflow: 'hidden',
      }}
      action={
        msg.undoAction ? (
          <Button
            color="inherit"
            size="small"
            sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
            onClick={() => { msg.undoAction?.(); onClose(msg.id); }}
          >
            UNDO
          </Button>
        ) : undefined
      }
    >
      <Box sx={{ mb: msg.undoAction ? 1 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="body2" sx={{ flex: 1 }}>{msg.message}</Typography>
          {msg.undoAction && (
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.82rem', opacity: 0.65 }}>
              {remaining}s
            </Typography>
          )}
        </Box>
        {msg.taskName && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.55,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {msg.taskName}
          </Typography>
        )}
      </Box>
      {msg.undoAction && (
        <LinearProgress
          variant="determinate"
          value={(remaining / totalSec) * 100}
          color={msg.severity === 'success' ? 'success' : 'inherit'}
          sx={{ height: 3, borderRadius: 0, bgcolor: 'rgba(0,0,0,0.1)' }}
        />
      )}
    </Alert>
  );
}

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [mounted, setMounted] = useState(false);
  const counter = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  const showSnackbar = useCallback(
    (message: string, severity: Msg['severity'] = 'info', undoAction?: () => void, taskName?: string): string => {
      const id = String(counter.current++);
      setMsgs((prev) => [
        ...prev,
        { id, message, severity, undoAction, taskName, duration: undoAction ? 5000 : 3000 },
      ]);
      return id;
    },
    [],
  );

  const hideSnackbar = useCallback((id?: string) => {
    if (id) {
      setMsgs((prev) => prev.filter((m) => m.id !== id));
    } else {
      // Close the most recent one (used when un-completing a task)
      setMsgs((prev) => prev.slice(0, -1));
    }
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}

      {mounted && createPortal(
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 460,
            maxWidth: '100vw',
            pt: '80px',
            pr: 2,
            pb: 2,
            overflow: 'hidden',
            pointerEvents: msgs.length > 0 ? 'auto' : 'none',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {msgs.map((msg) => (
            <Toast key={msg.id} msg={msg} onClose={hideSnackbar} />
          ))}
        </Box>,
        document.body,
      )}
    </SnackbarContext.Provider>
  );
};
