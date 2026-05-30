import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  styled,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Avatar,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  LocationOn,
  AttachMoney,
  People,
  Work,
  Description,
  MoreVert,
  Search,
  FilterList,
  GetApp,
  Cancel,
  Edit,
  CheckCircle,
  Pending,
  Close,
  Business,
  ContentCopy,
  Campaign,
  PersonAdd,
} from '@mui/icons-material';
import { useGetClientShiftDetailsQuery } from '../../store/slices/clientDashboardSlice';
import { useCancelClientShiftMutation } from '../../store/slices/clientDashboardSlice';
import { colors } from '../../utilities/colors';
import { DashboardContainer } from '../../components/layout';
import { useDocumentTitle } from '../../hooks';

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
  marginBottom: '16px',
  '& .current': {
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const TitleRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px',
  flexWrap: 'wrap',
  gap: '16px',
});

const TitleLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const ShiftTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '24px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const StatusTag = styled('span')({
  padding: '4px 12px',
  borderRadius: '16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: '#FEF3C7',
  color: '#D97706',
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '12px',
});

const EditButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const DuplicateButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const MetaInfo = styled(Box)({
  display: 'flex',
  gap: '24px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  marginBottom: '24px',
  flexWrap: 'wrap',
  '& .label': { color: colors.text.secondary },
  '& .value': { fontWeight: 600, color: colors.primary.navy, marginLeft: '4px' },
});

const ContentGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '24px',
  marginBottom: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
});

const DetailsCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const CardTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 24px',
});

const DetailGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
});

const DetailItem = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
});

const DetailIcon = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: '#E0F2FE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: colors.primary.blue,
  '& svg': { fontSize: '20px' },
});

const DetailText = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: colors.text.secondary,
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
    marginTop: '2px',
  },
});

const SectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '24px 0 12px',
});

const SkillsRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
});

const SkillTag = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #E5E7EB',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.primary.navy,
  '& svg': { fontSize: '14px', color: colors.text.secondary },
});

const NotesText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  lineHeight: 1.6,
  margin: 0,
});

// Shift Status Card
const StatusCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const DonutChartContainer = styled(Box)({
  position: 'relative',
  width: '160px',
  height: '160px',
  margin: '16px 0 24px',
});

const DonutSvg = styled('svg')({
  width: '100%',
  height: '100%',
  transform: 'rotate(-90deg)',
});

const DonutCenter = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  '& .count': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    color: colors.primary.navy,
  },
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const StatusLegend = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const LegendItem = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '& .left': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  '& .dot': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: colors.text.secondary,
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

// Activity Section
const ActivitySection = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const ActivityHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
});

const ActivityTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const SearchFilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const SearchInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
  width: '240px',
});

const FilterButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const ExportButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.blue,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { opacity: 0.9 },
});

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
});

const Th = styled('th')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '1px solid #E5E7EB',
});

const Td = styled('td')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  padding: '16px',
  borderBottom: '1px solid #E5E7EB',
  verticalAlign: 'middle',
});

const WorkerCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const AvatarCircle = styled(Box)({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: '#E5E7EB',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const StatusBadge = styled('span')({
  padding: '4px 12px',
  borderRadius: '16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: '#F3F4F6',
  color: '#6B7280',
});

const ViewLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
});

// ============ HELPERS ============
const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'Not available';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (start: string | Date | undefined, end: string | Date | undefined) => {
  if (!start || !end) return 'Not available';
  const s = new Date(start);
  const e = new Date(end);
  const startTime = s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const endTime = e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const hours = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60) * 10) / 10;
  return `${startTime} - ${endTime} (${hours} hours)`;
};

const formatDateTime = (date: string | Date | undefined) => {
  if (!date) return 'Not available';
  const d = new Date(date);
  return `${d.toLocaleDateString('en-GB')} | ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const getShiftStatusLabel = (shift: any) => {
  const filled = shift._count?.assignments ?? shift.assignments?.length ?? 0;
  const total = shift.workersNeeded ?? 1;
  if (shift.status === 'COMPLETED') return 'Completed';
  if (shift.status === 'CANCELLED') return 'Cancelled';
  if (filled >= total) return 'Fully Filled';
  if (filled > 0) return 'Partially Filled';
  return 'Open';
};

const ClientShiftDetailsPage: React.FC = () => {
  useDocumentTitle('Shift Details');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: shift, isLoading, error } = useGetClientShiftDetailsQuery(id!, {
    skip: !id,
  });

  // Add detailed logging to debug the data structure
  console.log('=== Client Shift Details Debug ===');
  console.log('Shift ID from URL:', id);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);
  console.log('Raw shift data:', shift);
  console.log('Shift data keys:', shift ? Object.keys(shift) : 'No shift object');
  console.log('Shift title:', shift?.title);
  console.log('Shift startAt:', shift?.startAt);
  console.log('Shift endAt:', shift?.endAt);
  console.log('Shift payRate:', shift?.payRate);
  console.log('Shift workersNeeded:', shift?.workersNeeded);
  console.log('Shift assignments:', shift?.assignments);
  console.log('=====================================');

  const [cancelShift, { isLoading: isCancelling }] = useCancelClientShiftMutation();

  // Process data
  const assignments = useMemo(() => shift?.assignments ?? [], [shift]);
  const attendances = useMemo(() => shift?.attendances ?? [], [shift]);
  
  const filled = shift?._count?.assignments ?? assignments.length;
  const total = shift?.workersNeeded ?? 1;
  const percentage = total > 0 ? (filled / total) * 100 : 0;
  const circumference = 2 * Math.PI * 60;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const handleBack = () => {
    navigate('/client/shifts');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCancelShift = async () => {
    if (!id) {
      handleMenuClose();
      return;
    }

    // Check if shift can be cancelled (only OPEN shifts can be cancelled)
    if (shift?.status !== 'OPEN') {
      alert('This shift cannot be cancelled. Only open shifts can be cancelled.');
      handleMenuClose();
      return;
    }

    const confirmMessage = `Are you sure you want to cancel this shift?\n\nShift: ${shift?.title}\nDate: ${shift?.startAt ? formatDate(shift.startAt) : 'N/A'}\n\nThis action cannot be undone and will notify any assigned workers.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await cancelShift(id).unwrap();
        // Show success message
        alert('Shift cancelled successfully. You will be redirected to the shifts page.');
        navigate('/client/shifts');
      } catch (error: any) {
        console.error('Failed to cancel shift:', error);
        // Show more detailed error message
        const errorMessage = error?.data?.message || error?.message || 'Failed to cancel shift. Please try again.';
        alert(`Error cancelling shift: ${errorMessage}`);
      }
    }
    handleMenuClose();
  };

  const handleEditShift = () => {
    // Clients cannot edit shifts - only available to agencies
    console.log('Edit shift not available for clients');
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  if (error || !shift) {
    console.log('Shift Details Error:', error);
    console.log('Shift Data:', shift);
    console.log('Shift ID:', id);
    return (
      <DashboardContainer>
        <BackLink onClick={handleBack}>
          <ArrowBack sx={{ fontSize: 18 }} /> Go back
        </BackLink>
        <Box sx={{ textAlign: 'center', py: 8, color: colors.status.error }}>
          Shift not found or failed to load.
        </Box>
      </DashboardContainer>
    );
  }

  const fillPercentage = shift.workersNeeded > 0 
    ? Math.round((shift._count?.assignments || 0) / shift.workersNeeded * 100)
    : 0;

  return (
    <DashboardContainer>
      <BackLink onClick={handleBack}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <Breadcrumb>
        <span>Shifts</span>
        <span>{'>'}</span>
        <span className="current">Shift Details</span>
      </Breadcrumb>

      <TitleRow>
        <TitleLeft>
          <ShiftTitle>{shift.title}</ShiftTitle>
          <StatusTag>{getShiftStatusLabel(shift)}</StatusTag>
        </TitleLeft>
        <ActionButtons>
          {shift?.status === 'OPEN' && (
            <EditButton 
              onClick={handleCancelShift}
              disabled={isCancelling}
              sx={{ 
                backgroundColor: colors.status.error,
                '&:hover': { backgroundColor: colors.status.error + 'dd' },
                '&:disabled': { backgroundColor: colors.neutral.grey300 }
              }}
            >
              <Cancel sx={{ fontSize: 18 }} />
              {isCancelling ? 'Cancelling...' : 'Cancel Shift'}
            </EditButton>
          )}
          <DuplicateButton onClick={handleMenuClick}>
            <MoreVert sx={{ fontSize: 18 }} /> More Options
          </DuplicateButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem 
              onClick={handleCancelShift} 
              disabled={isCancelling || shift?.status !== 'OPEN'}
            >
              <Cancel sx={{ mr: 1 }} /> 
              {isCancelling ? 'Cancelling...' : 'Cancel Shift'}
            </MenuItem>
          </Menu>
        </ActionButtons>
      </TitleRow>

      <MetaInfo>
        <span><span className="label">Shift ID:</span><span className="value">#{shift.id?.slice(-8).toUpperCase() || 'N/A'}</span></span>
        <span><span className="label">Date Created:</span><span className="value">{formatDateTime(shift.createdAt)}</span></span>
      </MetaInfo>

      <ContentGrid>
        {/* Left - Shift Details */}
        <DetailsCard>
          <CardTitle>Shift Details</CardTitle>
          <DetailGrid>
            <DetailItem>
              <DetailIcon><CalendarToday /></DetailIcon>
              <DetailText>
                <div className="label">Date</div>
                <div className="value">{formatDate(shift.startAt)}</div>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon><AccessTime /></DetailIcon>
              <DetailText>
                <div className="label">Time</div>
                <div className="value">{formatTime(shift.startAt, shift.endAt)}</div>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon><Work /></DetailIcon>
              <DetailText>
                <div className="label">Department</div>
                <div className="value">{shift.role || 'General'}</div>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                <LocationOn />
              </DetailIcon>
              <DetailText>
                <div className="label">Location</div>
                <div className="value">{shift.siteLocation || 'Not specified'}</div>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon style={{ backgroundColor: '#D1FAE5', color: '#10B981' }}>
                <AttachMoney />
              </DetailIcon>
              <DetailText>
                <div className="label">Pay Rate (per hour)</div>
                <div className="value">{shift.payRate ? `£${shift.payRate}` : 'Not specified'}</div>
              </DetailText>
            </DetailItem>
          </DetailGrid>

          <SectionTitle>Skills & Requirements</SectionTitle>
          <SkillsRow>
            {shift.requiredSkills && shift.requiredSkills.length > 0 ? (
              shift.requiredSkills.map((rs: any) => (
                <SkillTag key={rs.skill?.id || rs.skillId}>
                  {rs.skill?.name || 'Skill'}
                </SkillTag>
              ))
            ) : (
              <span style={{ color: colors.text.secondary, fontSize: '14px' }}>No specific skills required</span>
            )}
          </SkillsRow>

          <SectionTitle>Notes</SectionTitle>
          <NotesText>{shift.notes || 'No additional notes'}</NotesText>
        </DetailsCard>

        {/* Right - Shift Status */}
        <StatusCard>
          <CardTitle>Shift Status</CardTitle>
          <DonutChartContainer>
            <DonutSvg viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#E5E7EB" strokeWidth="12" />
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke={colors.primary.blue}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
              />
            </DonutSvg>
            <DonutCenter>
              <div className="count">{filled}/{total}</div>
              <div className="label">Filled</div>
            </DonutCenter>
          </DonutChartContainer>

          <StatusLegend>
            <LegendItem>
              <div className="left">
                <div className="dot" style={{ backgroundColor: colors.primary.blue }} />
                <span className="name">Total workers needed</span>
              </div>
              <span className="value">{total}</span>
            </LegendItem>
            <LegendItem>
              <div className="left">
                <div className="dot" style={{ backgroundColor: '#E5E7EB' }} />
                <span className="name">Unfilled Slots</span>
              </div>
              <span className="value">{total - filled}</span>
            </LegendItem>
          </StatusLegend>
        </StatusCard>
      </ContentGrid>

      {/* Worker Acceptance Status */}
      <ActivitySection>
        <ActivityHeader>
          <ActivityTitle>Worker Acceptance Status ({assignments.length})</ActivityTitle>
          <SearchFilterRow>
            <SearchInput
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FilterButton>
              <FilterList sx={{ fontSize: 18 }} />
              Filter
            </FilterButton>
            <ExportButton>
              Export as CSV <GetApp sx={{ fontSize: 18 }} />
            </ExportButton>
          </SearchFilterRow>
        </ActivityHeader>

        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
              <Th>Worker</Th>
              <Th>Acceptance Status</Th>
              <Th>Assigned Time</Th>
              <Th>Contact</Th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <Td colSpan={5} style={{ textAlign: 'center', color: colors.text.secondary }}>
                  No workers assigned to this shift yet.
                </Td>
              </tr>
            ) : (
              assignments.map((assignment: any) => {
                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'ACCEPTED':
                      return <CheckCircle sx={{ color: '#059669', fontSize: 16 }} />;
                    case 'PENDING':
                      return <Pending sx={{ color: '#F59E0B', fontSize: 16 }} />;
                    case 'REJECTED':
                      return <Close sx={{ color: '#EF4444', fontSize: 16 }} />;
                    default:
                      return <Pending sx={{ color: '#9CA3AF', fontSize: 16 }} />;
                  }
                };

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'ACCEPTED':
                      return '#059669';
                    case 'PENDING':
                      return '#F59E0B';
                    case 'REJECTED':
                      return '#EF4444';
                    default:
                      return '#9CA3AF';
                  }
                };
                
                return (
                  <tr key={assignment.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <WorkerCell>
                        <AvatarCircle>
                          {assignment.worker?.fullName?.charAt(0) || 'W'}
                        </AvatarCircle>
                        {assignment.worker?.fullName || 'Unknown Worker'}
                      </WorkerCell>
                    </Td>
                    <Td>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusIcon(assignment.status)}
                        <Chip
                          label={assignment.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(assignment.status) + '20',
                            color: getStatusColor(assignment.status),
                            fontWeight: 600,
                            fontSize: '12px'
                          }}
                        />
                      </Box>
                    </Td>
                    <Td>
                      {assignment.createdAt ? formatDateTime(assignment.createdAt) : '-'}
                    </Td>
                    <Td>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.worker?.email}
                      </Typography>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </ActivitySection>
    </DashboardContainer>
  );
};

export default ClientShiftDetailsPage;
