import { useState } from 'react';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, IconButton, Modal } from '@mui/material';
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
  borderRadius: '12px',
  padding: '32px',
  width: '520px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 4px',
  textAlign: 'center',
});

const ModalSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
});

const ModalFormGroup = styled(Box)({
  marginBottom: '16px',
});

const ModalLabel = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  marginBottom: '8px',
  '& .required': { color: colors.status.error },
});

const StyledInput = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    padding: '12px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const UpdateBtn = styled('button')({
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
interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

// ============ COMPONENT ============
export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleClose = () => {
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={handleClose}><Close /></ModalClose>
          <ModalTitle>Change Password</ModalTitle>
          <ModalSubtitle>Enter a new password to set your password to stay secure</ModalSubtitle>
          <ModalFormGroup>
            <ModalLabel>Current password<span className="required">*</span></ModalLabel>
            <StyledInput
              placeholder="Enter current password"
              type={showCurrentPw ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                      {showCurrentPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </ModalFormGroup>
          <ModalFormGroup>
            <ModalLabel>New password<span className="required">*</span></ModalLabel>
            <StyledInput
              placeholder="Enter new password"
              type={showNewPw ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNewPw(!showNewPw)}>
                      {showNewPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </ModalFormGroup>
          <ModalFormGroup>
            <ModalLabel>Confirm new password<span className="required">*</span></ModalLabel>
            <StyledInput
              placeholder="Enter new password again"
              type={showConfirmPw ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                      {showConfirmPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </ModalFormGroup>
          <UpdateBtn onClick={handleClose}>Update password</UpdateBtn>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default ChangePasswordModal;
