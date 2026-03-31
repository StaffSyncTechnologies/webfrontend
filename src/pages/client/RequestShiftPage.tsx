import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  Save,
  Add,
  Remove,
  CalendarMonth,
  AccessTime,
  LocationOn,
  Person,
  AttachMoney,
  Description,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Button, Typography, IconButton, Paper } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useToast } from '../../hooks/useToast';
import { useRequestWorkersMutation } from '../../store/slices/clientDashboardSlice';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
});

const BackButton = styled(Button)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const TitleSection = styled(Box)({});

const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PageSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const FormCard = styled(Paper)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '32px',
  marginBottom: '24px',
});

const SectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 24px',
});

const FormRow = styled(Box)({
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  '&.single': {
    flexDirection: 'column',
  },
});

const FormColumn = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const FormField = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const Label = styled('label')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.text.secondary,
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#D1D5DB' },
    '&.Mui-focused fieldset': { borderColor: colors.primary.navy },
  },
  '& .MuiInputBase-input': {
    padding: '12px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const StyledSelect = styled(Select)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#D1D5DB' },
    '&.Mui-focused fieldset': { borderColor: colors.primary.navy },
  },
  '& .MuiSelect-select': {
    padding: '12px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const WorkersSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const WorkerRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  backgroundColor: '#F9FAFB',
});

const WorkerInfo = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const WorkerAvatar = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: colors.primary.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
});

const WorkerDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const WorkerName = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
});

const WorkerRole = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const AddWorkerButton = styled(Button)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '8px',
  border: '1px dashed #D1D5DB',
  backgroundColor: 'transparent',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { 
    backgroundColor: '#F9FAFB',
    borderColor: colors.primary.navy,
    color: colors.primary.navy,
  },
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '16px',
  justifyContent: 'flex-end',
  marginTop: '32px',
});

const CancelButton = styled(Button)({
  padding: '12px 32px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const SaveButton = styled(Button)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
  '&:disabled': { 
    backgroundColor: '#D1D5DB',
    color: colors.text.secondary,
    cursor: 'not-allowed',
  },
});

const CounterInput = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '& input': {
    width: '60px',
    textAlign: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    padding: '8px',
  },
});

// ============ COMPONENT ============
export function RequestShiftPage() {
  useDocumentTitle('Request Shift');
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    payRate: '',
    requiredWorkers: 1,
    description: '',
    urgency: 'normal',
    reason: '',
  });

  const [selectedWorkers, setSelectedWorkers] = useState([
    { id: '1', name: 'John Smith', role: 'Warehouse Worker' },
    { id: '2', name: 'Sarah Johnson', role: 'Forklift Operator' },
  ]);

  const [requestWorkers, { isLoading: requestLoading }] = useRequestWorkersMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkerCountChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      requiredWorkers: Math.max(1, prev.requiredWorkers + delta)
    }));
  };

  const handleAddWorker = () => {
    // Placeholder for adding worker functionality
    toast.info('Add worker feature coming soon');
  };

  const handleRemoveWorker = (workerId: string) => {
    setSelectedWorkers(prev => prev.filter(w => w.id !== workerId));
  };

  const handleSave = async () => {
    setError('');
    try {
      await requestWorkers({
        siteLocation: formData.location,
        role: formData.title,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        workersNeeded: formData.requiredWorkers,
        notes: formData.description || formData.reason,
      }).unwrap();
      toast.success('Shift request submitted successfully! It will be reviewed by an administrator.');
      navigate('/client/shifts');
    } catch (error: any) {
      setError(error?.data?.message || 'Failed to submit shift request. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/client/shifts');
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <BackButton onClick={handleCancel}>
          <ArrowBack sx={{ fontSize: 20 }} />
          Back to Shifts
        </BackButton>
      </HeaderRow>

      <TitleSection>
        <PageTitle>Request New Shift</PageTitle>
        <PageSubtitle>Submit a request for a new work shift that requires approval</PageSubtitle>
      </TitleSection>

      <FormCard>
        <SectionTitle>Shift Details</SectionTitle>
        
        <FormRow>
          <FormColumn>
            <FormField>
              <Label>Shift Title *</Label>
              <StyledTextField
                placeholder="e.g., Morning Warehouse Shift"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                fullWidth
              />
            </FormField>
            
            <FormRow>
              <FormField>
                <Label>Date *</Label>
                <StyledTextField
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth sx={{ color: '#9CA3AF', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormField>
              
              <FormField>
                <Label>Start Time *</Label>
                <StyledTextField
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime sx={{ color: '#9CA3AF', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormField>
              
              <FormField>
                <Label>End Time *</Label>
                <StyledTextField
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime sx={{ color: '#9CA3AF', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormField>
            </FormRow>
          </FormColumn>
          
          <FormColumn>
            <FormField>
              <Label>Location *</Label>
              <StyledTextField
                placeholder="e.g., Main Warehouse, Building A"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#9CA3AF', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormField>
            
            <FormRow>
              <FormField>
                <Label>Pay Rate (£/hr) *</Label>
                <StyledTextField
                  placeholder="15.00"
                  value={formData.payRate}
                  onChange={(e) => handleInputChange('payRate', e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: '#9CA3AF', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormField>
              
              <FormField>
                <Label>Workers Required</Label>
                <CounterInput>
                  <IconButton 
                    size="small" 
                    onClick={() => handleWorkerCountChange(-1)}
                    disabled={formData.requiredWorkers <= 1}
                  >
                    <Remove sx={{ fontSize: 18 }} />
                  </IconButton>
                  <input 
                    type="text" 
                    value={formData.requiredWorkers} 
                    readOnly 
                  />
                  <IconButton size="small" onClick={() => handleWorkerCountChange(1)}>
                    <Add sx={{ fontSize: 18 }} />
                  </IconButton>
                </CounterInput>
              </FormField>
            </FormRow>
          </FormColumn>
        </FormRow>
        
        <FormField className="single">
          <Label>Description</Label>
          <StyledTextField
            placeholder="Add any additional details about this shift..."
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                  <Description sx={{ color: '#9CA3AF', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </FormField>
      </FormCard>

      <FormCard>
        <SectionTitle>Request Details</SectionTitle>
        
        <FormRow>
          <FormField>
            <Label>Urgency Level</Label>
            <StyledSelect
              value={formData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value as string)}
              fullWidth
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </StyledSelect>
          </FormField>
          
          <FormField>
            <Label>Reason for Request *</Label>
            <StyledTextField
              placeholder="Explain why this shift is needed..."
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              fullWidth
            />
          </FormField>
        </FormRow>
      </FormCard>

      <FormCard>
        <SectionTitle>Assigned Workers</SectionTitle>
        
        <WorkersSection>
          {selectedWorkers.map((worker) => (
            <WorkerRow key={worker.id}>
              <WorkerInfo>
                <WorkerAvatar>{worker.name.charAt(0)}</WorkerAvatar>
                <WorkerDetails>
                  <WorkerName>{worker.name}</WorkerName>
                  <WorkerRole>{worker.role}</WorkerRole>
                </WorkerDetails>
              </WorkerInfo>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveWorker(worker.id)}
                sx={{ color: colors.status.error }}
              >
                <Remove sx={{ fontSize: 20 }} />
              </IconButton>
            </WorkerRow>
          ))}
          
          <AddWorkerButton onClick={handleAddWorker}>
            <Add sx={{ fontSize: 20 }} />
            Add Worker
          </AddWorkerButton>
        </WorkersSection>
      </FormCard>

      {error && (
        <Box sx={{ 
          color: colors.status.error, 
          fontFamily: "'Outfit', sans-serif", 
          fontSize: '14px',
          mt: 2,
          p: 2,
          backgroundColor: '#FEE2E2',
          borderRadius: '8px',
          border: '1px solid #FCA5A5'
        }}>
          {error}
        </Box>
      )}

      <ActionButtons>
        <CancelButton onClick={handleCancel}>
          Cancel
        </CancelButton>
        <SaveButton 
          onClick={handleSave}
          disabled={isLoading || !formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location || !formData.payRate || !formData.reason}
        >
          <Save sx={{ fontSize: 18 }} />
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </SaveButton>
      </ActionButtons>
    </DashboardContainer>
  );
}

export default RequestShiftPage;
