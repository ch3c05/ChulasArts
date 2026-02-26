/**
 * ErrorMessage Component
 * Reusable error display with retry option using MUI
 */

import { Alert, Button, Box } from '@mui/material';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ message, onRetry, type = 'error' }: ErrorMessageProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={type}
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Try Again
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Box>
  );
}
