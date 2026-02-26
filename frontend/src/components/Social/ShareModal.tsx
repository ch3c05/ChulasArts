/**
 * ShareModal Component
 * Material-UI dialog for sharing photos
 */

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  photoUrl: string;
  photoTitle?: string;
}

export default function ShareModal({
  open,
  onClose,
  photoUrl,
  photoTitle = 'Check out this photo',
}: ShareModalProps) {
  const [showCopied, setShowCopied] = useState(false);

  // Build full URL (assuming frontend is on same domain or use config)
  const shareUrl = `${window.location.origin}${photoUrl}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(photoTitle);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
    } catch {
      // Clipboard API may not be available — fail silently
    }
  };

  const handleCloseCopied = () => {
    setShowCopied(false);
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: '#1877F2',
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: '#1DA1F2',
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: '#25D366',
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Share Photo
            </Typography>
            <IconButton edge="end" onClick={onClose} aria-label="close" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Copy Link Section */}
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Copy Link
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                value={shareUrl}
                size="small"
                InputProps={{
                  readOnly: true,
                }}
              />
              <Tooltip title="Copy link">
                <IconButton onClick={handleCopyLink} color="primary" aria-label="Copy link">
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Social Media Section */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Share on Social Media
            </Typography>
            <Box display="flex" gap={2} mt={1}>
              {socialLinks.map((social) => (
                <Tooltip key={social.name} title={`Share on ${social.name}`}>
                  <IconButton
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${social.name}`}
                    sx={{
                      color: social.color,
                      border: `1px solid ${social.color}`,
                      '&:hover': {
                        backgroundColor: `${social.color}20`,
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Copied Snackbar */}
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={handleCloseCopied}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopied} severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
