import { Box, styled, Modal, IconButton } from '@mui/material';
import { Close, CheckCircle } from '@mui/icons-material';
import { colors } from '../../utilities/colors';

// ============ STYLED COMPONENTS ============
const ModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  padding: '32px',
  width: '420px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
  textAlign: 'center',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const SuccessIcon = styled(Box)({
  marginBottom: '16px',
  '& svg': {
    fontSize: '64px',
    color: colors.status.success,
  },
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 12px',
});

const ModalMessage = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  lineHeight: 1.6,
});

const DoneButton = styled('button')({
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

// ============ PROPS ============
interface SubscriptionSuccessModalProps {
  open: boolean;
  onClose: () => void;
  validUntil?: string;
}

// ============ COMPONENT ============
export function SubscriptionSuccessModal({ open, onClose, validUntil = '02/01/2026' }: SubscriptionSuccessModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={onClose}><Close /></ModalClose>
          <SuccessIcon>
            <CheckCircle />
          </SuccessIcon>
          <ModalTitle>Successful</ModalTitle>
          <ModalMessage>
            Your yearly subscription has been activated successfully. This plan is valid till {validUntil}.
          </ModalMessage>
          <DoneButton onClick={onClose}>Done</DoneButton>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default SubscriptionSuccessModal;
