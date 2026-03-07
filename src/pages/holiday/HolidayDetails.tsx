import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Email,
  Phone,
  Badge,
  LocationOn,
  Check,
  Close,
  CheckCircle,
  PlayArrow,
  Visibility,
  ExitToApp,
  Assignment,
  EventNote,
  CalendarToday,
  Timer,
  Cancel,
} from '@mui/icons-material';
import {
  Box,
  styled,
  Avatar,
  IconButton,
  Modal,
  CircularProgress,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import {
  useGetLeaveRequestDetailQuery,
  useReviewLeaveRequestMutation,
} from '../../store/slices/holidaySlice';

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
  '& .current': { fontWeight: 600, color: colors.primary.navy },
});

const ProfileCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
  marginBottom: '24px',
});

const ProfileCardTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 20px',
});

const ProfileRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
});

const ProfileLeft = styled(Box)({
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
});

const ProfileInfo = styled(Box)({});

const ProfileName = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '8px',
  '& h3': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: colors.primary.navy,
    margin: 0,
  },
});

const VerifiedTag = styled('span')({
  padding: '3px 10px',
  borderRadius: '12px',
  backgroundColor: '#D1FAE5',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  color: '#059669',
});

const ProfileMeta = styled(Box)({
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap',
});

const MetaItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  '& svg': { fontSize: '16px' },
});

const ButtonsRow = styled(Box)({
  display: 'flex',
  gap: '12px',
});

const ApproveBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 24px',
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

const RejectBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 24px',
  borderRadius: '8px',
  border: '1px solid #EF4444',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: '#EF4444',
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#FEF2F2' },
});

// Stats Row
const StatsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  marginBottom: '24px',
  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
});

const StatItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '16px 20px',
});

const StatIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'iconColor',
})<{ bgColor?: string; iconColor?: string }>(({ bgColor, iconColor }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  backgroundColor: bgColor ?? '#E0F2FE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: iconColor ?? colors.primary.blue,
  '& svg': { fontSize: '20px' },
}));

const StatText = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: colors.primary.navy,
  },
});

// Request Details
const SectionCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
  marginBottom: '24px',
});

const SectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 16px',
});

const DetailsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '24px',
  marginBottom: '20px',
  '@media (max-width: 768px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
});

const DetailItem = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '4px',
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const ReasonLabel = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 8px',
});

const ReasonText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  lineHeight: 1.7,
  margin: 0,
});

// Activity Log
const ActivityItem = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid #F3F4F6',
  '&:last-child': { borderBottom: 'none' },
});

const ActivityIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor?: string }>(({ bgColor }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: bgColor ?? '#D1FAE5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': { fontSize: '16px' },
}));

const ActivityContent = styled(Box)({
  flex: 1,
  '& .type': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
  '& .desc': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const ActivityTime = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  whiteSpace: 'nowrap',
});

// Modal
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
  width: '480px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const SuccessIconBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': { fontSize: '48px', color: colors.status.success },
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px',
  textAlign: 'center',
});

const ModalText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
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

// ============ HELPERS ============
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

const getLeaveTypeLabel = (type: string): string => {
  switch (type) {
    case 'ANNUAL': return 'Annual Leave';
    case 'SICK': return 'Sick Leave';
    case 'UNPAID': return 'Unpaid Leave';
    case 'COMPASSIONATE': return 'Compassionate Leave';
    case 'MATERNITY': return 'Maternity Leave';
    case 'PATERNITY': return 'Paternity Leave';
    default: return type;
  }
};

const getStatusColor = (status: string): { bg: string; color: string } => {
  switch (status) {
    case 'PENDING': return { bg: '#FEF3C7', color: '#D97706' };
    case 'APPROVED': return { bg: '#D1FAE5', color: '#059669' };
    case 'DENIED': return { bg: '#FFE4E6', color: '#DC2626' };
    case 'CANCELLED': return { bg: '#F3F4F6', color: '#6B7280' };
    default: return { bg: '#F3F4F6', color: '#6B7280' };
  }
};

// ============ COMPONENT ============
export function HolidayDetails() {
  useDocumentTitle('Holiday Details');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [successOpen, setSuccessOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');

  // API Hooks
  const { data: request, isLoading, error } = useGetLeaveRequestDetailQuery(id || '');
  const [reviewRequest, { isLoading: reviewing }] = useReviewLeaveRequestMutation();

  const handleApprove = async () => {
    if (!id) return;
    try {
      await reviewRequest({ id, status: 'APPROVED' }).unwrap();
      setActionType('approved');
      setSuccessOpen(true);
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await reviewRequest({ id, status: 'DENIED' }).unwrap();
      setActionType('rejected');
      setSuccessOpen(true);
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  if (error || !request) {
    return (
      <DashboardContainer>
        <BackLink onClick={() => navigate('/holiday')}>
          <ArrowBack sx={{ fontSize: 18 }} /> Go back
        </BackLink>
        <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary }}>
          Leave request not found or an error occurred.
        </Box>
      </DashboardContainer>
    );
  }

  const statusColors = getStatusColor(request.status);

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/holiday')}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <Breadcrumb>
        <span>Holiday Request</span>
        <span>{'>'}</span>
        <span className="current">Holiday Details</span>
      </Breadcrumb>

      {/* Profile */}
      <ProfileCard>
        <ProfileCardTitle>Worker Details</ProfileCardTitle>
        <ProfileRow>
          <ProfileLeft>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#E5E7EB', fontSize: 28 }}>
              {request.worker?.fullName?.charAt(0) || 'W'}
            </Avatar>
            <ProfileInfo>
              <ProfileName>
                <h3>{request.worker?.fullName || 'Unknown Worker'}</h3>
                <VerifiedTag style={{ backgroundColor: statusColors.bg, color: statusColors.color }}>
                  {request.status}
                </VerifiedTag>
              </ProfileName>
              <ProfileMeta>
                <MetaItem><Email /> {request.worker?.email || '-'}</MetaItem>
              </ProfileMeta>
              <ProfileMeta style={{ marginTop: '4px' }}>
                <MetaItem><Badge /> #{request.worker?.id?.slice(-8).toUpperCase() || '-'}</MetaItem>
                <MetaItem><CalendarToday /> Submitted: {formatDateTime(request.createdAt)}</MetaItem>
              </ProfileMeta>
            </ProfileInfo>
          </ProfileLeft>
          {request.status === 'PENDING' && (
            <ButtonsRow>
              <ApproveBtn onClick={handleApprove} disabled={reviewing}>
                {reviewing ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Check sx={{ fontSize: 18 }} />}
                Approve Request
              </ApproveBtn>
              <RejectBtn onClick={handleReject} disabled={reviewing}>
                <Close sx={{ fontSize: 18 }} /> Reject Request
              </RejectBtn>
            </ButtonsRow>
          )}
          {request.status === 'APPROVED' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#059669' }}>
              <CheckCircle /> Approved {request.reviewer?.fullName && `by ${request.reviewer.fullName}`}
            </Box>
          )}
          {request.status === 'DENIED' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#DC2626' }}>
              <Cancel /> Rejected {request.reviewer?.fullName && `by ${request.reviewer.fullName}`}
            </Box>
          )}
        </ProfileRow>
      </ProfileCard>

      {/* Stats */}
      <StatsRow>
        <StatItem>
          <StatIcon bgColor="#E0F2FE" iconColor="#3B82F6"><Assignment /></StatIcon>
          <StatText>
            <div className="label">Leave Type</div>
            <div className="value">{getLeaveTypeLabel(request.leaveType)}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#D1FAE5" iconColor="#10B981"><EventNote /></StatIcon>
          <StatText>
            <div className="label">Duration</div>
            <div className="value">{request.days} day{request.days !== 1 ? 's' : ''}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#FEF3C7" iconColor="#F59E0B"><CalendarToday /></StatIcon>
          <StatText>
            <div className="label">Start Date</div>
            <div className="value">{formatDate(request.startDate)}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#FFE4E6" iconColor="#EF4444"><Timer /></StatIcon>
          <StatText>
            <div className="label">End Date</div>
            <div className="value">{formatDate(request.endDate)}</div>
          </StatText>
        </StatItem>
      </StatsRow>

      {/* Request Details */}
      <SectionCard>
        <SectionTitle>Request Details</SectionTitle>
        <DetailsGrid>
          <DetailItem>
            <div className="label">Request Title</div>
            <div className="value">{request.title}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Leave Type</div>
            <div className="value">{getLeaveTypeLabel(request.leaveType)}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Start Date</div>
            <div className="value">{formatDate(request.startDate)}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">End Date</div>
            <div className="value">{formatDate(request.endDate)}</div>
          </DetailItem>
        </DetailsGrid>
        <DetailsGrid>
          <DetailItem>
            <div className="label">Total Days</div>
            <div className="value">{request.days} day{request.days !== 1 ? 's' : ''}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Total Hours</div>
            <div className="value">{request.hours} hours</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Status</div>
            <div className="value" style={{ color: statusColors.color }}>{request.status}</div>
          </DetailItem>
          <DetailItem>
            <div className="label">Submitted</div>
            <div className="value">{formatDateTime(request.createdAt)}</div>
          </DetailItem>
        </DetailsGrid>
        {request.reason && (
          <>
            <ReasonLabel>Reason</ReasonLabel>
            <ReasonText>{request.reason}</ReasonText>
          </>
        )}
        {request.reviewNote && (
          <>
            <ReasonLabel>Review Note</ReasonLabel>
            <ReasonText>{request.reviewNote}</ReasonText>
          </>
        )}
      </SectionCard>

      {/* Activity Log */}
      <SectionCard>
        <SectionTitle>Activity Log</SectionTitle>
        <ActivityItem>
          <ActivityIcon bgColor="#D1FAE5">
            <PlayArrow sx={{ color: '#059669' }} />
          </ActivityIcon>
          <ActivityContent>
            <div className="type">Request Submitted</div>
            <div className="desc">{formatDateTime(request.createdAt)}</div>
          </ActivityContent>
          <ActivityTime>{formatDateTime(request.createdAt)}</ActivityTime>
        </ActivityItem>
        {request.status === 'PENDING' && (
          <ActivityItem>
            <ActivityIcon bgColor="#FEF3C7">
              <ExitToApp sx={{ color: '#D97706' }} />
            </ActivityIcon>
            <ActivityContent>
              <div className="type" style={{ color: '#D97706' }}>Decision Pending</div>
              <div className="desc" style={{ color: '#9CA3AF' }}>Awaiting review and approval</div>
            </ActivityContent>
            <ActivityTime>-</ActivityTime>
          </ActivityItem>
        )}
        {request.status === 'APPROVED' && (
          <ActivityItem>
            <ActivityIcon bgColor="#D1FAE5">
              <CheckCircle sx={{ color: '#059669' }} />
            </ActivityIcon>
            <ActivityContent>
              <div className="type" style={{ color: '#059669' }}>Request Approved</div>
              <div className="desc">
                {request.reviewedAt && formatDateTime(request.reviewedAt)}
                {request.reviewer?.fullName && ` by ${request.reviewer.fullName}`}
              </div>
            </ActivityContent>
            <ActivityTime>{request.reviewedAt ? formatDateTime(request.reviewedAt) : '-'}</ActivityTime>
          </ActivityItem>
        )}
        {request.status === 'DENIED' && (
          <ActivityItem>
            <ActivityIcon bgColor="#FFE4E6">
              <Cancel sx={{ color: '#DC2626' }} />
            </ActivityIcon>
            <ActivityContent>
              <div className="type" style={{ color: '#DC2626' }}>Request Denied</div>
              <div className="desc">
                {request.reviewedAt && formatDateTime(request.reviewedAt)}
                {request.reviewer?.fullName && ` by ${request.reviewer.fullName}`}
              </div>
            </ActivityContent>
            <ActivityTime>{request.reviewedAt ? formatDateTime(request.reviewedAt) : '-'}</ActivityTime>
          </ActivityItem>
        )}
      </SectionCard>

      {/* Success Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setSuccessOpen(false)}><Close /></ModalClose>
            <SuccessIconBox><CheckCircle /></SuccessIconBox>
            <ModalTitle>{actionType === 'approved' ? 'Request Approved' : 'Request Rejected'}</ModalTitle>
            <ModalText>
              {actionType === 'approved' 
                ? <>The leave request for <strong>{request.worker?.fullName}</strong> from <strong>{formatDate(request.startDate)}</strong> to <strong>{formatDate(request.endDate)}</strong> has been approved.</>
                : <>The leave request for <strong>{request.worker?.fullName}</strong> has been rejected.</>
              }
            </ModalText>
            <DoneButton onClick={() => { setSuccessOpen(false); navigate('/holiday'); }}>Done</DoneButton>
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default HolidayDetails;
