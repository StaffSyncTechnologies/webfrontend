import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  styled,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  AttachMoney,
  People,
  LocationOn,
  Work,
  Description,
  Close,
} from '@mui/icons-material';
import { useRequestWorkersMutation } from '../../store/slices/clientDashboardSlice';
import { colors } from '../../utilities/colors';

const PageContainer = styled(Box)({
  padding: '24px',
  backgroundColor: colors.secondary.white,
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
});

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
});

const BackButton = styled(Button)({
  color: colors.primary.navy,
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 600,
  '& .MuiButton-startIcon': {
    marginRight: '8px',
  },
});

const Title = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 16px 0',
});

const Subtitle = styled('p')({
  fontSize: '16px',
  color: colors.text.secondary,
  margin: '0 0 32px 0',
});

const FormGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  marginBottom: '32px',
});

const FullWidthField = styled(Box)({
  gridColumn: '1 / -1',
});

const ActionsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '16px',
});

const SkillChip = styled(Chip)({
  margin: '4px',
  '& .MuiChip-deleteIcon': {
    color: colors.text.secondary,
  },
});

const SkillsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '8px',
  minHeight: '40px',
  padding: '8px',
  border: `1px solid ${colors.border.light}`,
  borderRadius: '8px',
  backgroundColor: colors.background.secondary,
});

const RequestNewShift: React.FC = () => {
  const navigate = useNavigate();

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

  const [requestWorkers, { isLoading, error }] = useRequestWorkersMutation();

  const handleSkillAdd = () => {
    if (currentSkill.trim() && !skillsRequired.includes(currentSkill.trim())) {
      setSkillsRequired([...skillsRequired, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleSkillDelete = (skillToDelete: string) => {
    setSkillsRequired(skillsRequired.filter((skill) => skill !== skillToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shiftTitle || !department || !location || !date || !startTime || !endTime || !workersNeeded) {
      alert('Please fill in all required fields');
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

      navigate('/client/shifts');
    } catch (err) {
      console.error('Failed to create shift request:', err);
    }
  };

  const handleCancel = () => {
    navigate('/client/shifts');
  };

  return (
    <PageContainer>
      <Header>
        <BackButton startIcon={<ArrowBack />} onClick={handleCancel}>
          Back to Shifts
        </BackButton>
      </Header>

      <Title>Request New Shift</Title>
      <Subtitle>
        Fill in the details below to request workers for your shift. We'll notify you once suitable workers are found.
      </Subtitle>

      {error && (
        <Alert severity="error" sx={{ mb: '24px' }}>
          Failed to create shift request. Please try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormGrid>
          <TextField
            label="Shift Title"
            value={shiftTitle}
            onChange={(e) => setShiftTitle(e.target.value)}
            required
            fullWidth
            placeholder="e.g., Night Shift Ward B"
          />

          <TextField
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            fullWidth
            select
          >
            <MenuItem value="ICU">ICU</MenuItem>
            <MenuItem value="Emergency">Emergency</MenuItem>
            <MenuItem value="General Ward">General Ward</MenuItem>
            <MenuItem value="Surgery">Surgery</MenuItem>
            <MenuItem value="Pediatrics">Pediatrics</MenuItem>
            <MenuItem value="Maternity">Maternity</MenuItem>
            <MenuItem value="Mental Health">Mental Health</MenuItem>
            <MenuItem value="Rehabilitation">Rehabilitation</MenuItem>
          </TextField>

          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            fullWidth
            placeholder="e.g., St Jude Hospital - Ward B"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />

          <TextField
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTime />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTime />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Workers Needed"
            type="number"
            value={workersNeeded}
            onChange={(e) => setWorkersNeeded(e.target.value)}
            required
            fullWidth
            placeholder="e.g., 4"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <People />
                </InputAdornment>
              ),
            }}
            inputProps={{ min: 1, max: 50 }}
          />

          <TextField
            label="Pay Rate (per hour)"
            type="number"
            value={payRate}
            onChange={(e) => setPayRate(e.target.value)}
            fullWidth
            placeholder="e.g., 15.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney />
                </InputAdornment>
              ),
            }}
            inputProps={{ min: 0, step: 0.50 }}
          />

          <FullWidthField>
            <Typography variant="subtitle2" sx={{ mb: '8px', fontWeight: 600 }}>
              Skills Required (Optional)
            </Typography>
            <Box sx={{ display: 'flex', gap: '8px', mb: '8px' }}>
              <TextField
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
                  />
                ))
              )}
            </SkillsContainer>
          </FullWidthField>

          <FullWidthField>
            <TextField
              label="Responsibility & Duties"
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the main responsibilities and duties for this shift..."
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
            <TextField
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Any additional information or special requirements..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: '12px' }}>
                    <Description />
                  </InputAdornment>
                ),
              }}
            />
          </FullWidthField>
        </FormGrid>

        <ActionsContainer>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Submitting...' : 'Submit Shift Request'}
          </Button>
        </ActionsContainer>
      </form>
    </PageContainer>
  );
};

export default RequestNewShift;
