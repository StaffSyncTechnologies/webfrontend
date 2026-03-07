import { useState } from 'react';
import { Close, CheckCircle } from '@mui/icons-material';
import { Box, styled, TextField, Modal, IconButton, CircularProgress, Tabs, Tab } from '@mui/material';
import { colors } from '../../utilities/colors';
import { useInviteWorkerMutation, useInviteWorkerByEmailMutation } from '../../store/slices/workerSlice';

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
  width: '500px',
  maxWidth: '90vw',
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

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
});

const SubmitButton = styled('button')<{ disabled?: boolean }>(({ disabled }) => ({
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? '#9CA3AF' : colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginTop: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  '&:hover': { backgroundColor: disabled ? '#9CA3AF' : '#1a2d4a' },
}));

const ErrorText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.status.error,
  margin: '8px 0 0',
  textAlign: 'center',
});

const SuccessIcon = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': {
    fontSize: '48px',
    color: colors.status.success,
  },
});

const SuccessText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  textAlign: 'center',
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
interface InviteWorkerModalProps {
  open: boolean;
  onClose: () => void;
}

// ============ COMPONENT ============
export function InviteWorkerModal({ open, onClose }: InviteWorkerModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [tabIndex, setTabIndex] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [inviteWorker, { isLoading }] = useInviteWorkerMutation();
  const [inviteByEmail, { isLoading: invitingByEmail }] = useInviteWorkerByEmailMutation();

  const handleSubmitNewWorker = async () => {
    setError(null);
    
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError('Please provide either email or phone number');
      return;
    }

    try {
      await inviteWorker({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        fullName: fullName.trim(),
      }).unwrap();
      setStep('success');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to send invite. Please try again.');
    }
  };

  const handleSubmitExistingWorker = async () => {
    setError(null);
    
    if (!email.trim()) {
      setError('Email is required to invite an existing worker');
      return;
    }

    try {
      await inviteByEmail({
        email: email.trim(),
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      }).unwrap();
      setStep('success');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to invite worker. They may not exist or are already in your organization.');
    }
  };

  const handleClose = () => {
    setStep('form');
    setTabIndex(0);
    setFullName('');
    setEmail('');
    setPhone('');
    setHourlyRate('');
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={handleClose}><Close /></ModalClose>

          {step === 'form' ? (
            <>
              <ModalTitle>Invite Worker</ModalTitle>
              <ModalSubtitle>Add a worker to your organization</ModalSubtitle>

              <Tabs 
                value={tabIndex} 
                onChange={(_, v) => { setTabIndex(v); setError(null); }}
                sx={{ mb: 3, '& .MuiTab-root': { fontFamily: "'Outfit', sans-serif", textTransform: 'none' } }}
              >
                <Tab label="New Worker" />
                <Tab label="Existing Worker" />
              </Tabs>

              {tabIndex === 0 ? (
                <>
                  <FormGroup>
                    <Label>Full Name<span className="required">*</span></Label>
                    <StyledInput
                      placeholder="Enter worker's full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label>Email address</Label>
                      <StyledInput
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Phone number</Label>
                      <StyledInput
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </FormGroup>
                  </FormRow>

                  {error && <ErrorText>{error}</ErrorText>}
                  <SubmitButton onClick={handleSubmitNewWorker} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Send Invite Code'}
                  </SubmitButton>
                </>
              ) : (
                <>
                  <FormGroup>
                    <Label>Worker Email<span className="required">*</span></Label>
                    <StyledInput
                      placeholder="Enter existing worker's email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Hourly Rate (optional)</Label>
                    <StyledInput
                      placeholder="e.g. 15.00"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </FormGroup>

                  <Box sx={{ mb: 2, p: 2, bgcolor: '#F0F9FF', borderRadius: '8px' }}>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#0369A1' }}>
                      This will send an invitation to an existing StaffSync worker to join your organization. They will need to accept the invitation.
                    </Box>
                  </Box>

                  {error && <ErrorText>{error}</ErrorText>}
                  <SubmitButton onClick={handleSubmitExistingWorker} disabled={invitingByEmail}>
                    {invitingByEmail ? <CircularProgress size={18} color="inherit" /> : 'Invite to Organization'}
                  </SubmitButton>
                </>
              )}
            </>
          ) : (
            <>
              <SuccessIcon><CheckCircle /></SuccessIcon>
              <ModalTitle>Invite Successful</ModalTitle>
              <SuccessText>
                {tabIndex === 0 
                  ? `You have successfully invited ${fullName || 'the worker'}. An invite code has been sent to their email for onboarding.`
                  : `An invitation has been sent to ${email}. The worker will need to accept to join your organization.`
                }
              </SuccessText>
              <DoneButton onClick={handleClose}>Done</DoneButton>
            </>
          )}
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default InviteWorkerModal;
