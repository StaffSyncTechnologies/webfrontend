import React, { useState } from 'react';
import { Box, Typography, Button, Modal, IconButton, styled } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Close, Android, Apple } from '@mui/icons-material';
import { colors } from '../utilities/colors';

const PlayStoreLink = 'https://play.google.com/store/apps/details?id=com.staffsync.worker';

const DownloadModal = styled(Modal)({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

const ModalContent = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
});

const QRCodeContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  border: '1px solid #e9ecef',
});

const DownloadButtons = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '24px',
});

const StoreButton = styled('a')({
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
});

const GooglePlayButton = styled(StoreButton)({
  backgroundColor: '#000000',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1a1a1a',
  },
});

const ComingSoonButton = styled(StoreButton)({
  backgroundColor: '#f8f9fa',
  color: '#6c757d',
  border: '1px solid #dee2e6',
  cursor: 'not-allowed',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    transform: 'none',
    boxShadow: 'none',
  },
});

interface AppDownloadProps {
  open: boolean;
  onClose: () => void;
}

export function AppDownload({ open, onClose }: AppDownloadProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PlayStoreLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <DownloadModal
      open={open}
      onClose={onClose}
      aria-labelledby="app-download-modal"
    >
      <ModalContent>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: '#6c757d',
          }}
        >
          <Close />
        </IconButton>

        <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
          Get the Mobile App
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Scan the QR code or click below to download the StaffSync Worker app
        </Typography>

        <QRCodeContainer>
          <QRCodeSVG
            value={PlayStoreLink}
            size={180}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </QRCodeContainer>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Scan with your phone camera or QR code reader
        </Typography>

        <DownloadButtons>
          <GooglePlayButton
            href={PlayStoreLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Android sx={{ fontSize: '20px' }} />
            Download on Google Play
          </GooglePlayButton>

          <ComingSoonButton as="div">
            <Apple sx={{ fontSize: '20px' }} />
            Coming Soon to App Store
          </ComingSoonButton>

          <Button
            variant="outlined"
            onClick={handleCopyLink}
            sx={{
              borderColor: colors.primary.blue,
              color: colors.primary.blue,
              '&:hover': {
                borderColor: colors.primary.navy,
                color: colors.primary.navy,
                backgroundColor: 'rgba(0, 0, 53, 0.04)',
              },
            }}
          >
            {copied ? 'Link Copied!' : 'Copy Download Link'}
          </Button>
        </DownloadButtons>
      </ModalContent>
    </DownloadModal>
  );
}

// Floating Action Button for mobile app download
export function MobileAppFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            minWidth: '56px',
            boxShadow: '0 4px 12px rgba(0, 0, 53, 0.3)',
            backgroundColor: colors.primary.navy,
            '&:hover': {
              backgroundColor: colors.primary.navy,
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(0, 0, 53, 0.4)',
            },
          }}
        >
          <Android sx={{ fontSize: '24px' }} />
        </Button>
      </Box>

      <AppDownload open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// Download Section Component for landing pages
export function AppDownloadSection() {
  const [open, setOpen] = useState(false);

  // Listen for custom event from homepage
  React.useEffect(() => {
    const handleOpenAppDownload = () => setOpen(true);
    window.addEventListener('openAppDownload', handleOpenAppDownload);
    return () => window.removeEventListener('openAppDownload', handleOpenAppDownload);
  }, []);

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Typography variant="h3" component="h2" gutterBottom fontWeight={600}>
        Take StaffSync On The Go
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
        Manage your shifts, clock in/out, and stay connected with your agency from anywhere. 
        Download the StaffSync Worker app today!
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <QRCodeContainer sx={{ mb: 2 }}>
            <QRCodeSVG
              value={PlayStoreLink}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </QRCodeContainer>
          <Typography variant="body2" color="text.secondary">
            Scan to download
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <DownloadButtons sx={{ alignItems: 'flex-start' }}>
            <GooglePlayButton
              href={PlayStoreLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ width: '200px' }}
            >
              <Android sx={{ fontSize: '20px' }} />
              Get it on Google Play
            </GooglePlayButton>

            <ComingSoonButton as="div" sx={{ width: '200px' }}>
              <Apple sx={{ fontSize: '20px' }} />
              Coming Soon to App Store
            </ComingSoonButton>
          </DownloadButtons>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Available for Android devices
          </Typography>
        </Box>
      </Box>

      <AppDownload open={open} onClose={() => setOpen(false)} />
    </Box>
  );
}
