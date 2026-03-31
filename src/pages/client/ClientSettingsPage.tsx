import React, { useState, useEffect } from 'react';
import {
  Box,
  styled,
  Typography,
  TextField,
  Switch,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Modal,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Business,
  Notifications,
  Security,
  Edit,
  Save,
  Cancel,
  Close,
  Camera,
} from '@mui/icons-material';
import { useToast } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useGetClientSettingsQuery, useUpdateClientSettingsMutation } from '../../store/slices/clientDashboardSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

// ============ STYLED COMPONENTS ============
const PageContainer = styled(Box)({
  padding: '24px',
  backgroundColor: colors.neutral.white,
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
});

const HeaderSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  paddingBottom: '20px',
  borderBottom: '1px solid #E5E7EB',
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

const TabsContainer = styled(Box)({
  display: 'flex',
  gap: '2px',
  marginBottom: '32px',
  borderBottom: '1px solid #E5E7EB',
});

const SettingsTab = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: active ? colors.primary.navy : colors.text.secondary,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: active ? `2px solid ${colors.primary.navy}` : '2px solid transparent',
  padding: '12px 24px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': { color: colors.primary.navy },
}));

const SectionCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
  marginBottom: '24px',
});

const SectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 20px',
});

const FormGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
});

const FormGroup = styled(Box)({
  marginBottom: '20px',
});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  marginBottom: '8px',
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

const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  '& .MuiSelect-select': { padding: '12px 14px' },
  '& fieldset': { borderColor: '#E5E7EB' },
});

const SaveButton = styled('button')({
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

const CancelButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
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

const AvatarSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '24px',
});

const AvatarContainer = styled(Box)({
  position: 'relative',
});

const AvatarImage = styled(Avatar)({
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: colors.primary.blue,
});

const AvatarOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: colors.primary.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: '2px solid white',
});

const SettingItem = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0',
  borderBottom: '1px solid #F3F4F6',
  '&:last-child': { borderBottom: 'none' },
});

const SettingInfo = styled(Box)({
  flex: 1,
  '& .title': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: colors.primary.navy,
    marginBottom: '4px',
  },
  '& .description': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.text.secondary,
  },
});

// ============ TYPES ============
type TabKey = 'profile' | 'notifications' | 'security';

interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  shiftReminders: boolean;
  timesheetAlerts: boolean;
  invoiceNotifications: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  emailVerification: boolean;
  loginAlerts: boolean;
  sessionTimeout: boolean;
}

// ============ COMPONENT ============
export function ClientSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileInit, setProfileInit] = useState(false);

  // Fetch settings from API
  const { data: settingsData, isLoading: settingsLoading } = useGetClientSettingsQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateClientSettingsMutation();
  const { user, currentAgency } = useSelector((state: RootState) => state.auth);

  // Profile state
  const [profile, setProfile] = useState<ClientProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });

  // Populate profile from API data on first load
  React.useEffect(() => {
    if (settingsData && !profileInit) {
      const nameParts = (settingsData.contactName || user?.fullName || '').split(' ');
      setProfile({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: settingsData.contactEmail || settingsData.billingEmail || user?.email || '',
        phone: settingsData.contactPhone || '',
        company: settingsData.name || currentAgency?.name || '',
        jobTitle: '',
        address: settingsData.address || '',
        city: settingsData.city || '',
        postcode: settingsData.postcode || '',
        country: 'United Kingdom',
      });
      setProfileInit(true);
    }
  }, [settingsData, user, currentAgency, profileInit]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    shiftReminders: true,
    timesheetAlerts: true,
    invoiceNotifications: false,
    systemUpdates: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    emailVerification: true,
    loginAlerts: true,
    sessionTimeout: true,
  });

  // Password change modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (field: keyof ClientProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleNotificationChange = (field: keyof NotificationSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({ ...notificationSettings, [field]: e.target.checked });
  };

  const handleSecurityChange = (field: keyof SecuritySettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecuritySettings({ ...securitySettings, [field]: e.target.checked });
  };

  const handleSaveProfile = async () => {
    try {
      await updateSettings({
        contactName: `${profile.firstName} ${profile.lastName}`.trim(),
        contactEmail: profile.email,
        contactPhone: profile.phone,
        billingEmail: profile.email,
      }).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving notification settings:', notificationSettings);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving security settings:', securitySettings);
      toast.success('Security settings updated successfully');
    } catch (error) {
      toast.error('Failed to update security settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Changing password');
      toast.success('Password changed successfully');
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <Box>
      <SectionCard>
        <SectionTitle>Profile Information</SectionTitle>
        <AvatarSection>
          <AvatarContainer>
            <AvatarImage sx={{ fontSize: '36px' }}>
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </AvatarImage>
            <AvatarOverlay>
              <Camera sx={{ fontSize: 18, color: 'white' }} />
            </AvatarOverlay>
          </AvatarContainer>
          <Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 600, color: colors.primary.navy }}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>
              {profile.jobTitle} at {profile.company}
            </Typography>
          </Box>
        </AvatarSection>
        <FormGrid>
          <FormGroup>
            <Label>First Name</Label>
            <StyledInput 
              value={profile.firstName} 
              onChange={handleProfileChange('firstName')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Last Name</Label>
            <StyledInput 
              value={profile.lastName} 
              onChange={handleProfileChange('lastName')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email Address</Label>
            <StyledInput 
              value={profile.email} 
              disabled={!isEditing}
              type="email"
            />
          </FormGroup>
          <FormGroup>
            <Label>Phone Number</Label>
            <StyledInput 
              value={profile.phone} 
              onChange={handleProfileChange('phone')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Company</Label>
            <StyledInput 
              value={profile.company} 
              onChange={handleProfileChange('company')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Job Title</Label>
            <StyledInput 
              value={profile.jobTitle} 
              onChange={handleProfileChange('jobTitle')}
              disabled={!isEditing}
            />
          </FormGroup>
        </FormGrid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Address Information</SectionTitle>
        <FormGrid>
          <FormGroup sx={{ gridColumn: '1 / -1' }}>
            <Label>Street Address</Label>
            <StyledInput 
              value={profile.address} 
              onChange={handleProfileChange('address')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>City</Label>
            <StyledInput 
              value={profile.city} 
              onChange={handleProfileChange('city')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Postcode</Label>
            <StyledInput 
              value={profile.postcode} 
              onChange={handleProfileChange('postcode')}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Country</Label>
            <StyledSelect 
              value={profile.country} 
              onChange={(e: any) => setProfile({ ...profile, country: e.target.value })}
              disabled={!isEditing}
            >
              <MenuItem value="United Kingdom">United Kingdom</MenuItem>
              <MenuItem value="United States">United States</MenuItem>
              <MenuItem value="Canada">Canada</MenuItem>
              <MenuItem value="Australia">Australia</MenuItem>
            </StyledSelect>
          </FormGroup>
        </FormGrid>
      </SectionCard>

      <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        {isEditing ? (
          <>
            <CancelButton onClick={() => setIsEditing(false)} disabled={isUpdatingSettings}>
              <Cancel sx={{ fontSize: 18 }} /> Cancel
            </CancelButton>
            <SaveButton onClick={handleSaveProfile} disabled={isUpdatingSettings}>
              {isUpdatingSettings ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Save sx={{ fontSize: 18 }} />}
              {isUpdatingSettings ? 'Saving...' : 'Save Changes'}
            </SaveButton>
          </>
        ) : (
          <SaveButton onClick={() => setIsEditing(true)}>
            <Edit sx={{ fontSize: 18 }} /> Edit Profile
          </SaveButton>
        )}
      </Box>
    </Box>
  );

  const renderNotificationsTab = () => (
    <Box>
      <SectionCard>
        <SectionTitle>Notification Preferences</SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SettingItem>
            <SettingInfo>
              <div className="title">Email Notifications</div>
              <div className="description">Receive notifications via email</div>
            </SettingInfo>
            <Switch
              checked={notificationSettings.emailNotifications}
              onChange={handleNotificationChange('emailNotifications')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Push Notifications</div>
              <div className="description">Receive push notifications on your device</div>
            </SettingInfo>
            <Switch
              checked={notificationSettings.pushNotifications}
              onChange={handleNotificationChange('pushNotifications')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Shift Reminders</div>
              <div className="description">Get reminded about upcoming shifts</div>
            </SettingInfo>
            <Switch
              checked={notificationSettings.shiftReminders}
              onChange={handleNotificationChange('shiftReminders')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Timesheet Alerts</div>
              <div className="description">Notifications for timesheet approvals</div>
            </SettingInfo>
            <Switch
              checked={notificationSettings.timesheetAlerts}
              onChange={handleNotificationChange('timesheetAlerts')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Invoice Notifications</div>
              <div className="description">Updates about invoices and payments</div>
            </SettingInfo>
            <Switch
              checked={notificationSettings.invoiceNotifications}
              onChange={handleNotificationChange('invoiceNotifications')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">System Updates</div>
              <div className="description">Important system announcements</div>
            </SettingInfo>
            <Switch
              checked={notificationSettings.systemUpdates}
              onChange={handleNotificationChange('systemUpdates')}
              color="primary"
            />
          </SettingItem>
        </Box>
      </SectionCard>

      <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <SaveButton onClick={handleSaveNotifications} disabled={isLoading}>
          {isLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Save sx={{ fontSize: 18 }} />}
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </SaveButton>
      </Box>
    </Box>
  );

  const renderSecurityTab = () => (
    <Box>
      <SectionCard>
        <SectionTitle>Security Settings</SectionTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SettingItem>
            <SettingInfo>
              <div className="title">Two-Factor Authentication</div>
              <div className="description">Add an extra layer of security to your account</div>
            </SettingInfo>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onChange={handleSecurityChange('twoFactorAuth')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Email Verification</div>
              <div className="description">Verify email for sensitive actions</div>
            </SettingInfo>
            <Switch
              checked={securitySettings.emailVerification}
              onChange={handleSecurityChange('emailVerification')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Login Alerts</div>
              <div className="description">Get notified when someone logs into your account</div>
            </SettingInfo>
            <Switch
              checked={securitySettings.loginAlerts}
              onChange={handleSecurityChange('loginAlerts')}
              color="primary"
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <div className="title">Session Timeout</div>
              <div className="description">Automatically log out after inactivity</div>
            </SettingInfo>
            <Switch
              checked={securitySettings.sessionTimeout}
              onChange={handleSecurityChange('sessionTimeout')}
              color="primary"
            />
          </SettingItem>
        </Box>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Password</SectionTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 600, color: colors.primary.navy }}>
              Change Password
            </Typography>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>
              Last changed 30 days ago
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setPasswordModalOpen(true)}
            sx={{
              textTransform: 'none',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              borderColor: colors.primary.navy,
              color: colors.primary.navy,
              '&:hover': { borderColor: colors.primary.navy, backgroundColor: '#F9FAFB' },
            }}
          >
            Change Password
          </Button>
        </Box>
      </SectionCard>

      <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <SaveButton onClick={handleSaveSecurity} disabled={isLoading}>
          {isLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Save sx={{ fontSize: 18 }} />}
          {isLoading ? 'Saving...' : 'Save Security Settings'}
        </SaveButton>
      </Box>

      {/* Password Change Modal */}
      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)}>
        <Box sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            width: '480px',
            maxWidth: '90vw',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: colors.primary.navy }}>
                Change Password
              </Typography>
              <IconButton onClick={() => setPasswordModalOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <FormGroup sx={{ marginBottom: '20px' }}>
              <Label>New Password</Label>
              <StyledInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </FormGroup>
            
            <FormGroup sx={{ marginBottom: '24px' }}>
              <Label>Confirm Password</Label>
              <StyledInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </FormGroup>
            
            <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setPasswordModalOpen(false)}
                sx={{
                  textTransform: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  borderColor: '#E5E7EB',
                  color: colors.primary.navy,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={isLoading}
                sx={{
                  textTransform: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  backgroundColor: colors.primary.navy,
                  '&:hover': { backgroundColor: '#1a2d4a' },
                }}
              >
                {isLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : null}
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      default: return renderProfileTab();
    }
  };

  return (
    <DashboardContainer>
      <PageContainer>
        <HeaderSection>
          <Box>
            <PageTitle>Client Settings</PageTitle>
            <PageSubtitle>Manage your personal account settings and preferences</PageSubtitle>
          </Box>
        </HeaderSection>

        <TabsContainer>
          <SettingsTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
            <Person sx={{ fontSize: 18, marginRight: '8px' }} />
            Profile
          </SettingsTab>
          <SettingsTab active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
            <Notifications sx={{ fontSize: 18, marginRight: '8px' }} />
            Notifications
          </SettingsTab>
          <SettingsTab active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            <Security sx={{ fontSize: 18, marginRight: '8px' }} />
            Security
          </SettingsTab>
        </TabsContainer>
        {getTabContent()}
      </PageContainer>
    </DashboardContainer>
  );
}

export default ClientSettingsPage;
