import { Close, Person, Email, Phone, Work, Language } from '@mui/icons-material';
import { Box, styled, IconButton, Modal, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';
import type { User, Worker } from '../../types/api';

// ============ STYLED COMPONENTS ============
const ProfileModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  paddingTop: '72px',
  paddingRight: '32px',
});

const ProfileModalCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  padding: '32px',
  width: '420px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  marginTop: '8px',
});

const ProfileModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const ProfileModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 24px',
  textAlign: 'center',
});

const ProfileAvatarLarge = styled(Avatar)({
  width: 80,
  height: 80,
  margin: '0 auto 16px',
  border: `3px solid ${colors.primary.blue}`,
  fontSize: '28px',
  fontWeight: 600,
  backgroundColor: '#F3E8FF',
  color: colors.primary.navy,
});

const MyProfileBtn = styled('button')({
  display: 'block',
  margin: '0 auto 24px',
  padding: '8px 24px',
  borderRadius: '20px',
  border: `1.5px solid ${colors.primary.blue}`,
  backgroundColor: 'transparent',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': { backgroundColor: colors.primary.blue, color: colors.secondary.white },
});

const ProfileInfoCard = styled(Box)({
  backgroundColor: '#F9FAFB',
  borderRadius: '12px',
  padding: '20px',
});

const ProfileInfoGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
});

const ProfileInfoItem = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
});

const ProfileInfoIcon = styled(Box)({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: '#E5E7EB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': { fontSize: '16px', color: colors.text.secondary },
});

const ProfileInfoContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const ProfileInfoLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  color: colors.text.secondary,
  marginBottom: '2px',
});

const ProfileInfoValue = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.primary.navy,
  wordBreak: 'break-word',
});

const RoleBadge = styled('span')({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '12px',
  backgroundColor: '#D1FAE5',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  color: '#059669',
});

// ============ COMPONENT ============
interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | Worker | null;
}

export function ProfileModal({ open, onClose, user }: ProfileModalProps) {
  const navigate = useNavigate();

  const handleMyProfile = () => {
    onClose();
    navigate('/settings');
  };

  const getInitials = () => {
    return user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'U';
  };

  const getProfilePicture = () => {
    if (user && 'profilePicture' in user) {
      return user.profilePicture as string | undefined;
    }
    return undefined;
  };

  const getPhone = () => {
    if (user && 'phone' in user) {
      return user.phone as string;
    }
    return 'Not provided';
  };

  const getRole = () => {
    if (user && 'role' in user) {
      return String(user.role).replace('_', ' ');
    }
    return 'User';
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ProfileModalOverlay>
        <ProfileModalCard>
          <ProfileModalClose onClick={onClose}>
            <Close />
          </ProfileModalClose>
          
          <ProfileModalTitle>Profile Details</ProfileModalTitle>
          
          <ProfileAvatarLarge src={getProfilePicture()}>
            {getInitials()}
          </ProfileAvatarLarge>
          
          <MyProfileBtn onClick={handleMyProfile}>
            My Profile
          </MyProfileBtn>
          
          <ProfileInfoCard>
            <ProfileInfoGrid>
              <ProfileInfoItem>
                <ProfileInfoIcon><Person /></ProfileInfoIcon>
                <ProfileInfoContent>
                  <ProfileInfoLabel>Full Name</ProfileInfoLabel>
                  <ProfileInfoValue>{user?.fullName ?? 'User'}</ProfileInfoValue>
                </ProfileInfoContent>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoIcon><Email /></ProfileInfoIcon>
                <ProfileInfoContent>
                  <ProfileInfoLabel>Email Address</ProfileInfoLabel>
                  <ProfileInfoValue>{user?.email ?? 'Not provided'}</ProfileInfoValue>
                </ProfileInfoContent>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoIcon><Phone /></ProfileInfoIcon>
                <ProfileInfoContent>
                  <ProfileInfoLabel>Phone Number</ProfileInfoLabel>
                  <ProfileInfoValue>{getPhone()}</ProfileInfoValue>
                </ProfileInfoContent>
              </ProfileInfoItem>
              
              <ProfileInfoItem>
                <ProfileInfoIcon><Work /></ProfileInfoIcon>
                <ProfileInfoContent>
                  <ProfileInfoLabel>Role</ProfileInfoLabel>
                  <RoleBadge>{getRole()}</RoleBadge>
                </ProfileInfoContent>
              </ProfileInfoItem>
            </ProfileInfoGrid>
            
            <Box sx={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <ProfileInfoItem>
                <ProfileInfoIcon><Language /></ProfileInfoIcon>
                <ProfileInfoContent>
                  <ProfileInfoLabel>Website</ProfileInfoLabel>
                  <ProfileInfoValue>https://www.staffsync.org</ProfileInfoValue>
                </ProfileInfoContent>
              </ProfileInfoItem>
            </Box>
          </ProfileInfoCard>
        </ProfileModalCard>
      </ProfileModalOverlay>
    </Modal>
  );
}

export default ProfileModal;
