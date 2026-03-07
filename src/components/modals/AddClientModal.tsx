import { useState } from 'react';
import { Close, CheckCircle } from '@mui/icons-material';
import { Box, styled, TextField, Modal, IconButton, CircularProgress, Select, MenuItem, FormControl } from '@mui/material';
import { colors } from '../../utilities/colors';
import { useCreateClient } from '../../hooks/api/useClientsApi';

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
  width: '600px',
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
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
  },
  '& .MuiSelect-select': {
    padding: '12px 14px',
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
  fontSize: '16px',
  color: colors.primary.navy,
  textAlign: 'center',
  margin: '0 0 24px',
});

// ============ INDUSTRIES ============
const industries = [
  'Healthcare',
  'Hospitality',
  'Logistics',
  'Retail',
  'Construction',
  'Manufacturing',
  'IT/Tech',
  'Education',
  'Security',
  'Cleaning',
  'Other',
];

// ============ TYPES ============
interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  postcode: string;
  industry: string;
  defaultPayRate: string;
  defaultChargeRate: string;
}

// ============ COMPONENT ============
export function AddClientModal({ open, onClose, onSuccess }: AddClientModalProps) {
  const createClient = useCreateClient();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postcode: '',
    industry: '',
    defaultPayRate: '',
    defaultChargeRate: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (formData.defaultPayRate && isNaN(Number(formData.defaultPayRate))) {
      newErrors.defaultPayRate = 'Must be a number';
    }

    if (formData.defaultChargeRate && isNaN(Number(formData.defaultChargeRate))) {
      newErrors.defaultChargeRate = 'Must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createClient.mutateAsync({
        name: formData.name,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        postcode: formData.postcode || undefined,
        industry: formData.industry || undefined,
        defaultPayRate: formData.defaultPayRate ? Number(formData.defaultPayRate) : undefined,
        defaultChargeRate: formData.defaultChargeRate ? Number(formData.defaultChargeRate) : undefined,
      });

      setSuccess(true);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      city: '',
      postcode: '',
      industry: '',
      defaultPayRate: '',
      defaultChargeRate: '',
    });
    setErrors({});
    setSuccess(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalOverlay>
        <ModalCard>
          <ModalClose onClick={handleClose}>
            <Close />
          </ModalClose>

          {success ? (
            <>
              <SuccessIcon>
                <CheckCircle />
              </SuccessIcon>
              <ModalTitle>Client Added!</ModalTitle>
              <SuccessText>
                {formData.name} has been added successfully.
              </SuccessText>
              <SubmitButton onClick={handleClose}>Done</SubmitButton>
            </>
          ) : (
            <>
              <ModalTitle>Add New Client</ModalTitle>
              <ModalSubtitle>Enter the client details below</ModalSubtitle>

              <FormGroup>
                <Label>Client Name <span className="required">*</span></Label>
                <StyledInput
                  placeholder="e.g. St Jude Hospital"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Contact Name</Label>
                  <StyledInput
                    placeholder="e.g. John Smith"
                    value={formData.contactName}
                    onChange={handleChange('contactName')}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Contact Email</Label>
                  <StyledInput
                    placeholder="e.g. john@company.com"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange('contactEmail')}
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Contact Phone</Label>
                  <StyledInput
                    placeholder="e.g. +44 7123 456789"
                    value={formData.contactPhone}
                    onChange={handleChange('contactPhone')}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Industry</Label>
                  <FormControl fullWidth>
                    <StyledSelect
                      value={formData.industry}
                      onChange={(e) => handleChange('industry')({ target: { value: e.target.value as string } })}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <span style={{ color: '#9CA3AF' }}>Select industry</span>
                      </MenuItem>
                      {industries.map((ind) => (
                        <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Address</Label>
                <StyledInput
                  placeholder="Street address"
                  value={formData.address}
                  onChange={handleChange('address')}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>City</Label>
                  <StyledInput
                    placeholder="e.g. London"
                    value={formData.city}
                    onChange={handleChange('city')}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Postcode</Label>
                  <StyledInput
                    placeholder="e.g. SW1A 1AA"
                    value={formData.postcode}
                    onChange={handleChange('postcode')}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Default Pay Rate (£/hr)</Label>
                  <StyledInput
                    placeholder="e.g. 12.50"
                    value={formData.defaultPayRate}
                    onChange={handleChange('defaultPayRate')}
                    error={!!errors.defaultPayRate}
                    helperText={errors.defaultPayRate}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Default Charge Rate (£/hr)</Label>
                  <StyledInput
                    placeholder="e.g. 16.25"
                    value={formData.defaultChargeRate}
                    onChange={handleChange('defaultChargeRate')}
                    error={!!errors.defaultChargeRate}
                    helperText={errors.defaultChargeRate}
                  />
                </FormGroup>
              </FormRow>

              {createClient.isError && (
                <ErrorText>Failed to create client. Please try again.</ErrorText>
              )}

              <SubmitButton onClick={handleSubmit} disabled={createClient.isPending}>
                {createClient.isPending ? (
                  <>
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                    Creating...
                  </>
                ) : (
                  'Add Client'
                )}
              </SubmitButton>
            </>
          )}
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default AddClientModal;
