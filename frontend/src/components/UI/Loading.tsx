/**
 * Loading Component
 * Reusable loading spinner using MUI
 */

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 60,
};

export function Loading({ message = 'Loading...', size = 'medium' }: LoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <CircularProgress size={sizeMap[size]} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
