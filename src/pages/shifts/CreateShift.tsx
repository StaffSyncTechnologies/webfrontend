import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowBack,
  AccessTime,
  CalendarToday,
  Close,
  ArrowForward,
} from '@mui/icons-material';
import { Box, styled, TextField, Select, MenuItem, Chip, CircularProgress, Alert, Button } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useCreateShiftMutation, useGetShiftDetailQuery } from '../../store/slices/shiftSlice';
import { useGetClientsQuery } from '../../store/slices/organizationSlice';
import { useGetSkillsQuery } from '../../store/slices/skillSlice';
import { FrontendGeocodingService } from '../../utils/geocoding';
import { LeafletPicker } from '../../components/map';
import { geocodeWithFallback, resolvePendingGeocode, rejectPendingGeocode } from '../../utils/geocodeWithFallback';

// ============ STYLED COMPONENTS ============
const BackLink = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  marginBottom: '8px',
  '&:hover': { textDecoration: 'underline' },
});

const Breadcrumb = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  marginBottom: '24px',
  '& .current': {
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const CreateButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
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

const FormCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '32px',
});

const FormTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px',
});

const FormSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 32px',
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  marginBottom: '24px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

const FormGroup = styled(Box)({});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  marginBottom: '8px',
  '& .required': {
    color: colors.status.error,
  },
});

const StyledInput = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#D1D5DB' },
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

const SkillsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '12px',
});

const SkillChip = styled(Chip)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  borderRadius: '6px',
  backgroundColor: '#F3F4F6',
  '& .MuiChip-deleteIcon': {
    fontSize: '16px',
    color: colors.text.secondary,
  },
});

const NotesInput = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const ButtonRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  marginTop: '32px',
});

const CancelButton = styled('button')({
  padding: '14px 24px',
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

const SubmitButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px 24px',
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

// ============ COMPONENT ============
export function CreateShift() {
  useDocumentTitle('Create New Shift');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');

  // Form state
  const [title, setTitle] = useState('');
  const [clientCompanyId, setClientCompanyId] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState<number>(1);
  const [payRate, setPayRate] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [shiftStatus, setShiftStatus] = useState<'OPEN' | 'DRAFT'>('OPEN');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // GPS coordinates display state
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Leaflet picker fallback state
  const [showLeafletPicker, setShowLeafletPicker] = useState(false);

  // API calls
  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
  const { data: clientsData } = useGetClientsQuery();
  const { data: skillsData } = useGetSkillsQuery();
  const { data: duplicateShift } = useGetShiftDetailQuery(duplicateId!, { skip: !duplicateId });

  // Extract arrays from potentially wrapped API responses
  const clients = useMemo(() => {
    if (!clientsData) return [];
    if (Array.isArray(clientsData)) return clientsData;
    if (Array.isArray((clientsData as any)?.data)) return (clientsData as any).data;
    return [];
  }, [clientsData]);

  const skills = useMemo(() => {
    if (!skillsData) return [];
    if (Array.isArray(skillsData)) return skillsData;
    // Backend returns { skills: [...], grouped: {...} }
    if (Array.isArray((skillsData as any)?.skills)) return (skillsData as any).skills;
    if (Array.isArray((skillsData as any)?.data?.skills)) return (skillsData as any).data.skills;
    if (Array.isArray((skillsData as any)?.data)) return (skillsData as any).data;
    return [];
  }, [skillsData]);

  // Pre-fill form when duplicating
  useEffect(() => {
    if (duplicateShift) {
      setTitle(duplicateShift.title);
      setClientCompanyId(duplicateShift.clientCompanyId || '');
      setSiteLocation(duplicateShift.siteLocation || duplicateShift.location?.name || '');
      setWorkersNeeded(duplicateShift.workersNeeded || 1);
      setPayRate(duplicateShift.payRate?.toString() || '');
      setSelectedSkillIds(duplicateShift.requiredSkills?.map((rs: any) => rs.skillId) || []);
      setNotes(duplicateShift.notes || '');
      setPriority(duplicateShift.priority || 'NORMAL');
      setShiftStatus((duplicateShift.status === 'DRAFT' ? 'DRAFT' : 'OPEN') as 'OPEN' | 'DRAFT');
    }
  }, [duplicateShift]);

  const handleRemoveSkill = (skillIdToRemove: string) => {
    setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillIdToRemove));
  };

  const handleAddSkill = (skillId: string) => {
    if (skillId && !selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  // 🎯 Live geocoding when address changes (with Leaflet fallback)
  const handleAddressChange = async (address: string) => {
    setSiteLocation(address);
    setLocationError(null);
    
    if (!address || address.trim().length < 3) {
      setCurrentCoordinates(null);
      return;
    }
    
    setIsGeocoding(true);
    
    try {
      // Use the geocodeWithFallback utility
      const coordinates = await geocodeWithFallback(address, () => {
        setShowLeafletPicker(true);
      });
      
      if (coordinates) {
        setCurrentCoordinates(coordinates);
        setLocationError(null);
      }
    } catch (error) {
      setCurrentCoordinates(null);
      setLocationError('Geocoding failed');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Leaflet picker handlers
  const handleLeafletConfirm = (coords: { lat: number; lng: number }) => {
    setCurrentCoordinates(coords);
    setShowLeafletPicker(false);
    resolvePendingGeocode(coords);
  };

  const handleLeafletClose = () => {
    setShowLeafletPicker(false);
    rejectPendingGeocode(new Error('User cancelled location selection'));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!title.trim()) {
      setError('Shift title is required');
      return;
    }
    if (!siteLocation.trim()) {
      setError('Site location is required');
      return;
    }
    if (!date || !startTime || !endTime) {
      setError('Date and time are required');
      return;
    }

    try {
      const startAt = new Date(`${date}T${startTime}:00`);
      const endAt = new Date(`${date}T${endTime}:00`);
      
      // Handle overnight shifts
      if (endAt <= startAt) {
        endAt.setDate(endAt.getDate() + 1);
      }

      // 🎯 Geocode the address in frontend first
      console.log('🌐 Geocoding address:', siteLocation);
      const coordinates = await FrontendGeocodingService.geocodeAddress(siteLocation);
      
      if (!coordinates) {
        console.warn('⚠️ Geocoding failed, creating shift without coordinates');
      } else {
        console.log('✅ Geocoded successfully:', coordinates);
      }

      await createShift({
        title: title.trim(),
        clientCompanyId: clientCompanyId || undefined,
        siteLocation: siteLocation || undefined,
        siteLat: coordinates?.lat,
        siteLng: coordinates?.lng,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        workersNeeded,
        payRate: payRate ? parseFloat(payRate) : undefined,
        requiredSkills: selectedSkillIds.length > 0 ? selectedSkillIds.map(id => ({ skillId: id })) : undefined,
        notes: notes || undefined,
        priority,
        status: shiftStatus,
      } as any).unwrap();

      setSuccess('Shift created successfully!');
      setTimeout(() => navigate('/shifts'), 1500);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to create shift');
    }
  };

  const getSkillName = (skillId: string) => {
    return skills.find((s: any) => s.id === skillId)?.name || 'Unknown Skill';
  };

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/shifts')}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <HeaderRow>
        <Breadcrumb>
          <span>Shifts</span>
          <span>{'>'}</span>
          <span className="current">Create New Shift</span>
        </Breadcrumb>
        <CreateButton onClick={() => navigate('/shifts/create')}>
          + Create new shift
        </CreateButton>
      </HeaderRow>

      <FormCard>
        <FormTitle>{duplicateId ? 'Duplicate Shift' : 'Create New Shift'}</FormTitle>
        <FormSubtitle>Fill in the details below. Choose <strong>Open Shift</strong> to let workers browse and claim it, or <strong>Draft</strong> to assign workers manually later.</FormSubtitle>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <FormRow>
          <FormGroup>
            <Label>Shift Title<span className="required">*</span></Label>
            <StyledInput 
              placeholder="e.g registered nurse-night shift" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Client</Label>
            <StyledSelect 
              displayEmpty 
              value={clientCompanyId}
              onChange={(e) => setClientCompanyId(e.target.value as string)}
            >
              <MenuItem value=""><em style={{ color: '#9CA3AF', fontStyle: 'normal' }}>Select Client (optional)</em></MenuItem>
              {clients.map((client: any) => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
            </StyledSelect>
          </FormGroup>
        </FormRow>

        {/* Shift Type Toggle */}
        <Box sx={{ mb: 3 }}>
          <Label>Shift Type</Label>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {(['OPEN', 'DRAFT'] as const).map((s) => (
              <Box
                key={s}
                onClick={() => setShiftStatus(s)}
                sx={{
                  flex: 1,
                  p: 2,
                  border: `2px solid ${shiftStatus === s ? colors.primary.navy : '#E5E7EB'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor: shiftStatus === s ? '#F0F4FF' : '#FAFAFA',
                  transition: 'all 0.15s',
                }}
              >
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: shiftStatus === s ? colors.primary.navy : '#374151', mb: 0.5 }}>
                  {s === 'OPEN' ? '🟢 Open Shift' : '📋 Draft'}
                </Box>
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#6B7280' }}>
                  {s === 'OPEN'
                    ? 'Visible to workers — they can browse and claim it'
                    : 'Hidden from workers — assign specific workers manually'}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <FormRow>
          <FormGroup>
            <Label>Site Location *</Label>
            <StyledInput 
              placeholder="Enter shift location (e.g. Westminster Street, Crewe)" 
              value={siteLocation}
              onChange={(e) => handleAddressChange(e.target.value)}
              required
            />
            
            {/* 📍 Live Coordinates Display */}
            {isGeocoding && (
              <Box sx={{ mt: 1, fontSize: 12, color: '#666', fontFamily: "'Outfit', sans-serif" }}>
                🌐 Geocoding address...
              </Box>
            )}
            
            {currentCoordinates && (
              <Box sx={{ 
                mt: 1, 
                p: 2, 
                border: '1px solid #4caf50', 
                borderRadius: 1, 
                backgroundColor: '#f8fff8',
                fontFamily: "'Outfit', sans-serif"
              }}>
                <Box sx={{ fontSize: 13, fontWeight: 500, color: '#2e7d32', mb: 1 }}>
                  ✅ Location Coordinates Found:
                </Box>
                <Box sx={{ fontSize: 12, color: '#333', fontFamily: 'monospace' }}>
                  📍 Latitude: {currentCoordinates.lat.toFixed(6)}<br/>
                  📍 Longitude: {currentCoordinates.lng.toFixed(6)}<br/>
                </Box>
              </Box>
            )}
            
            {locationError && (
              <Box sx={{ 
                mt: 1, 
                p: 2, 
                border: '1px solid #f44336', 
                borderRadius: 1, 
                backgroundColor: '#fff8f8',
                fontFamily: "'Outfit', sans-serif"
              }}>
                <Box sx={{ fontSize: 13, fontWeight: 500, color: '#d32f2f' }}>
                  ❌ {locationError}
                </Box>
                <Box sx={{ fontSize: 11, color: '#666', mt: 1 }}>
                  Try a more specific address (e.g. "Street Name, City")
                </Box>
              </Box>
            )}
            
            {/* Location Coordinates Section */}
            <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ fontSize: 14, fontWeight: 500, color: '#666', mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                📍 Shift Location Coordinates (for worker matching)
              </Box>
              
              <Box sx={{ fontSize: 12, color: 'text.secondary', fontFamily: "'Outfit', sans-serif", mb: 2 }}>
                Coordinates will be automatically generated from your site location address
              </Box>
              
              {/* Manual location picker button */}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowLeafletPicker(true)}
                sx={{ 
                  mb: 2,
                  textTransform: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  borderColor: colors.primary.navy,
                  color: colors.primary.navy,
                  '&:hover': {
                    borderColor: colors.primary.blue,
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                🗺️ Select Location on Map
              </Button>
            </Box>
            
            {locationError && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {locationError}
              </Alert>
            )}
          </FormGroup>
          <FormGroup>
            <Label>Priority</Label>
            <StyledSelect 
              displayEmpty 
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">🔴 Urgent</MenuItem>
            </StyledSelect>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Date<span className="required">*</span></Label>
            <StyledInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputProps={{
                endAdornment: <CalendarToday sx={{ color: '#9CA3AF', fontSize: 20 }} />,
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label>Workers Needed<span className="required">*</span></Label>
            <StyledSelect 
              value={workersNeeded}
              onChange={(e) => setWorkersNeeded(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50].map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </StyledSelect>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Start Time<span className="required">*</span></Label>
            <StyledInput
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputProps={{
                endAdornment: <AccessTime sx={{ color: '#9CA3AF', fontSize: 20 }} />,
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
                endAdornment: <AccessTime sx={{ color: '#9CA3AF', fontSize: 20 }} />,
              }}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Pay Rate (per hour)</Label>
            <StyledInput 
              placeholder="Enter amount per hour (e.g. 15.50)" 
              type="number"
              value={payRate}
              onChange={(e) => setPayRate(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Skills Required</Label>
            <StyledSelect 
              displayEmpty 
              value=""
              onChange={(e) => handleAddSkill(e.target.value as string)}
            >
              <MenuItem value="" disabled><em style={{ color: '#9CA3AF', fontStyle: 'normal' }}>Select skills to add</em></MenuItem>
              {skills.filter((s: any) => !selectedSkillIds.includes(s.id)).map((skill: any) => (
                <MenuItem key={skill.id} value={skill.id}>{skill.name}</MenuItem>
              ))}
            </StyledSelect>
            <SkillsContainer>
              {selectedSkillIds.map((skillId) => (
                <SkillChip
                  key={skillId}
                  label={getSkillName(skillId)}
                  onDelete={() => handleRemoveSkill(skillId)}
                  deleteIcon={<Close />}
                />
              ))}
            </SkillsContainer>
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Notes (optional)</Label>
          <NotesInput
            placeholder="Include additional important information....."
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormGroup>

        <ButtonRow>
          <CancelButton onClick={() => navigate('/shifts')}>Cancel</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? <CircularProgress size={18} color="inherit" /> : (
              <>Post Shift <ArrowForward sx={{ fontSize: 18 }} /></>
            )}
          </SubmitButton>
        </ButtonRow>
      </FormCard>
      
      {/* Leaflet Picker Fallback */}
      <LeafletPicker
        open={showLeafletPicker}
        onClose={handleLeafletClose}
        onConfirm={handleLeafletConfirm}
        initialAddress={siteLocation}
        initialCoordinates={currentCoordinates || undefined}
      />
    </DashboardContainer>
  );
}

export default CreateShift;
