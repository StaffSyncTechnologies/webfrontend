import { Close } from '@mui/icons-material';
import { Box, styled, TextField, IconButton, Modal, Switch } from '@mui/material';
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

const PermissionItem = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #F3F4F6',
  '&:last-child': { borderBottom: 'none' },
});

const PermissionInfo = styled(Box)({
  '& .name': { fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy },
  '& .desc': { fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginTop: '2px' },
});

const ModalButtonsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginTop: '8px',
});

const CancelBtn = styled('button')({
  padding: '14px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const SubmitBtn = styled('button')({
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
interface AddRoleModalProps {
  open: boolean;
  onClose: () => void;
}

// ============ PERMISSIONS DATA ============
const permissions = [
  { key: 'all', name: 'All Permission', desc: 'This is a placeholder for the description', defaultChecked: true },
  { key: 'shift', name: 'Shift Management', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'workers', name: 'Workers Management', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'compliance', name: 'Compliance Management', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'client', name: 'Client Management', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'payroll', name: 'Payroll Management', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'invoicing', name: 'Invoicing', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'reports', name: 'Reports & Analytics', desc: 'This is a placeholder for the description', defaultChecked: false },
  { key: 'settings', name: 'Settings Management', desc: 'This is a placeholder for the description', defaultChecked: false },
];

// ============ COMPONENT ============
export function AddRoleModal({ open, onClose }: AddRoleModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={onClose}><Close /></ModalClose>
          <ModalTitle>Add New Role</ModalTitle>
          <ModalFormGroup>
            <ModalLabel>Role Name<span className="required">*</span></ModalLabel>
            <StyledInput placeholder="Enter Role name" />
          </ModalFormGroup>
          <Box sx={{ marginBottom: '16px' }}>
            <ModalLabel style={{ marginBottom: '4px' }}>Permissions</ModalLabel>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, marginBottom: '12px' }}>
              Set the permissions for this role
            </Box>
            {permissions.map((perm) => (
              <PermissionItem key={perm.key}>
                <PermissionInfo>
                  <div className="name">{perm.name}</div>
                  <div className="desc">{perm.desc}</div>
                </PermissionInfo>
                <Switch defaultChecked={perm.defaultChecked} color="primary" />
              </PermissionItem>
            ))}
          </Box>
          <ModalButtonsRow>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
            <SubmitBtn onClick={onClose}>Add Role</SubmitBtn>
          </ModalButtonsRow>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default AddRoleModal;
