'use client';

import { Box, Typography } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useBackend } from '@/contexts/BackendContext';

export const OfflineBanner = () => {
  const { status } = useBackend();

  if (status !== 'offline') return null;

  return (
    <Box
      sx={{
        bgcolor: '#fefce8',
        borderBottom: '1px solid #fde047',
        py: 0.75,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <CloudOffIcon sx={{ fontSize: 16, color: '#92400e' }} />
      <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
        Demo mode — backend not connected. Data is saved in your browser only.
      </Typography>
    </Box>
  );
};
