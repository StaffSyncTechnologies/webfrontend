import { useState } from 'react';
import { Close, LocationOn } from '@mui/icons-material';
import { Box, styled, TextField, Select, MenuItem, Checkbox, IconButton, Modal, CircularProgress } from '@mui/material';
import { colors } from '../../utilities/colors';
import { useCreateLocationMutation } from '../../store/slices/settingsSlice';
import { useToast } from '../../hooks';

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

const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  '& .MuiSelect-select': { padding: '12px 14px' },
  '& fieldset': { borderColor: '#E5E7EB' },
});

const FormGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
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
interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
}

// ============ COMPONENT ============
export function AddLocationModal({ open, onClose }: AddLocationModalProps) {
  const toast = useToast();
  const [createLocation, { isLoading }] = useCreateLocationMutation();
  
  const [form, setForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'uk',
    isPrimary: false,
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.addressLine1 || !form.city || !form.postcode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const address = [form.addressLine1, form.addressLine2, form.city, form.postcode, form.country.toUpperCase()]
        .filter(Boolean)
        .join(', ');

      await createLocation({
        name: form.name,
        address,
        latitude: 0,
        longitude: 0,
        geofenceRadius: 300,
        isPrimary: form.isPrimary,
        isActive: true,
      }).unwrap();

      toast.success('Location added successfully');
      setForm({ name: '', addressLine1: '', addressLine2: '', city: '', postcode: '', country: 'uk', isPrimary: false });
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add location');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={onClose}><Close /></ModalClose>
          <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
            <Box sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <LocationOn sx={{ fontSize: 28, color: colors.primary.blue }} />
            </Box>
            <ModalTitle>Add New Location</ModalTitle>
            <ModalSubtitle style={{ margin: 0 }}>Add a work location for your organization</ModalSubtitle>
          </Box>
          <ModalFormGroup>
            <ModalLabel>Location Name<span className="required">*</span></ModalLabel>
            <StyledInput placeholder="e.g. Head Office, Warehouse, etc." value={form.name} onChange={handleChange('name')} />
          </ModalFormGroup>
          <ModalFormGroup>
            <ModalLabel>Address Line 1<span className="required">*</span></ModalLabel>
            <StyledInput placeholder="Street address" value={form.addressLine1} onChange={handleChange('addressLine1')} />
          </ModalFormGroup>
          <ModalFormGroup>
            <ModalLabel>Address Line 2</ModalLabel>
            <StyledInput placeholder="Building, floor, suite (optional)" value={form.addressLine2} onChange={handleChange('addressLine2')} />
          </ModalFormGroup>
          <FormGrid>
            <ModalFormGroup>
              <ModalLabel>City<span className="required">*</span></ModalLabel>
              <StyledInput placeholder="City" value={form.city} onChange={handleChange('city')} />
            </ModalFormGroup>
            <ModalFormGroup>
              <ModalLabel>Postcode<span className="required">*</span></ModalLabel>
              <StyledInput placeholder="Postcode" value={form.postcode} onChange={handleChange('postcode')} />
            </ModalFormGroup>
          </FormGrid>
          <ModalFormGroup>
            <ModalLabel>Country<span className="required">*</span></ModalLabel>
            <StyledSelect value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as string })}>
              <MenuItem value="uk">United Kingdom</MenuItem>
              <MenuItem value="us">United States</MenuItem>
              <MenuItem value="ca">Canada</MenuItem>
              <MenuItem value="au">Australia</MenuItem>
            </StyledSelect>
          </ModalFormGroup>
          <ModalFormGroup>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Checkbox size="small" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.primary.navy }}>Set as primary location</span>
            </Box>
          </ModalFormGroup>
          <ModalButtonsRow>
            <CancelBtn onClick={onClose} disabled={isLoading}>Cancel</CancelBtn>
            <SubmitBtn onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Add Location'}
            </SubmitBtn>
          </ModalButtonsRow>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default AddLocationModal;
