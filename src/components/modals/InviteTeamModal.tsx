import { Close } from '@mui/icons-material';
import { Box, styled, TextField, IconButton, Modal, Select, MenuItem } from '@mui/material';
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
  permissionAccess: string;
}

// ============ COMPONENT ============
export function InviteTeamModal({ open, onClose, onSubmit }: InviteTeamModalProps) {
  const handleSubmit = () => {
    // TODO: Add form validation and data collection
    onSubmit?.({
      fullName: '',
      email: '',
      phone: '',
      role: '',
      permissionAccess: '',
    });
    onClose();
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
            <StyledInput placeholder="Enter your full name" />
          </FormGroup>
          <FormRow>
            <FormGroup>
              <Label>Email address</Label>
              <StyledInput placeholder="Enter email address" />
            </FormGroup>
            <FormGroup>
              <Label>Phone number</Label>
              <StyledInput placeholder="Enter phone number" />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Role<span className="required">*</span></Label>
              <StyledSelect displayEmpty defaultValue="">
                <MenuItem value="" disabled><em>Select role</em></MenuItem>
                <MenuItem value="ops_manager">OPS Manager</MenuItem>
                <MenuItem value="shift_coordinator">Shift Coordinator</MenuItem>
                <MenuItem value="compliance_officer">Compliance Officer</MenuItem>
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
          <SubmitButton onClick={handleSubmit}>Add Manager</SubmitButton>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default InviteTeamModal;
