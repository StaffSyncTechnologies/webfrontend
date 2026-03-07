import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  Business,
  LocationOn,
  AttachMoney,
  Edit,
  ContentCopy,
  Search,
  FilterList,
  FileDownload,
  Close,
  Campaign,
  PersonAdd,
  Cancel,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Checkbox, CircularProgress } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { 
  useGetShiftDetailQuery, 
  useBroadcastShiftMutation,
  useGetShiftAssignmentsQuery,
  useCancelShiftMutation,
  useRemoveAssignmentMutation,
} from '../../store/slices/shiftSlice';
import { AssignWorkerModal } from '../../components/shifts';

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

const BroadcastButton = styled('button')({
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
  marginTop: '24px',
  '&:hover': { backgroundColor: '#1a2d4a' },
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
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (start: string | Date, end: string | Date) => {
  const s = new Date(start);
  const e = new Date(end);
  const startTime = s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const endTime = e.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const hours = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60) * 10) / 10;
  return `${startTime} - ${endTime} (${hours} hours)`;
};

const formatDateTime = (date: string | Date) => {
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

// ============ COMPONENT ============
export function ShiftDetails() {
  useDocumentTitle('Shift Details');
  const navigate = useNavigate();
  const { id: shiftId } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // API calls
  const { data: shift, isLoading, error } = useGetShiftDetailQuery(shiftId!, { skip: !shiftId });
  const { data: assignmentsData } = useGetShiftAssignmentsQuery(shiftId!, { skip: !shiftId });
  const [broadcastShift, { isLoading: isBroadcasting }] = useBroadcastShiftMutation();
  const [cancelShift, { isLoading: isCancelling }] = useCancelShiftMutation();
  const [removeAssignment] = useRemoveAssignmentMutation();

  // Process data
  const assignments = useMemo(() => assignmentsData ?? [], [assignmentsData]);
  const attendances = useMemo(() => shift?.attendances ?? [], [shift]);
  
  const filled = shift?._count?.assignments ?? assignments.length;
  const total = shift?.workersNeeded ?? 1;
  const percentage = total > 0 ? (filled / total) * 100 : 0;
  const circumference = 2 * Math.PI * 60;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const handleBroadcast = async () => {
    if (shiftId) {
      try {
        await broadcastShift({ shiftId }).unwrap();
      } catch (err) {
        console.error('Failed to broadcast shift:', err);
      }
    }
  };

  const handleCancelShift = async () => {
    if (!shiftId) return;
    if (!window.confirm('Are you sure you want to cancel this shift? All assigned workers will be notified.')) return;
    
    try {
      await cancelShift(shiftId).unwrap();
      navigate('/shifts');
    } catch (err) {
      console.error('Failed to cancel shift:', err);
    }
  };

  const handleUnassignWorker = async (assignmentId: string, workerName: string) => {
    if (!shiftId) return;
    if (!window.confirm(`Are you sure you want to unassign ${workerName} from this shift?`)) return;
    
    try {
      await removeAssignment({ shiftId, assignmentId }).unwrap();
    } catch (err) {
      console.error('Failed to unassign worker:', err);
    }
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
    return (
      <DashboardContainer>
        <BackLink onClick={() => navigate('/shifts')}>
          <ArrowBack sx={{ fontSize: 18 }} /> Go back
        </BackLink>
        <Box sx={{ textAlign: 'center', py: 8, color: colors.status.error }}>
          Shift not found or failed to load.
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/shifts')}>
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
          <EditButton onClick={() => navigate(`/shifts/${shiftId}/edit`)}>
            <Edit sx={{ fontSize: 18 }} /> Edit shift
          </EditButton>
          <DuplicateButton onClick={() => navigate(`/shifts/create?duplicate=${shiftId}`)}>
            <ContentCopy sx={{ fontSize: 18 }} /> Duplicate shift
          </DuplicateButton>
          {shift.status !== 'CANCELLED' && shift.status !== 'COMPLETED' && (
            <DuplicateButton 
              onClick={handleCancelShift}
              sx={{ 
                backgroundColor: colors.status.error + '10',
                color: colors.status.error,
                borderColor: colors.status.error,
                '&:hover': { backgroundColor: colors.status.error + '20' }
              }}
            >
              <Cancel sx={{ fontSize: 18 }} /> {isCancelling ? 'Cancelling...' : 'Cancel shift'}
            </DuplicateButton>
          )}
        </ActionButtons>
      </TitleRow>

      <MetaInfo>
        <span><span className="label">Shift ID:</span><span className="value">#{shift.id.slice(-8).toUpperCase()}</span></span>
        <span><span className="label">Client:</span><span className="value">{shift.clientCompany?.name || 'Internal'}</span></span>
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
              <DetailIcon><Business /></DetailIcon>
              <DetailText>
                <div className="label">Client</div>
                <div className="value">{shift.clientCompany?.name || 'Internal Shift'}</div>
              </DetailText>
            </DetailItem>
            <DetailItem>
              <DetailIcon style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                <LocationOn />
              </DetailIcon>
              <DetailText>
                <div className="label">Location</div>
                <div className="value">{shift.location?.name || shift.siteLocation || 'Not specified'}</div>
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

          <BroadcastButton onClick={handleBroadcast} disabled={isBroadcasting}>
            {isBroadcasting ? 'Broadcasting...' : 'Broadcast shift to network'}
          </BroadcastButton>
        </StatusCard>
      </ContentGrid>

      {/* Assigned Workers */}
      <ActivitySection>
        <ActivityHeader>
          <ActivityTitle>Assigned Workers ({assignments.length})</ActivityTitle>
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
            <FilterButton onClick={() => setIsAssignModalOpen(true)} sx={{ backgroundColor: colors.primary.navy, color: '#fff', '&:hover': { backgroundColor: colors.primary.dark } }}>
              <PersonAdd sx={{ fontSize: 18 }} />
              Assign Workers
            </FilterButton>
            <FilterButton>
              <FilterList sx={{ fontSize: 18 }} />
              Filter
            </FilterButton>
            <ExportButton>
              Export as CSV <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </SearchFilterRow>
        </ActivityHeader>

        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
              <Th>Worker</Th>
              <Th>Clock in</Th>
              <Th>Clock out</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <Td colSpan={6} style={{ textAlign: 'center', color: colors.text.secondary }}>
                  No workers assigned to this shift yet.
                </Td>
              </tr>
            ) : (
              assignments.map((assignment: any) => {
                const attendance = attendances.find((a: any) => a.workerId === assignment.workerId);
                const getAttendanceStatus = () => {
                  if (!attendance) return 'Not Started';
                  if (attendance.clockOut) return 'Completed';
                  if (attendance.clockIn) return 'Ongoing';
                  return 'Pending';
                };
                
                return (
                  <tr key={assignment.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <WorkerCell>
                        <AvatarCircle />
                        {assignment.worker?.fullName || 'Unknown Worker'}
                      </WorkerCell>
                    </Td>
                    <Td>{attendance?.clockIn ? formatDateTime(attendance.clockIn) : '-'}</Td>
                    <Td>{attendance?.clockOut ? formatDateTime(attendance.clockOut) : '-'}</Td>
                    <Td><StatusBadge>{getAttendanceStatus()}</StatusBadge></Td>
                    <Td>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <ViewLink onClick={() => navigate(`/workers/${assignment.workerId}`)}>
                          View
                        </ViewLink>
                        {shift?.status !== 'COMPLETED' && shift?.status !== 'CANCELLED' && (
                          <ViewLink 
                            onClick={() => handleUnassignWorker(assignment.id, assignment.worker?.fullName || 'this worker')}
                            sx={{ color: colors.status.error, cursor: 'pointer' }}
                          >
                            Unassign
                          </ViewLink>
                        )}
                      </Box>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </ActivitySection>

      {/* Assign Worker Modal */}
      <AssignWorkerModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        shiftId={shiftId!}
        shiftTitle={shift?.title}
      />
    </DashboardContainer>
  );
}

export default ShiftDetails;
