import { useState } from 'react';
import { Close, CheckCircle } from '@mui/icons-material';
import { Box, styled, TextField, Modal, IconButton, CircularProgress, InputAdornment, MenuItem, Button, Chip, Typography } from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  AttachMoney,
  People,
  LocationOn,
  Work,
  Description,
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { useRequestWorkersMutation } from '../../store/slices/clientDashboardSlice';

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

const FormGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginBottom: '16px',
});

const FullWidthField = styled(Box)({
  gridColumn: '1 / -1',
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

const SkillChip = styled(Chip)({
  margin: '2px',
  '& .MuiChip-deleteIcon': {
    color: colors.text.secondary,
  },
});

const SkillsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginTop: '8px',
  minHeight: '40px',
  padding: '8px',
  border: `1px solid ${colors.border.light}`,
  borderRadius: '8px',
  backgroundColor: colors.background.secondary,
});

const ActionsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
});

// ============ PROPS ============
interface RequestNewShiftModalProps {
  open: boolean;
  onClose: () => void;
}

// ============ COMPONENT ============
export function RequestNewShiftModal({ open, onClose }: RequestNewShiftModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [shiftTitle, setShiftTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState('');
  const [payRate, setPayRate] = useState('');
  const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [requestWorkers, { isLoading }] = useRequestWorkersMutation();

  const handleSkillAdd = () => {
    if (currentSkill.trim() && !skillsRequired.includes(currentSkill.trim())) {
      setSkillsRequired([...skillsRequired, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleSkillDelete = (skillToDelete: string) => {
    setSkillsRequired(skillsRequired.filter((skill) => skill !== skillToDelete));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!shiftTitle.trim()) {
      setError('Shift title is required');
      return;
    }
    if (!department.trim()) {
      setError('Department is required');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }
    if (!startTime) {
      setError('Start time is required');
      return;
    }
    if (!endTime) {
      setError('End time is required');
      return;
    }
    if (!workersNeeded.trim()) {
      setError('Number of workers needed is required');
      return;
    }

    try {
      await requestWorkers({
        siteLocation: location,
        role: department,
        date,
        startTime,
        endTime,
        workersNeeded: parseInt(workersNeeded),
        notes: notes || undefined,
      }).unwrap();
      
      setStep('success');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to create shift request. Please try again.');
    }
  };

  const handleClose = () => {
    setStep('form');
    setShiftTitle('');
    setDepartment('');
    setLocation('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setWorkersNeeded('');
    setPayRate('');
    setSkillsRequired([]);
    setCurrentSkill('');
    setResponsibility('');
    setNotes('');
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
              <ModalTitle>Request New Shift</ModalTitle>
              <ModalSubtitle>
                Fill in the details below to request workers for your shift
              </ModalSubtitle>

              <FormGrid>
                <FormGroup>
                  <Label>Shift Title<span className="required">*</span></Label>
                  <StyledInput
                    placeholder="e.g., Night Shift Ward B"
                    value={shiftTitle}
                    onChange={(e) => setShiftTitle(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Department<span className="required">*</span></Label>
                  <StyledInput
                    select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <MenuItem value="ICU">ICU</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                    <MenuItem value="General Ward">General Ward</MenuItem>
                    <MenuItem value="Surgery">Surgery</MenuItem>
                    <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                    <MenuItem value="Maternity">Maternity</MenuItem>
                    <MenuItem value="Mental Health">Mental Health</MenuItem>
                    <MenuItem value="Rehabilitation">Rehabilitation</MenuItem>
                  </StyledInput>
                </FormGroup>

                <FormGroup>
                  <Label>Location<span className="required">*</span></Label>
                  <StyledInput
                    placeholder="e.g., St Jude Hospital - Ward B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Date<span className="required">*</span></Label>
                  <StyledInput
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Start Time<span className="required">*</span></Label>
                  <StyledInput
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>End Time<span className="required">*</span></Label>
                  <StyledInput
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Workers Needed<span className="required">*</span></Label>
                  <StyledInput
                    type="number"
                    placeholder="e.g., 4"
                    value={workersNeeded}
                    onChange={(e) => setWorkersNeeded(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 1, max: 50 }}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Pay Rate (per hour)</Label>
                  <StyledInput
                    type="number"
                    placeholder="e.g., 15.00"
                    value={payRate}
                    onChange={(e) => setPayRate(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0, step: 0.50 }}
                  />
                </FormGroup>
              </FormGrid>

              <FullWidthField>
                <Label>Skills Required (Optional)</Label>
                <Box sx={{ display: 'flex', gap: '8px', mb: '8px' }}>
                  <StyledInput
                    placeholder="Add a skill (e.g., CPR Certified)"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleSkillAdd}
                    disabled={!currentSkill.trim()}
                    size="small"
                  >
                    Add
                  </Button>
                </Box>
                <SkillsContainer>
                  {skillsRequired.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No skills added. Add skills above if specific qualifications are required.
                    </Typography>
                  ) : (
                    skillsRequired.map((skill, index) => (
                      <SkillChip
                        key={index}
                        label={skill}
                        onDelete={() => handleSkillDelete(skill)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))
                  )}
                </SkillsContainer>
              </FullWidthField>

              <FullWidthField>
                <Label>Responsibility & Duties</Label>
                <StyledInput
                  multiline
                  rows={3}
                  placeholder="Describe the main responsibilities and duties for this shift..."
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: '12px' }}>
                        <Work />
                      </InputAdornment>
                    ),
                  }}
                />
              </FullWidthField>

              <FullWidthField>
                <Label>Notes (Optional)</Label>
                <StyledInput
                  multiline
                  rows={3}
                  placeholder="Any additional information or special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: '12px' }}>
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                />
              </FullWidthField>

              {error && <ErrorText>{error}</ErrorText>}

              <ActionsContainer>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <SubmitButton onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Submit Shift Request'}
                </SubmitButton>
              </ActionsContainer>
            </>
          ) : (
            <>
              <SuccessIcon><CheckCircle /></SuccessIcon>
              <ModalTitle>Shift Request Successful</ModalTitle>
              <SuccessText>
                Your shift request for "{shiftTitle}" has been successfully submitted. 
                We'll notify you once suitable workers are found and assigned to your shift.
              </SuccessText>
              <DoneButton onClick={handleClose}>Done</DoneButton>
            </>
          )}
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}

export default RequestNewShiftModal;
