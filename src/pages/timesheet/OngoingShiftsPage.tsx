import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  styled,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  Business,
  Logout,
  Refresh,
} from '@mui/icons-material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useGetOngoingShiftsQuery, useAdminClockOutMutation } from '../../store/slices/attendanceSlice';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

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

const ShiftCard = styled(Card)(({ isOverdue }: { isOverdue: boolean }) => ({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: isOverdue ? '2px solid #ef4444' : '1px solid #E5E7EB',
  position: 'relative',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const WorkerInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
});

const WorkerAvatar = styled(Avatar)({
  marginRight: '12px',
  backgroundColor: '#6366f1',
});

const WorkerName = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
});

const ShiftDetails = styled(Box)({
  marginBottom: '16px',
});

const ShiftTitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '8px',
});

const DetailRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
});

const DetailText = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
});

const TimeGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginBottom: '16px',
});

const TimeItem = styled(Box)({});

const TimeLabel = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const TimeValue = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
});

const ClockOutButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 600,
  textTransform: 'none',
});

interface OngoingShift {
  attendanceId: string;
  worker: {
    id: string;
    fullName: string;
    email: string;
    profilePicUrl?: string | null;
  };
  shiftId?: string;
  rotaShiftId?: string;
  shiftTitle: string;
  location: string;
  clientCompany: string;
  clockInAt: string;
  shiftStart: string;
  shiftEnd: string;
  currentHoursWorked: number;
  isOverdue: boolean;
}

interface OngoingShiftsResponse {
  shifts: OngoingShift[];
}

export function OngoingShiftsPage() {
  useDocumentTitle('Ongoing Shifts');
  const navigate = useNavigate();

  const { data: shiftsData, isLoading: loading, refetch, error: fetchError } = useGetOngoingShiftsQuery();
  const [adminClockOut, { isLoading: clockingOut }] = useAdminClockOutMutation();

  const [error, setError] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<OngoingShift | null>(null);
  const [clockOutReason, setClockOutReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const shifts = shiftsData?.shifts || [];

  const handleClockOut = async () => {
    if (!selectedShift || !clockOutReason.trim()) return;

    try {
      await adminClockOut({ attendanceId: selectedShift.attendanceId, reason: clockOutReason }).unwrap();
      setSuccessMessage('Worker clocked out successfully');
      setSelectedShift(null);
      setClockOutReason('');
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to clock out worker');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    refetch();
    // Refresh every 30 seconds
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <DashboardContainer>
      <HeaderRow>
        <Box>
          <PageTitle>Ongoing Shifts</PageTitle>
          <PageSubtitle>Workers currently clocked in to their shifts</PageSubtitle>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={loading}
          variant="outlined"
          sx={{
            borderColor: '#00AFEF',
            color: '#00AFEF',
            fontFamily: "'Outfit', sans-serif",
            '&:hover': {
              borderColor: '#0099D6',
              color: '#0099D6',
              backgroundColor: 'rgba(0, 175, 239, 0.04)',
            },
          }}
        >
          Refresh
        </Button>
      </HeaderRow>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error || 'Failed to fetch ongoing shifts'}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : shifts.length === 0 ? (
        <Alert severity="info">No ongoing shifts at the moment</Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {shifts.map((shift: OngoingShift) => (
            <ShiftCard key={shift.attendanceId} isOverdue={shift.isOverdue}>
              {shift.isOverdue && (
                <Chip
                  label="Overdue"
                  color="error"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                  }}
                />
              )}
              <CardContent>
                <WorkerInfo>
                  <WorkerAvatar
                    src={shift.worker.profilePicUrl || undefined}
                  >
                    {shift.worker.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </WorkerAvatar>
                  <Box>
                    <WorkerName variant="h6">
                      {shift.worker.fullName}
                    </WorkerName>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", color: colors.text.secondary }}>
                      {shift.worker.email}
                    </Typography>
                  </Box>
                </WorkerInfo>

                <ShiftDetails>
                  <ShiftTitle variant="subtitle2">
                    {shift.shiftTitle}
                  </ShiftTitle>
                  <DetailRow>
                    <Business fontSize="small" sx={{ color: colors.text.secondary }} />
                    <DetailText>
                      {shift.clientCompany}
                    </DetailText>
                  </DetailRow>
                  <DetailRow>
                    <LocationOn fontSize="small" sx={{ color: colors.text.secondary }} />
                    <DetailText>
                      {shift.location}
                    </DetailText>
                  </DetailRow>
                </ShiftDetails>

                <TimeGrid>
                  <TimeItem>
                    <TimeLabel>Clocked In</TimeLabel>
                    <TimeValue>{formatTime(shift.clockInAt)}</TimeValue>
                  </TimeItem>
                  <TimeItem>
                    <TimeLabel>Hours Worked</TimeLabel>
                    <TimeValue>{shift.currentHoursWorked.toFixed(1)}h</TimeValue>
                  </TimeItem>
                  <TimeItem>
                    <TimeLabel>Shift Start</TimeLabel>
                    <TimeValue>{formatTime(shift.shiftStart)}</TimeValue>
                  </TimeItem>
                  <TimeItem>
                    <TimeLabel>Shift End</TimeLabel>
                    <TimeValue>{formatTime(shift.shiftEnd)}</TimeValue>
                  </TimeItem>
                </TimeGrid>

                <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", color: colors.text.secondary, display: 'block', mb: 2 }}>
                  {formatDate(shift.clockInAt)}
                </Typography>

                <ClockOutButton
                  variant="contained"
                  color="error"
                  startIcon={<Logout />}
                  fullWidth
                  onClick={() => setSelectedShift(shift)}
                  sx={{
                    bgcolor: '#ef4444',
                    '&:hover': { bgcolor: '#dc2626' },
                  }}
                >
                  Clock Out Worker
                </ClockOutButton>
              </CardContent>
            </ShiftCard>
          ))}
        </Box>
      )}

      <Dialog open={!!selectedShift} onClose={() => setSelectedShift(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Clock Out Worker</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ fontFamily: "'Outfit', sans-serif", mb: 2 }}>
                You are about to clock out <strong>{selectedShift.worker.fullName}</strong> from their shift.
              </Typography>
              <TextField
                fullWidth
                label="Reason (required)"
                multiline
                rows={3}
                value={clockOutReason}
                onChange={(e) => setClockOutReason(e.target.value)}
                placeholder="Enter the reason for clocking out this worker..."
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: "'Outfit', sans-serif",
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: "'Outfit', sans-serif",
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedShift(null)} disabled={clockingOut} sx={{ fontFamily: "'Outfit', sans-serif" }}>
            Cancel
          </Button>
          <Button
            onClick={handleClockOut}
            variant="contained"
            color="error"
            disabled={!clockOutReason.trim() || clockingOut}
            startIcon={clockingOut ? <CircularProgress size={20} /> : <Logout />}
            sx={{
              fontFamily: "'Outfit', sans-serif",
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': {
                bgcolor: colors.text.secondary,
              },
            }}
          >
            {clockingOut ? 'Clocking Out...' : 'Clock Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
}

export default OngoingShiftsPage;
