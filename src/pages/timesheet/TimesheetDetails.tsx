import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Work,
  Login as LoginIcon,
  Logout as LogoutIcon,
  FreeBreakfast,
  Email,
  Phone,
  Badge,
  LocationOn,
  Check,
  Block,
  CheckCircle,
  Close,
  GpsFixed,
  PlayArrow,
  ExitToApp,
} from '@mui/icons-material';
import {
  Box,
  styled,
  Avatar,
  IconButton,
  Modal,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';

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

const FlagBtn = styled('button')({
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

// Location Section
const SectionCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
  marginBottom: '24px',
});

const SectionHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const SectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const GpsBadge = styled('span')({
  padding: '4px 12px',
  borderRadius: '16px',
  backgroundColor: '#D1FAE5',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  color: '#059669',
});

const MapFallback = styled(Box)({
  width: '100%',
  height: '280px',
  borderRadius: '12px',
  backgroundColor: '#f0f4f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #E5E7EB',
  position: 'relative',
  overflow: 'hidden',
});

const MapSvg = () => (
  <MapFallback>
    <svg width="100%" height="100%" viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="280" fill="#e8eff7" />
      <path d="M0 200 Q100 180 200 190 Q300 200 400 185 Q500 170 600 180 Q700 190 800 175 L800 280 L0 280Z" fill="#c5ddf0" fillOpacity="0.5" />
      <path d="M0 220 Q150 210 300 225 Q450 240 600 220 Q700 210 800 215 L800 280 L0 280Z" fill="#a3c9e8" fillOpacity="0.4" />
      <circle cx="400" cy="140" r="8" fill="#3B82F6" />
      <circle cx="400" cy="140" r="16" fill="#3B82F6" fillOpacity="0.2" />
      <path d="M200 100 L250 120 L220 140 L280 130 L300 110" stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      <path d="M500 90 L550 110 L520 130 L580 120 L600 100" stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      <text x="400" y="180" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="12" fill="#6B7280">Washington, DC Area</text>
    </svg>
  </MapFallback>
);

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

const GoBackButton = styled('button')({
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

// ============ COMPONENT ============
export function TimesheetDetails() {
  useDocumentTitle('Timesheet Details');
  const navigate = useNavigate();
  const _params = useParams();
  const [successOpen, setSuccessOpen] = useState(false);

  const handleApprove = () => {
    setSuccessOpen(true);
  };

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/timesheet')}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <Breadcrumb>
        <span>Timesheet</span>
        <span>{'>'}</span>
        <span className="current">Workers Details</span>
      </Breadcrumb>

      {/* Profile Card */}
      <ProfileCard>
        <ProfileCardTitle>Worker Details</ProfileCardTitle>
        <ProfileRow>
          <ProfileLeft>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#E5E7EB', fontSize: 28 }}>S</Avatar>
            <ProfileInfo>
              <ProfileName>
                <h3>Sarah Joe</h3>
                <VerifiedTag>Verified</VerifiedTag>
              </ProfileName>
              <ProfileMeta>
                <MetaItem><Email /> sarahjoe@gmail.com</MetaItem>
                <MetaItem><Phone /> +01-88393989</MetaItem>
              </ProfileMeta>
              <ProfileMeta style={{ marginTop: '4px' }}>
                <MetaItem><Badge /> #WK-030405</MetaItem>
                <MetaItem><LocationOn /> #WK-030405</MetaItem>
              </ProfileMeta>
            </ProfileInfo>
          </ProfileLeft>
          <ButtonsRow>
            <ApproveBtn onClick={handleApprove}>
              <Check sx={{ fontSize: 18 }} /> Approve
            </ApproveBtn>
            <FlagBtn>
              <Block sx={{ fontSize: 18 }} /> Flag for review
            </FlagBtn>
          </ButtonsRow>
        </ProfileRow>
      </ProfileCard>

      {/* Stats */}
      <StatsRow>
        <StatItem>
          <StatIcon bgColor="#E0F2FE" iconColor="#3B82F6"><Work /></StatIcon>
          <StatText>
            <div className="label">Total Hours</div>
            <div className="value">4</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#D1FAE5" iconColor="#10B981"><LoginIcon /></StatIcon>
          <StatText>
            <div className="label">Clock In</div>
            <div className="value">10:00AM</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#FEF3C7" iconColor="#F59E0B"><LogoutIcon /></StatIcon>
          <StatText>
            <div className="label">Clock Out</div>
            <div className="value">2:00AM</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#EDE9FE" iconColor="#7C3AED"><FreeBreakfast /></StatIcon>
          <StatText>
            <div className="label">Break Duration</div>
            <div className="value">0 min</div>
          </StatText>
        </StatItem>
      </StatsRow>

      {/* Location Verification */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Location Verification</SectionTitle>
          <GpsBadge>GPS -Verified</GpsBadge>
        </SectionHeader>
        <MapSvg />
      </SectionCard>

      {/* Activity Log */}
      <SectionCard>
        <SectionTitle style={{ marginBottom: '16px' }}>Activity Log</SectionTitle>
        <ActivityItem>
          <ActivityIcon bgColor="#D1FAE5">
            <GpsFixed sx={{ color: '#059669' }} />
          </ActivityIcon>
          <ActivityContent>
            <div className="type">Location verified</div>
            <div className="desc">GPS verified within geofence</div>
          </ActivityContent>
          <ActivityTime>Feb 1, 10:00AM</ActivityTime>
        </ActivityItem>
        <ActivityItem>
          <ActivityIcon bgColor="#FFE4E6">
            <PlayArrow sx={{ color: '#DC2626' }} />
          </ActivityIcon>
          <ActivityContent>
            <div className="type">Shift started</div>
            <div className="desc">Worker Sarah Joe clocked in</div>
          </ActivityContent>
          <ActivityTime>Feb 1, 10:00AM</ActivityTime>
        </ActivityItem>
        <ActivityItem>
          <ActivityIcon bgColor="#D1FAE5">
            <ExitToApp sx={{ color: '#059669' }} />
          </ActivityIcon>
          <ActivityContent>
            <div className="type">Shift completed</div>
            <div className="desc">Worker Sarah Joe clocked out</div>
          </ActivityContent>
          <ActivityTime>Feb 1, 10:00AM</ActivityTime>
        </ActivityItem>
      </SectionCard>

      {/* Approved Success Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setSuccessOpen(false)}><Close /></ModalClose>
            <SuccessIconBox><CheckCircle /></SuccessIconBox>
            <ModalTitle>Approved Successful</ModalTitle>
            <ModalText>
              The timesheet hours for Sarah Joe on 02/02/2026 have been verified and sent to payroll.
            </ModalText>
            <GoBackButton onClick={() => { setSuccessOpen(false); navigate('/timesheet'); }}>
              Go to timesheet list
            </GoBackButton>
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default TimesheetDetails;
