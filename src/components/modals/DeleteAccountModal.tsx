import { useState } from 'react';
import { Close, Warning } from '@mui/icons-material';
import { Box, styled, TextField, Modal, IconButton, CircularProgress } from '@mui/material';
import { colors } from '../../utilities/colors';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
  width: '480px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const WarningIcon = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': {
    fontSize: '48px',
    color: colors.status.error,
  },
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.status.error,
  margin: '0 0 8px',
  textAlign: 'center',
});

const ModalSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
  lineHeight: 1.5,
});

const WarningBox = styled(Box)({
  backgroundColor: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
});

const WarningText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: '#991B1B',
  margin: 0,
  lineHeight: 1.5,
});

const FormGroup = styled(Box)({
  marginBottom: '16px',
});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  marginBottom: '8px',
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

const ButtonRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
});

const CancelButton = styled('button')({
  flex: 1,
  padding: '14px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const DeleteButton = styled('button')<{ disabled?: boolean }>(({ disabled }) => ({
  flex: 1,
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? '#FCA5A5' : colors.status.error,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  '&:hover': { backgroundColor: disabled ? '#FCA5A5' : '#B91C1C' },
}));

const ErrorText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.status.error,
  margin: '8px 0 0',
  textAlign: 'center',
});

// ============ TYPES ============
interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

// ============ COMPONENT ============
export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/auth/account', {
        data: { password, confirmText },
      });
      return response.data;
    },
    onSuccess: () => {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to delete account');
    },
  });

  const handleSubmit = () => {
    setError('');
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    deleteAccountMutation.mutate();
  };

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  const isValid = password.length > 0 && confirmText === 'DELETE MY ACCOUNT';

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={handleClose}>
            <Close />
          </ModalClose>

          <WarningIcon>
            <Warning />
          </WarningIcon>

          <ModalTitle>Delete Account</ModalTitle>
          <ModalSubtitle>
            This action cannot be undone. This will permanently delete your organization account
            and remove all associated data.
          </ModalSubtitle>

          <WarningBox>
            <WarningText>
              <strong>Warning:</strong> Deleting your account will:
              <br />• Remove all workers, shifts, and timesheets
              <br />• Delete all invoices and financial records
              <br />• Remove all team members and their access
              <br />• Cancel any active subscriptions
            </WarningText>
          </WarningBox>

          <FormGroup>
            <Label>Enter your password to confirm</Label>
            <StyledInput
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Type "DELETE MY ACCOUNT" to confirm</Label>
            <StyledInput
              placeholder="DELETE MY ACCOUNT"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </FormGroup>

          {error && <ErrorText>{error}</ErrorText>}

          <ButtonRow>
            <CancelButton onClick={handleClose}>Cancel</CancelButton>
            <DeleteButton onClick={handleSubmit} disabled={!isValid || deleteAccountMutation.isPending}>
              {deleteAccountMutation.isPending ? (
                <>
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </DeleteButton>
          </ButtonRow>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default DeleteAccountModal;
