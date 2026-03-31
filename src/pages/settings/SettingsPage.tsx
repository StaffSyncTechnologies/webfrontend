import { useState, useEffect, useRef } from 'react';
import {
  Edit,
  Save,
  Lock,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  Add,
  CheckCircle,
  CloudUpload,
  Check,
  Warning,
  AccessTime,
  Refresh,
  Upload,
  Cancel,
} from '@mui/icons-material';
import {
  Box,
  styled,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Menu as MuiMenu,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useDocumentTitle, useToast } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { ChangePasswordModal, AddRoleModal, AddLocationModal, SubscriptionSuccessModal, CancelSubscriptionModal, DeleteAccountModal } from '../../components/modals';
import { colors } from '../../utilities/colors';
import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useUpdateBrandingMutation,
  useUploadLogoMutation,
  useUploadCoverImageMutation,
  useGetLocationsQuery,
  useGetStaffUsersQuery,
} from '../../store/slices/settingsSlice';
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from '../../store/slices/notificationSlice';
import { 
  useGetSubscriptionSummaryQuery, 
  useGetPlansQuery, 
  useCreateCheckoutMutation,
  useCancelSubscriptionMutation,
} from '../../store/slices/subscriptionSlice';
import { useAppSelector } from '../../store';
import { formatDistanceToNow } from 'date-fns';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
});

const TitleSection = styled(Box)({});

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

const ButtonsRow = styled(Box)({
  display: 'flex',
  gap: '12px',
});

const EditProfileBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
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

const ChangePassBtn = styled('button')({
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

const InviteBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
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

const TabsRow = styled(Box)({
  display: 'flex',
  borderBottom: '1px solid #E5E7EB',
  marginBottom: '24px',
});

const Tab = styled('button', {
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
  fontSize: '16px',
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
  marginBottom: '0',
});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
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

// Table
const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
});

const CardHeader = styled(Box)({
  padding: '20px 24px',
  borderBottom: '1px solid #E5E7EB',
  '& h3': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: colors.primary.navy,
    margin: 0,
  },
});

const FilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  flexWrap: 'wrap',
  gap: '12px',
});

const FilterLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const FilterRight = styled(Box)({
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

const DropdownButton = styled('button')({
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
  backgroundColor: colors.primary.navy,
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

const UserCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '& .name': { fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy },
  '& .id': { fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary },
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = { active: '#D1FAE5', blocked: '#FFE4E6', inactive: '#F3F4F6' };
  const colorMap: Record<string, string> = { active: '#059669', blocked: '#DC2626', inactive: '#6B7280' };
  return {
    padding: '4px 12px',
    borderRadius: '16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: bgMap[status.toLowerCase()] ?? '#F3F4F6',
    color: colorMap[status.toLowerCase()] ?? '#6B7280',
  };
});

const PaginationRow = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '24px',
  padding: '16px 24px',
});

const PaginationText = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
});

const PaginationControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const PageButton = styled('button')({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

// Subscription
const PlansGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  '@media (max-width: 900px)': { gridTemplateColumns: '1fr' },
});

const PlanCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
});

const PlanName = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 700,
  color: colors.primary.navy,
  letterSpacing: '1px',
  marginBottom: '8px',
});

const CurrentBadge = styled('span')({
  padding: '2px 10px',
  borderRadius: '12px',
  border: `1px solid ${colors.primary.blue}`,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  color: colors.primary.blue,
  textTransform: 'uppercase',
});

const PlanPrice = styled(Box)({
  marginBottom: '8px',
  '& .amount': { fontFamily: "'Outfit', sans-serif", fontSize: '36px', fontWeight: 700, color: colors.primary.navy },
  '& .period': { fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary },
});

const BilledText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  margin: '0 0 16px',
});

const FeatureList = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '24px',
});

const FeatureItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  '& svg': { fontSize: '18px', color: colors.primary.blue },
});

const SubscribeBtn = styled('button', {
  shouldForwardProp: (prop) => prop !== 'disabled' && prop !== 'variant',
})<{ variant?: 'disabled' | 'primary' | 'outline' }>(({ variant }) => ({
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: variant === 'outline' ? `1px solid ${colors.primary.navy}` : 'none',
  backgroundColor: variant === 'disabled' ? '#E5E7EB' : variant === 'outline' ? colors.secondary.white : colors.primary.blue,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: variant === 'disabled' ? '#9CA3AF' : variant === 'outline' ? colors.primary.navy : colors.secondary.white,
  cursor: variant === 'disabled' ? 'not-allowed' : 'pointer',
  '&:hover': { opacity: variant === 'disabled' ? 1 : 0.9 },
}));

// Location styles
const AddLocationBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  borderRadius: '8px',
  border: `1px solid ${colors.primary.blue}`,
  backgroundColor: 'transparent',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#EFF6FF' },
});

const LocationItem = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#F9FAFB',
});

const PrimaryBadge = styled('span')({
  padding: '4px 10px',
  borderRadius: '12px',
  backgroundColor: '#D1FAE5',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  color: '#059669',
});

// Permission mappings for roles
const rolePermissions: Record<string, string> = {
  ADMIN: 'All Permission',
  OPS_MANAGER: 'Managed Workers, Flagged Attendance',
  SHIFT_COORDINATOR: 'Shift Management',
  COMPLIANCE_OFFICER: 'Compliance Management',
  WORKER: 'Worker Access',
};

type TabKey = 'agency' | 'users' | 'notification' | 'subscription';

// ============ COMPONENT ============
export function SettingsPage() {
  useDocumentTitle('Settings');
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('agency');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get current logged-in user
  const currentUser = useAppSelector((state) => state.auth.user);

  // API hooks
  const { data: organization, isLoading: orgLoading } = useGetOrganizationQuery();
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery();
  const { data: staffData, isLoading: staffLoading } = useGetStaffUsersQuery({ 
    page: currentPage, 
    limit: rowsPerPage, 
    search: searchTerm || undefined 
  });
  const [updateOrganization, { isLoading: updateOrgLoading }] = useUpdateOrganizationMutation();
  const [updateBranding] = useUpdateBrandingMutation();
  const [uploadLogo, { isLoading: uploadingLogo }] = useUploadLogoMutation();
  const [uploadCoverImage, { isLoading: uploadingCover }] = useUploadCoverImageMutation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state for organization
  const [orgForm, setOrgForm] = useState({
    name: 'StaffSync Agency',
    email: 'admin@staffsync.com',
    tradingName: 'StaffSync Solutions Ltd',
    registrationNumber: '12345678',
    industry: 'healthcare',
    website: 'www.staffsync.com',
    phone: '+44 20 7123 4567',
    primaryColor: '#1E3A5F',
    secondaryColor: '#3B82F6',
  });

  // Sync form with fetched data
  useEffect(() => {
    if (organization) {
      setOrgForm({
        name: organization.name || '',
        email: organization.email || '',
        tradingName: (organization as any).tradingName || '',
        registrationNumber: organization.registrationNumber || '',
        industry: (organization as any).industry || '',
        website: (organization as any).website || '',
        phone: (organization as any).phone || '',
        primaryColor: organization.primaryColor || '#1E3A5F',
        secondaryColor: organization.secondaryColor || '#3B82F6',
      });
    }
  }, [organization]);
  
  // Notification state and hooks
  const [notificationFilter, setNotificationFilter] = useState('All');
  const [notificationPage, setNotificationPage] = useState(1);
  const { data: notificationsData, isLoading: notificationsLoading, refetch: refetchNotifications } = useGetNotificationsQuery({ page: notificationPage, limit: 20 });
  const [markAllAsRead, { isLoading: markingAllRead }] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.notifications || [];
  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'All') return true;
    if (notificationFilter === 'Unread') return !n.isRead;
    const upperType = n.type.toUpperCase();
    if (notificationFilter === 'Shift Alert') return upperType.includes('SHIFT') || upperType.includes('ATTENDANCE');
    if (notificationFilter === 'Payroll') return upperType.includes('PAYROLL') || upperType.includes('PAYSLIP');
    if (notificationFilter === 'Holiday') return upperType.includes('HOLIDAY') || upperType.includes('LEAVE');
    if (notificationFilter === 'System') return !upperType.includes('SHIFT') && !upperType.includes('PAYROLL') && !upperType.includes('HOLIDAY');
    return true;
  });

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  // Subscription state and hooks
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetSubscriptionSummaryQuery();
  const { data: plansData } = useGetPlansQuery();
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateCheckoutMutation();
  const [cancelSubscription, { isLoading: cancellingSubscription }] = useCancelSubscriptionMutation();
  
  const [subscriptionView, setSubscriptionView] = useState<'plans' | 'checkout' | 'subscribed'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [subscriptionMenuAnchor, setSubscriptionMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Set initial subscription view based on current subscription status
  useEffect(() => {
    if (subscriptionData && !subscriptionLoading) {
      if (subscriptionData.status === 'ACTIVE' && subscriptionData.planTier !== 'FREE') {
        setSubscriptionView('subscribed');
      }
    }
  }, [subscriptionData, subscriptionLoading]);

  const handleSaveChanges = async () => {
    try {
      await updateOrganization({
        name: orgForm.name,
        tradingName: orgForm.tradingName || undefined,
        registrationNumber: orgForm.registrationNumber || undefined,
        industry: orgForm.industry || undefined,
        website: orgForm.website || undefined,
        phone: orgForm.phone || undefined,
      }).unwrap();
      await updateBranding({
        primaryColor: orgForm.primaryColor,
        secondaryColor: orgForm.secondaryColor,
      }).unwrap();
      toast.success('Settings saved successfully');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Save settings error:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to save settings');
    }
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG and PNG are allowed.');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadLogo(formData).unwrap();
      toast.success('Logo uploaded successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload logo');
    }

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG and PNG are allowed.');
      return;
    }

    // 5MB max for cover images
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadCoverImage(formData).unwrap();
      toast.success('Cover image uploaded successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload cover image');
    }

    e.target.value = '';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleMenuClose = () => setMenuAnchor(null);

  const renderAgencyProfile = () => {
    if (orgLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
    <>
      {/* Branding Section */}
      <SectionCard>
        <SectionTitle>Branding</SectionTitle>
        <Box sx={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <Box>
            <Label>Company Logo</Label>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoChange}
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: 'none' }}
            />
            <Box 
              onClick={handleLogoClick}
              sx={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                border: '2px dashed #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
                cursor: uploadingLogo ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: colors.primary.blue, backgroundColor: '#EFF6FF' },
                position: 'relative',
              }}>
              {uploadingLogo ? (
                <CircularProgress size={32} />
              ) : organization?.logoUrl ? (
                <img src={organization.logoUrl!.startsWith('http') ? organization.logoUrl! : `https://backend-rp5c.onrender.com${organization.logoUrl}`} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUpload sx={{ fontSize: 32, color: '#9CA3AF', marginBottom: '4px' }} />
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#9CA3AF' }}>Upload Logo</Box>
                </Box>
              )}
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: colors.text.secondary, marginTop: '8px' }}>
              PNG, JPG up to 2MB
            </Box>
          </Box>
          <Box>
            <Label>Cover Image</Label>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: 'none' }}
            />
            <Box 
              onClick={handleCoverClick}
              sx={{
                width: '240px',
                height: '120px',
                borderRadius: '12px',
                border: '2px dashed #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
                cursor: uploadingCover ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                overflow: 'hidden',
                '&:hover': { borderColor: colors.primary.blue, backgroundColor: '#EFF6FF' },
              }}>
              {uploadingCover ? (
                <CircularProgress size={32} />
              ) : (organization as any)?.coverImageUrl ? (
                <img src={(organization as any).coverImageUrl.startsWith('http') ? (organization as any).coverImageUrl : `https://backend-rp5c.onrender.com${(organization as any).coverImageUrl}`} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUpload sx={{ fontSize: 32, color: '#9CA3AF', marginBottom: '4px' }} />
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#9CA3AF' }}>Upload Cover</Box>
                </Box>
              )}
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: colors.text.secondary, marginTop: '8px' }}>
              PNG, JPG up to 5MB (Recommended: 1200x400)
            </Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: '280px' }}>
            <FormGrid>
              <FormGroup>
                <Label>Primary Color</Label>
                <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Box sx={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: orgForm.primaryColor,
                    border: '2px solid #E5E7EB',
                    cursor: 'pointer',
                  }} />
                  <StyledInput 
                    value={orgForm.primaryColor} 
                    onChange={(e) => setOrgForm({ ...orgForm, primaryColor: e.target.value })}
                    sx={{ flex: 1 }} 
                    disabled={!isEditing}
                  />
                </Box>
              </FormGroup>
              <FormGroup>
                <Label>Secondary Color</Label>
                <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Box sx={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: orgForm.secondaryColor,
                    border: '2px solid #E5E7EB',
                    cursor: 'pointer',
                  }} />
                  <StyledInput 
                    value={orgForm.secondaryColor} 
                    onChange={(e) => setOrgForm({ ...orgForm, secondaryColor: e.target.value })}
                    sx={{ flex: 1 }} 
                    disabled={!isEditing}
                  />
                </Box>
              </FormGroup>
            </FormGrid>
          </Box>
        </Box>
      </SectionCard>

      {/* Organization Details */}
      <SectionCard>
        <SectionTitle>Organization Details</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Organization Name</Label>
            <StyledInput 
              value={orgForm.name} 
              onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Organization Email Address</Label>
            <StyledInput 
              value={orgForm.email} 
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label>Trading Name</Label>
            <StyledInput 
              value={orgForm.tradingName} 
              onChange={(e) => setOrgForm({ ...orgForm, tradingName: e.target.value })}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Company Number</Label>
            <StyledInput 
              value={orgForm.registrationNumber} 
              onChange={(e) => setOrgForm({ ...orgForm, registrationNumber: e.target.value })}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Industry</Label>
            <StyledSelect 
              value={orgForm.industry || 'healthcare'}
              onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value as string })}
              disabled={!isEditing}
            >
              <MenuItem value="healthcare">Healthcare</MenuItem>
              <MenuItem value="logistics">Logistics</MenuItem>
              <MenuItem value="hospitality">Hospitality</MenuItem>
              <MenuItem value="construction">Construction</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="cleaning">Cleaning</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </StyledSelect>
          </FormGroup>
          <FormGroup>
            <Label>Number of workers</Label>
            <StyledInput value={organization?._count?.users || 0} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Website</Label>
            <StyledInput 
              value={orgForm.website} 
              onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Phone Number</Label>
            <StyledInput 
              value={orgForm.phone} 
              onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
              disabled={!isEditing}
            />
          </FormGroup>
        </FormGrid>
      </SectionCard>

      {/* Location Section */}
      <SectionCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <SectionTitle style={{ margin: 0 }}>Locations</SectionTitle>
          <AddLocationBtn onClick={() => { setEditingLocation(null); setLocationOpen(true); }}>
            <Add sx={{ fontSize: 18 }} /> Add Location
          </AddLocationBtn>
        </Box>
        {locationsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <CircularProgress size={24} />
          </Box>
        ) : locations.length === 0 ? (
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, textAlign: 'center', padding: '24px' }}>
            No locations added yet. Click "Add Location" to add your first location.
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {locations.map((loc) => (
              <LocationItem key={loc.id}>
                <Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy }}>{loc.name}</Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, marginTop: '2px' }}>{loc.address}</Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loc.isPrimary && <PrimaryBadge>Primary</PrimaryBadge>}
                  <IconButton size="small" onClick={() => { setEditingLocation(loc); setLocationOpen(true); }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                </Box>
              </LocationItem>
            ))}
          </Box>
        )}
      </SectionCard>

      {/* Admin Account Details */}
      <SectionCard>
        <SectionTitle>Admin Account Details</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Full Name</Label>
            <StyledInput value={currentUser?.fullName || ''} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Email Address</Label>
            <StyledInput value={currentUser?.email || ''} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Phone Number</Label>
            <StyledInput value={currentUser && 'phone' in currentUser ? currentUser.phone : ''} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Role</Label>
            <StyledInput value={currentUser?.role?.replace('_', ' ') || 'Admin'} disabled />
          </FormGroup>
        </FormGrid>
      </SectionCard>

      {/* Danger Zone - Delete Account */}
      <SectionCard style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
        <SectionTitle style={{ color: '#991B1B' }}>Danger Zone</SectionTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: '#991B1B' }}>
              Delete Organization Account
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#7F1D1D', marginTop: '4px' }}>
              Once you delete your account, there is no going back. Please be certain.
            </Box>
          </Box>
          <Box
            component="button"
            onClick={() => setDeleteAccountOpen(true)}
            sx={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #DC2626',
              backgroundColor: 'transparent',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: '#DC2626',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#FEE2E2' },
            }}
          >
            Delete Account
          </Box>
        </Box>
      </SectionCard>

      {isEditing && (
        <SaveButton onClick={handleSaveChanges} disabled={updateOrgLoading}>
          {updateOrgLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Save sx={{ fontSize: 18 }} />} Save Changes
        </SaveButton>
      )}
    </>
  );
  };

  const renderUsersPermission = () => {
    const staffUsers = staffData?.users || [];
    
    return (
    <TableCard>
      <CardHeader><h3>Users & Permission</h3></CardHeader>
      <FilterRow>
        <FilterLeft>
          <SearchInput
            placeholder="Search here..."
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
          <FilterButton><FilterList sx={{ fontSize: 18 }} /> Filter</FilterButton>
        </FilterLeft>
        <FilterRight>
          <DropdownButton>Role <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
          <DropdownButton>All Status <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
          <ExportButton>Export as XLS <FileDownload sx={{ fontSize: 18 }} /></ExportButton>
        </FilterRight>
      </FilterRow>

      <Box sx={{ overflowX: 'auto' }}>
        {staffLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <CircularProgress />
          </Box>
        ) : (
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Permission</Th>
              <Th>Email address</Th>
              <Th>Last active</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.length === 0 ? (
              <tr>
                <Td colSpan={8} style={{ textAlign: 'center', color: colors.text.secondary }}>
                  No staff users found
                </Td>
              </tr>
            ) : staffUsers.map((u) => (
              <tr key={u.id}>
                <Td><Checkbox size="small" /></Td>
                <Td>
                  <UserCell>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#E5E7EB', fontSize: 13 }}>{u.fullName.charAt(0)}</Avatar>
                    <Box>
                      <span className="name">{u.fullName}</span>
                      <div className="id">#{u.id.slice(0, 8).toUpperCase()}</div>
                    </Box>
                  </UserCell>
                </Td>
                <Td>{u.role.replace('_', ' ')}</Td>
                <Td>{rolePermissions[u.role] || 'Standard Access'}</Td>
                <Td>{u.email}</Td>
                <Td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</Td>
                <Td><StatusBadge status={u.status}>{u.status}</StatusBadge></Td>
                <Td>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
      </Box>

      <MuiMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '160px' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.primary.navy, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' } }} onClick={handleMenuClose}>
          <Edit sx={{ fontSize: 18 }} /> Edit Role
        </Box>
      </MuiMenu>

      <PaginationRow>
        <Box display="flex" alignItems="center" gap="8px">
          <PaginationText>Rows per page</PaginationText>
          <Select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}>
            <MenuItem value={8}>08</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
        </Box>
        <PaginationText>Showing 10 out of 100 items</PaginationText>
        <PaginationControls>
          <PageButton disabled><ChevronLeft sx={{ fontSize: 18 }} /></PageButton>
          <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>1</PageButton>
          <PageButton><ChevronRight sx={{ fontSize: 18 }} /></PageButton>
        </PaginationControls>
      </PaginationRow>
    </TableCard>
  );
  };

  const renderNotification = () => {
    const filters = ['All', 'Unread', 'Shift Alert', 'Payroll', 'Holiday', 'System'];

    const getIconProps = (type: string) => {
      const upperType = type.toUpperCase();
      if (upperType.includes('SHIFT') || upperType.includes('ALERT')) return { bg: '#FEE2E2', color: colors.status.error, Icon: Warning };
      if (upperType.includes('PAYROLL') || upperType.includes('PAYSLIP') || upperType.includes('APPROVED')) return { bg: '#D1FAE5', color: colors.status.success, Icon: CheckCircle };
      return { bg: '#FEF3C7', color: '#D97706', Icon: AccessTime };
    };

    const formatTime = (dateString: string) => {
      try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
      } catch {
        return dateString;
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Box
            component="button"
            onClick={handleMarkAllNotificationsRead}
            sx={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px',
              border: '1px solid #E5E7EB', backgroundColor: colors.secondary.white, fontFamily: "'Outfit', sans-serif",
              fontSize: '14px', fontWeight: 500, color: colors.primary.navy, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' },
              opacity: markingAllRead ? 0.7 : 1,
            }}
            disabled={markingAllRead}
          >
            <Check sx={{ fontSize: 18 }} /> {markingAllRead ? 'Marking...' : 'Mark all as read'}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {filters.map((filter, idx) => (
            <Box
              key={filter}
              component="button"
              onClick={() => setNotificationFilter(filter)}
              sx={{
                padding: '8px 16px', borderRadius: '20px', border: notificationFilter === filter ? 'none' : '1px solid #E5E7EB',
                backgroundColor: notificationFilter === filter ? colors.primary.navy : colors.secondary.white, fontFamily: "'Outfit', sans-serif",
                fontSize: '14px', fontWeight: 500, color: notificationFilter === filter ? colors.secondary.white : colors.text.secondary,
                cursor: 'pointer', '&:hover': { backgroundColor: notificationFilter === filter ? colors.primary.navy : '#F9FAFB' },
              }}
            >
              {filter}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notificationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <CircularProgress />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary, fontFamily: "'Outfit', sans-serif" }}>
              No notifications found
            </Box>
          ) : (
            filteredNotifications.map((n) => {
              const { bg, color, Icon } = getIconProps(n.type);
              return (
                <Box key={n.id} sx={{ 
                  display: 'flex', gap: '16px', padding: '20px', 
                  backgroundColor: n.isRead ? colors.secondary.white : '#F0F9FF', 
                  borderRadius: '12px', border: '1px solid #F3F4F6' 
                }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 20, color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 600, color: colors.primary.navy }}>{n.title}</Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, margin: '4px 0 12px' }}>{n.message}</Box>
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                      <Box
                        component="button"
                        sx={{
                          padding: '8px 16px', borderRadius: '6px', border: 'none',
                          backgroundColor: colors.primary.navy, fontFamily: "'Outfit', sans-serif",
                          fontSize: '13px', fontWeight: 500, color: colors.secondary.white,
                          cursor: 'pointer', '&:hover': { opacity: 0.9 },
                        }}
                      >
                        View Details
                      </Box>
                      {!n.isRead && (
                        <Box
                          component="button"
                          sx={{
                            padding: '8px 16px', borderRadius: '6px', border: '1px solid #E5E7EB',
                            backgroundColor: colors.secondary.white, fontFamily: "'Outfit', sans-serif",
                            fontSize: '13px', fontWeight: 500, color: colors.primary.navy,
                            cursor: 'pointer', '&:hover': { opacity: 0.9 },
                          }}
                        >
                          Dismiss
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, flexShrink: 0 }}>{formatTime(n.createdAt)}</Box>
                </Box>
              );
            })
          )}
        </Box>

        {notificationsData?.pagination && notificationsData.pagination.pages > notificationPage && (
          <Box
            component="button"
            onClick={() => setNotificationPage(p => p + 1)}
            sx={{
              display: 'block', margin: '24px auto 0', padding: '12px 24px', borderRadius: '8px',
              border: '1px solid #E5E7EB', backgroundColor: colors.secondary.white, fontFamily: "'Outfit', sans-serif",
              fontSize: '14px', fontWeight: 500, color: colors.primary.navy, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' },
            }}
          >
            Load previous notifications
          </Box>
        )}
      </Box>
    );
  };

  const handleSubscribe = (plan: string) => {
    setSelectedPlan(plan);
    setSubscriptionView('checkout');
  };

  const handleCheckoutContinue = async () => {
    if (!selectedPlan) return;
    
    try {
      const planTier = selectedPlan === 'Standard' ? 'STANDARD' : 'ENTERPRISE';
      const result = await createCheckout({ planTier, billingCycle: 'yearly' }).unwrap();
      
      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create checkout session');
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    setSubscriptionView('subscribed');
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription({ immediately: false }).unwrap();
      toast.success('Subscription will be cancelled at the end of the billing period');
      setCancelModalOpen(false);
      setSubscriptionView('plans');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to cancel subscription');
    }
  };

  const subscriptionHistory = [
    { id: '1', planType: 'Pro', amount: '£99.00', billingCycle: 'Annually', date: '01/02/2026', transactionId: 'TXN123456789', status: 'Active' },
    { id: '2', planType: 'Pro', amount: '£99.00', billingCycle: 'Annually', date: '01/02/2026', transactionId: 'TXN123456789', status: 'Renewed' },
    { id: '3', planType: 'Pro', amount: '£99.00', billingCycle: 'Annually', date: '01/02/2026', transactionId: 'TXN123456789', status: 'Cancelled' },
    { id: '4', planType: 'Pro', amount: '£99.00', billingCycle: 'Annually', date: '01/02/2026', transactionId: 'TXN123456789', status: 'Renewed' },
    { id: '5', planType: 'Starter', amount: '£0.00', billingCycle: 'Annually', date: '01/02/2026', transactionId: 'TXN123456789', status: 'Renewed' },
  ];

  const renderPlansView = () => {
    const currentPlan = subscriptionData?.planTier || 'FREE';
    const isTrialing = subscriptionData?.isTrialing;
    const daysRemaining = subscriptionData?.daysRemaining;
    
    // Get plans from API
    const plans = plansData?.plans || [];
    const freePlan = plans.find((p: any) => p.id === 'FREE');
    const standardPlan = plans.find((p: any) => p.id === 'STANDARD');
    const enterprisePlan = plans.find((p: any) => p.id === 'ENTERPRISE');
    const freeTrialDays = plansData?.freeTrialDays || 180;

    return (
      <Box>
        {/* Current Subscription Status */}
        {subscriptionLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            backgroundColor: isTrialing ? '#FEF3C7' : '#D1FAE5', 
            padding: '16px 20px', 
            borderRadius: '8px', 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: isTrialing ? '#92400E' : '#065F46' }}>
                {isTrialing ? '🎉 Free Trial Active' : `Current Plan: ${currentPlan}`}
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: isTrialing ? '#B45309' : '#047857', marginTop: '2px' }}>
                {daysRemaining !== null && daysRemaining !== undefined 
                  ? `${daysRemaining} days remaining` 
                  : 'Unlimited access'}
              </Box>
            </Box>
            {isTrialing && daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= 30 && (
              <Box sx={{ 
                fontFamily: "'Outfit', sans-serif", 
                fontSize: '12px', 
                fontWeight: 600, 
                color: '#DC2626',
                backgroundColor: '#FEE2E2',
                padding: '6px 12px',
                borderRadius: '4px'
              }}>
                Upgrade soon to avoid interruption
              </Box>
            )}
          </Box>
        )}

        <PlansGrid>
          <PlanCard>
            <PlanName>
              STARTER {currentPlan === 'FREE' && <CurrentBadge>CURRENT PLAN</CurrentBadge>}
            </PlanName>
            <PlanPrice><span className="amount">£0</span><span className="period">/month</span></PlanPrice>
            <BilledText>Free trial for {freeTrialDays} days</BilledText>
            <FeatureList>
              {freePlan?.features?.slice(0, 5).map((feature: string, idx: number) => (
                <FeatureItem key={idx}><CheckCircle /> {feature}</FeatureItem>
              )) || (
                <>
                  <FeatureItem><CheckCircle /> Free trial</FeatureItem>
                  <FeatureItem><CheckCircle /> {freeTrialDays} days access</FeatureItem>
                  <FeatureItem><CheckCircle /> Unlimited workers</FeatureItem>
                  <FeatureItem><CheckCircle /> Full scheduling features</FeatureItem>
                  <FeatureItem><CheckCircle /> Email support</FeatureItem>
                </>
              )}
            </FeatureList>
            <SubscribeBtn variant="disabled" disabled>
              {currentPlan === 'FREE' ? 'Current Plan' : 'Free Trial'}
            </SubscribeBtn>
          </PlanCard>

          <PlanCard sx={{ border: '2px solid ' + colors.primary.blue }}>
            <PlanName>STANDARD 👑 {currentPlan === 'STANDARD' && <CurrentBadge>CURRENT PLAN</CurrentBadge>}</PlanName>
            <PlanPrice>
              <span className="amount">£{standardPlan?.monthlyPrice || 500}</span>
              <span className="period">/month</span>
            </PlanPrice>
            <BilledText>
              Billed annually (£{standardPlan?.yearlyPrice?.toLocaleString() || '5,000'}/year)
            </BilledText>
            <FeatureList>
              {standardPlan?.features?.slice(0, 5).map((feature: string, idx: number) => (
                <FeatureItem key={idx}><CheckCircle /> {feature}</FeatureItem>
              )) || (
                <>
                  <FeatureItem><CheckCircle /> Unlimited workers</FeatureItem>
                  <FeatureItem><CheckCircle /> Unlimited clients</FeatureItem>
                  <FeatureItem><CheckCircle /> Compliance management</FeatureItem>
                  <FeatureItem><CheckCircle /> Priority support</FeatureItem>
                  <FeatureItem><CheckCircle /> API access</FeatureItem>
                </>
              )}
            </FeatureList>
            <SubscribeBtn 
              variant={currentPlan === 'STANDARD' ? 'disabled' : 'primary'} 
              onClick={() => currentPlan !== 'STANDARD' && handleSubscribe('Standard')}
              disabled={currentPlan === 'STANDARD'}
            >
              {currentPlan === 'STANDARD' ? 'Current Plan' : 'Upgrade to Standard'}
            </SubscribeBtn>
          </PlanCard>

          <PlanCard>
            <PlanName>ENTERPRISE {currentPlan === 'ENTERPRISE' && <CurrentBadge>CURRENT PLAN</CurrentBadge>}</PlanName>
            <PlanPrice><span className="amount">Custom</span><span className="period">/month</span></PlanPrice>
            <BilledText>Contact for pricing</BilledText>
            <FeatureList>
              {enterprisePlan?.features?.slice(0, 5).map((feature: string, idx: number) => (
                <FeatureItem key={idx}><CheckCircle /> {feature}</FeatureItem>
              )) || (
                <>
                  <FeatureItem><CheckCircle /> Everything in Standard</FeatureItem>
                  <FeatureItem><CheckCircle /> White-label branding</FeatureItem>
                  <FeatureItem><CheckCircle /> Custom integrations</FeatureItem>
                  <FeatureItem><CheckCircle /> Dedicated account manager</FeatureItem>
                  <FeatureItem><CheckCircle /> 24/7 phone support</FeatureItem>
                </>
              )}
            </FeatureList>
            <SubscribeBtn 
              variant={currentPlan === 'ENTERPRISE' ? 'disabled' : 'primary'} 
              onClick={() => currentPlan !== 'ENTERPRISE' && handleSubscribe('Enterprise')}
              disabled={currentPlan === 'ENTERPRISE'}
            >
              {currentPlan === 'ENTERPRISE' ? 'Current Plan' : 'Contact Sales'}
            </SubscribeBtn>
          </PlanCard>
        </PlansGrid>
      </Box>
    );
  };

  const renderCheckoutView = () => {
    // Get pricing from API
    const plans = plansData?.plans || [];
    const standardPlan = plans.find((p: any) => p.id === 'STANDARD');
    const planPrice = selectedPlan === 'Standard' 
      ? (standardPlan?.monthlyPrice || 500) 
      : 0; // Enterprise = custom pricing
    const vatAmount = (planPrice * 0.2).toFixed(2);
    const totalAmount = (planPrice * 1.2).toFixed(2);

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', '@media (max-width: 900px)': { gridTemplateColumns: '1fr' } }}>
        <SectionCard>
          <SectionTitle>Subscription details ({selectedPlan} Plan)</SectionTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>Monthly subscription x 12</Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy }}>£{planPrice}.00</Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>VAT (20%)</Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy }}>£{vatAmount}</Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy }}>Total (per month)</Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700, color: colors.primary.navy }}>£{totalAmount}</Box>
          </Box>
          <Box 
            component="button" 
            onClick={() => setSubscriptionView('plans')}
            sx={{ 
              marginTop: '16px', padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: '6px',
              backgroundColor: 'transparent', fontFamily: "'Outfit', sans-serif", fontSize: '13px',
              color: colors.text.secondary, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' }
            }}
          >
            ← Back to plans
          </Box>
        </SectionCard>

        <SectionCard>
          <SectionTitle>Payment Information</SectionTitle>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy, marginBottom: '16px' }}>Pay With</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '2px solid ' + colors.primary.blue, borderRadius: '8px', marginBottom: '24px' }}>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + colors.primary.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.primary.blue }} />
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.primary.navy }}>Stripe (Secure Payment)</Box>
          </Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginBottom: '16px' }}>
            You will be redirected to Stripe to complete your payment securely.
          </Box>
          <Box
            component="button"
            onClick={handleCheckoutContinue}
            disabled={checkoutLoading}
            sx={{
              width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
              backgroundColor: checkoutLoading ? '#9CA3AF' : colors.primary.navy, fontFamily: "'Outfit', sans-serif",
              fontSize: '14px', fontWeight: 600, color: colors.secondary.white,
              cursor: checkoutLoading ? 'not-allowed' : 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              '&:hover': { backgroundColor: checkoutLoading ? '#9CA3AF' : '#1a2d4a' },
            }}
          >
            {checkoutLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : null}
            {checkoutLoading ? 'Redirecting to Stripe...' : 'Continue to Payment'}
          </Box>
        </SectionCard>
      </Box>
    );
  };

  const renderSubscribedView = () => {
    const planName = subscriptionData?.planTier === 'STANDARD' ? 'Pro' : subscriptionData?.planTier === 'ENTERPRISE' ? 'Enterprise' : 'Free';
    const statusColor = subscriptionData?.status === 'ACTIVE' ? colors.status.success : subscriptionData?.status === 'CANCELED' ? colors.status.error : '#D97706';
    const startDate = subscriptionData?.trialEnd ? new Date(subscriptionData.trialEnd).toLocaleDateString('en-GB') : '-';
    const nextBillingDate = subscriptionData?.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('en-GB') : '-';
    const planCost = subscriptionData?.planTier === 'STANDARD' ? '£99.00' : subscriptionData?.planTier === 'ENTERPRISE' ? 'Custom' : '£0.00';

    return (
    <Box>
      {/* Current Plan Info */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px', '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
        <Box sx={{ backgroundColor: colors.secondary.white, padding: '16px 20px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Current Plan</Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: colors.primary.navy }}>{planName}</Box>
        </Box>
        <Box sx={{ backgroundColor: colors.secondary.white, padding: '16px 20px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Status</Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: statusColor }}>{subscriptionData?.status || 'Unknown'}</Box>
        </Box>
        <Box sx={{ backgroundColor: colors.secondary.white, padding: '16px 20px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Start Date</Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: colors.primary.navy }}>{startDate}</Box>
        </Box>
        <Box sx={{ backgroundColor: colors.secondary.white, padding: '16px 20px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Next Billing Date</Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: colors.primary.navy }}>{nextBillingDate}</Box>
        </Box>
        <Box sx={{ backgroundColor: colors.secondary.white, padding: '16px 20px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Cost</Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: colors.primary.navy }}>{planCost}/month</Box>
        </Box>
      </Box>

      {/* Subscription History Table */}
      <TableCard>
        <CardHeader><h3>Subscription History</h3></CardHeader>
        <FilterRow>
          <FilterLeft>
            <SearchInput
              placeholder="Search here..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FilterButton><FilterList sx={{ fontSize: 18 }} /> Filter</FilterButton>
          </FilterLeft>
          <FilterRight>
            <DropdownButton>Role <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <DropdownButton>All Status <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <ExportButton>Export as XLS <FileDownload sx={{ fontSize: 18 }} /></ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                <Th>Plan Type</Th>
                <Th>Amount</Th>
                <Th>Billing Cyle</Th>
                <Th>Date</Th>
                <Th>Transaction ID</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {subscriptionHistory.map((item) => (
                <tr key={item.id}>
                  <Td><Checkbox size="small" /></Td>
                  <Td>{item.planType}</Td>
                  <Td>{item.amount}</Td>
                  <Td>{item.billingCycle}</Td>
                  <Td>{item.date}</Td>
                  <Td>{item.transactionId}</Td>
                  <Td>
                    <StatusBadge status={item.status}>{item.status}</StatusBadge>
                  </Td>
                  <Td>
                    <IconButton size="small" onClick={(e) => setSubscriptionMenuAnchor(e.currentTarget)}>
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>

        <MuiMenu
          anchorEl={subscriptionMenuAnchor}
          open={Boolean(subscriptionMenuAnchor)}
          onClose={() => setSubscriptionMenuAnchor(null)}
          PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '180px' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.primary.navy, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' } }} onClick={() => setSubscriptionMenuAnchor(null)}>
            <Refresh sx={{ fontSize: 18 }} /> Renew subscription
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.primary.navy, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' } }} onClick={() => { setSubscriptionMenuAnchor(null); setSubscriptionView('plans'); }}>
            <Upload sx={{ fontSize: 18 }} /> Upgrade subscription
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.status.error, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' } }} onClick={() => { setSubscriptionMenuAnchor(null); setCancelModalOpen(true); }}>
            <Cancel sx={{ fontSize: 18 }} /> Cancel subscription
          </Box>
        </MuiMenu>

        <PaginationRow>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}>
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>Showing 10 out of 100 items</PaginationText>
          <PaginationControls>
            <PageButton disabled><ChevronLeft sx={{ fontSize: 18 }} /></PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>1</PageButton>
            <PageButton><ChevronRight sx={{ fontSize: 18 }} /></PageButton>
          </PaginationControls>
        </PaginationRow>
      </TableCard>
    </Box>
  );
  };

  const renderSubscription = () => {
    switch (subscriptionView) {
      case 'plans': return renderPlansView();
      case 'checkout': return renderCheckoutView();
      case 'subscribed': return renderSubscribedView();
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'agency': return renderAgencyProfile();
      case 'users': return renderUsersPermission();
      case 'notification': return renderNotification();
      case 'subscription': return renderSubscription();
    }
  };

  const getHeaderButtons = () => {
    if (activeTab === 'agency') {
      return (
        <ButtonsRow>
          <EditProfileBtn onClick={() => setIsEditing(!isEditing)}>
            <Edit sx={{ fontSize: 18 }} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </EditProfileBtn>
          <ChangePassBtn onClick={() => setPasswordOpen(true)}><Lock sx={{ fontSize: 18 }} /> Change password</ChangePassBtn>
        </ButtonsRow>
      );
    }
    if (activeTab === 'users') {
      return (
        <InviteBtn onClick={() => setRoleOpen(true)}>
          <Add sx={{ fontSize: 18 }} /> Add New Role
        </InviteBtn>
      );
    }
    if (activeTab === 'subscription' && subscriptionView === 'subscribed') {
      return (
        <InviteBtn onClick={() => setSubscriptionView('plans')}>
          <Refresh sx={{ fontSize: 18 }} /> View Plans
        </InviteBtn>
      );
    }
    return null;
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Settings</PageTitle>
          <PageSubtitle>Manage your agency profile, team, billing profile</PageSubtitle>
        </TitleSection>
        {getHeaderButtons()}
      </HeaderRow>

      <TabsRow>
        <Tab active={activeTab === 'agency'} onClick={() => setActiveTab('agency')}>Agency Profile</Tab>
        <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Users & Permission</Tab>
        <Tab active={activeTab === 'notification'} onClick={() => setActiveTab('notification')}>Notification</Tab>
        <Tab active={activeTab === 'subscription'} onClick={() => setActiveTab('subscription')}>Subscription</Tab>
      </TabsRow>

      {getTabContent()}

      {/* Modals */}
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <AddRoleModal open={roleOpen} onClose={() => setRoleOpen(false)} />
      <AddLocationModal open={locationOpen} onClose={() => { setLocationOpen(false); setEditingLocation(null); }} editLocation={editingLocation} />
      <SubscriptionSuccessModal open={successModalOpen} onClose={handleSuccessClose} />
      <CancelSubscriptionModal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelSubscription} />
      <DeleteAccountModal open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </DashboardContainer>
  );
}

export default SettingsPage;
