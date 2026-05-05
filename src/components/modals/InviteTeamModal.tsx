import { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Box, styled, TextField, IconButton, Modal, Select, MenuItem, CircularProgress } from '@mui/material';
import { colors } from '../../utilities/colors';
import { useInviteStaffMutation } from '../../store/slices/hrSlice';

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

const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  '& .MuiSelect-select': { padding: '12px 14px' },
  '& fieldset': { borderColor: '#E5E7EB' },
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
});

const SubmitButton = styled('button')({
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
  marginTop: '8px',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

// ============ PROPS ============
interface InviteTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: InviteTeamFormData) => void;
}

interface InviteTeamFormData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

// ============ COMPONENT ============
export function InviteTeamModal({ open, onClose, onSubmit }: InviteTeamModalProps) {
  const [formData, setFormData] = useState<InviteTeamFormData>({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InviteTeamFormData, string>>>({});
  const [inviteStaff, { isLoading }] = useInviteStaffMutation();

  const handleChange = (field: keyof InviteTeamFormData) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value as string }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof InviteTeamFormData, string>> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = await inviteStaff({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'OPS_MANAGER' | 'SHIFT_COORDINATOR' | 'COMPLIANCE_OFFICER',
      }).unwrap();

      onSubmit?.(formData);
      setFormData({ fullName: '', email: '', phone: '', role: '' });
      onClose();
      alert(`Staff member invited successfully! Invite code: ${result.inviteCode}`);
    } catch (error: any) {
      console.error('Failed to invite staff:', error);
      alert(error?.data?.message || 'Failed to invite staff member. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={onClose}><Close /></ModalClose>
          <ModalTitle>Invite Team</ModalTitle>
          <ModalSubtitle>Invite a new team member for your HR team</ModalSubtitle>
          <FormGroup>
            <Label>Full Name<span className="required">*</span></Label>
            <StyledInput 
              placeholder="Enter full name" 
              value={formData.fullName}
              onChange={handleChange('fullName')}
              error={!!errors.fullName}
              helperText={errors.fullName}
            />
          </FormGroup>
          <FormRow>
            <FormGroup>
              <Label>Email address<span className="required">*</span></Label>
              <StyledInput 
                placeholder="Enter email address" 
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone number</Label>
              <StyledInput 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Role<span className="required">*</span></Label>
              <StyledSelect 
                displayEmpty 
                value={formData.role}
                onChange={(e) => handleChange('role')(e as React.ChangeEvent<{ value: unknown }>)}
                error={!!errors.role}
              >
                <MenuItem value="" disabled><em>Select role</em></MenuItem>
                <MenuItem value="OPS_MANAGER">OPS Manager</MenuItem>
                <MenuItem value="SHIFT_COORDINATOR">Shift Coordinator</MenuItem>
                <MenuItem value="COMPLIANCE_OFFICER">Compliance Officer</MenuItem>
              </StyledSelect>
            </FormGroup>
            <FormGroup>
              <Label>Permission Access<span className="required">*</span></Label>
              <StyledSelect displayEmpty defaultValue="">
                <MenuItem value="" disabled><em>Select access level</em></MenuItem>
                <MenuItem value="full">Full Access</MenuItem>
                <MenuItem value="limited">Limited Access</MenuItem>
                <MenuItem value="readonly">Read Only</MenuItem>
              </StyledSelect>
            </FormGroup>
          </FormRow>
          <SubmitButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Add Manager'}
          </SubmitButton>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default InviteTeamModal;
