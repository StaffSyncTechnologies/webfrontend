import { Box, styled, Modal, IconButton } from '@mui/material';
import { Close, Block } from '@mui/icons-material';
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

const CancelIcon = styled(Box)({
  marginBottom: '16px',
  '& svg': {
    fontSize: '64px',
    color: colors.status.error,
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
interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// ============ COMPONENT ============
export function CancelSubscriptionModal({ open, onClose, onConfirm }: CancelSubscriptionModalProps) {
  const handleDone = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={onClose}><Close /></ModalClose>
          <CancelIcon>
            <Block />
          </CancelIcon>
          <ModalTitle>Cancel Subscription</ModalTitle>
          <ModalMessage>
            Are you sure you want to cancel? Cancellation will deactivate the subscription when your subscription plan has ended.
          </ModalMessage>
          <DoneButton onClick={handleDone}>Done</DoneButton>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default CancelSubscriptionModal;
