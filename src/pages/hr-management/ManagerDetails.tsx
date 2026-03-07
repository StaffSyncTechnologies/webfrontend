import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Work,
  EventNote,
  PendingActions,
  AccessTime,
  Email,
  Phone,
  Badge,
  SupervisorAccount,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Add,
  Block,
  MoreVert,
  Visibility,
  RemoveCircle,
  Close,
  CheckCircle,
  CalendarMonth,
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
  Modal,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import {
  useGetManagerQuery,
  useGetManagedWorkersQuery,
  useUpdateManagerStatusMutation,
  useAssignWorkersMutation,
  useUnassignWorkersMutation,
  useGetUnassignedWorkersQuery,
} from '../../store/slices/hrSlice';
import { CircularProgress } from '@mui/material';

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

const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const Breadcrumb = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  '& .current': { fontWeight: 600, color: colors.primary.navy },
});

const AssignButton = styled('button')({
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

const ActiveTag = styled('span')({
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

const BlockButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
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
  gap: '10px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
});

const RtwBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = { verified: '#D1FAE5', pending: '#FEF3C7', expired: '#FFE4E6' };
  const colorMap: Record<string, string> = { verified: '#059669', pending: '#D97706', expired: '#DC2626' };
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

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = { active: '#D1FAE5', inactive: '#F3F4F6', blocked: '#FFE4E6' };
  const colorMap: Record<string, string> = { active: '#059669', inactive: '#6B7280', blocked: '#DC2626' };
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

const ActionMenuItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'danger',
})<{ danger?: boolean }>(({ danger }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: danger ? colors.status.error : colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '& svg': { fontSize: '18px' },
}));

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
  width: '520px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 4px',
  textAlign: 'center',
});

const ModalSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
  lineHeight: 1.6,
});

const FormGroup = styled(Box)({
  marginBottom: '16px',
});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  marginBottom: '8px',
  '& .required': { color: colors.status.error },
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

const SubmitBtn = styled('button')({
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
  marginTop: '8px',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const SuccessIcon = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': { fontSize: '48px', color: colors.status.success },
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
const getRtwDisplay = (status: string | null | undefined): string => {
  switch (status) {
    case 'APPROVED': return 'Verified';
    case 'PENDING': return 'Pending';
    case 'REJECTED': return 'Rejected';
    case 'EXPIRED': return 'Expired';
    default: return 'Not Submitted';
  }
};

const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'SUSPENDED': return 'Blocked';
    case 'INVITED': return 'Invited';
    default: return status;
  }
};

const getRoleDisplay = (role: string): string => {
  switch (role) {
    case 'OPS_MANAGER': return 'OPS Manager';
    case 'SHIFT_COORDINATOR': return 'Shift Coordinator';
    case 'COMPLIANCE_OFFICER': return 'Compliance Officer';
    default: return role;
  }
};

// ============ COMPONENT ============
export function ManagerDetails() {
  useDocumentTitle('Manager Details');
  const navigate = useNavigate();
  const { managerId } = useParams<{ managerId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [assignedCount, setAssignedCount] = useState(0);

  // API Hooks
  const { data: manager, isLoading: managerLoading, error: managerError } = useGetManagerQuery(managerId || '');
  const { data: managedWorkers = [], isLoading: workersLoading } = useGetManagedWorkersQuery(managerId || '');
  const { data: unassignedWorkers = [] } = useGetUnassignedWorkersQuery();
  const [updateStatus, { isLoading: statusUpdating }] = useUpdateManagerStatusMutation();
  const [assignWorkers, { isLoading: assigning }] = useAssignWorkersMutation();
  const [unassignWorkers] = useUnassignWorkersMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workerId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedWorkerId(workerId);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedWorkerId(null);
  };

  const handleBlockManager = async () => {
    if (!managerId || !manager) return;
    const newStatus = manager.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await updateStatus({ managerId, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Failed to update manager status:', error);
    }
  };

  const handleRemoveWorker = async () => {
    if (!selectedWorkerId) return;
    try {
      await unassignWorkers({ workerIds: [selectedWorkerId] }).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to remove worker:', error);
    }
  };

  const handleAssignSubmit = async () => {
    if (!managerId || selectedWorkerIds.length === 0) return;
    try {
      const result = await assignWorkers({ managerId, workerIds: selectedWorkerIds }).unwrap();
      setAssignedCount(result.assignedCount);
      setAssignOpen(false);
      setSelectedWorkerIds([]);
      setSuccessOpen(true);
    } catch (error) {
      console.error('Failed to assign workers:', error);
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  if (managerLoading) {
    return (
      <DashboardContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  if (managerError || !manager) {
    return (
      <DashboardContainer>
        <BackLink onClick={() => navigate('/hr-management')}>
          <ArrowBack sx={{ fontSize: 18 }} /> Go back
        </BackLink>
        <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary }}>
          Manager not found or an error occurred.
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/hr-management')}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <HeaderRow>
        <Breadcrumb>
          <span>HR Management</span>
          <span>{'>'}</span>
          <span className="current">Manger Details</span>
        </Breadcrumb>
        <AssignButton onClick={() => setAssignOpen(true)}>
          <Add sx={{ fontSize: 18 }} /> Assign Worker
        </AssignButton>
      </HeaderRow>

      {/* Profile */}
      <ProfileCard>
        <ProfileCardTitle>Manager Details</ProfileCardTitle>
        <ProfileRow>
          <ProfileLeft>
            <Avatar sx={{ width: 80, height: 80, bgcolor: colors.primary.blue, fontSize: 28, fontWeight: 700 }}>
              {manager.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M'}
            </Avatar>
            <ProfileInfo>
              <ProfileName>
                <h3>{manager.fullName}</h3>
                <ActiveTag style={{
                  backgroundColor: manager.status === 'ACTIVE' ? '#D1FAE5' : '#FFE4E6',
                  color: manager.status === 'ACTIVE' ? '#059669' : '#DC2626',
                }}>
                  {getStatusDisplay(manager.status)}
                </ActiveTag>
              </ProfileName>
              <ProfileMeta>
                <MetaItem><Email /> {manager.email}</MetaItem>
                <MetaItem><Phone /> {manager.phone || 'Not provided'}</MetaItem>
              </ProfileMeta>
              <ProfileMeta style={{ marginTop: '4px' }}>
                <MetaItem><Badge /> #{manager.teamNumber || manager.id.slice(-8).toUpperCase()}</MetaItem>
                <MetaItem><SupervisorAccount /> {getRoleDisplay(manager.role)}</MetaItem>
              </ProfileMeta>
            </ProfileInfo>
          </ProfileLeft>
          <BlockButton onClick={handleBlockManager} disabled={statusUpdating}>
            <Block sx={{ fontSize: 18 }} /> {manager.status === 'SUSPENDED' ? 'Activate' : 'Block'} manager
          </BlockButton>
        </ProfileRow>
      </ProfileCard>

      {/* Stats */}
      <StatsRow>
        <StatItem>
          <StatIcon bgColor="#E0F2FE" iconColor="#3B82F6"><Work /></StatIcon>
          <StatText>
            <div className="label">Total Workers</div>
            <div className="value">{managedWorkers.length}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#D1FAE5" iconColor="#10B981"><EventNote /></StatIcon>
          <StatText>
            <div className="label">Active Workers</div>
            <div className="value">{managedWorkers.filter(w => w.status === 'ACTIVE').length}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#FEF3C7" iconColor="#F59E0B"><PendingActions /></StatIcon>
          <StatText>
            <div className="label">Verified RTW</div>
            <div className="value">{managedWorkers.filter(w => w.workerProfile?.rtwStatus === 'APPROVED').length}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#EDE9FE" iconColor="#7C3AED"><AccessTime /></StatIcon>
          <StatText>
            <div className="label">Compliance</div>
            <div className="value">
              {managedWorkers.length > 0 
                ? Math.round((managedWorkers.filter(w => w.workerProfile?.rtwStatus === 'APPROVED').length / managedWorkers.length) * 100)
                : 0}%
            </div>
          </StatText>
        </StatItem>
      </StatsRow>

      {/* Managed Workers Table */}
      <TableCard>
        <CardHeader><h3>Managed Workers</h3></CardHeader>

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
            <DropdownButton>Date Range <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <DropdownButton>All Status <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <ExportButton>Export as CSV <FileDownload sx={{ fontSize: 18 }} /></ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          {workersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <CircularProgress />
            </Box>
          ) : managedWorkers.length === 0 ? (
            <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary }}>
              No workers assigned to this manager.
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                  <Th>Worker</Th>
                  <Th>Email address</Th>
                  <Th>Phone</Th>
                  <Th>RTW Status</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {managedWorkers
                  .filter(w => 
                    !searchTerm || 
                    w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    w.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((w) => (
                    <tr key={w.id}>
                      <Td><Checkbox size="small" /></Td>
                      <Td>
                        <WorkerCell>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#E5E7EB', fontSize: 13 }}>
                            {w.fullName?.charAt(0) || 'W'}
                          </Avatar>
                          {w.fullName}
                        </WorkerCell>
                      </Td>
                      <Td>{w.email}</Td>
                      <Td>{w.phone || '-'}</Td>
                      <Td>
                        <RtwBadge status={getRtwDisplay(w.workerProfile?.rtwStatus)}>
                          {getRtwDisplay(w.workerProfile?.rtwStatus)}
                        </RtwBadge>
                      </Td>
                      <Td>
                        <StatusBadge status={getStatusDisplay(w.status)}>
                          {getStatusDisplay(w.status)}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, w.id)}>
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
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '170px' },
          }}
        >
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/workers/${selectedWorkerId}`); }}>
            <Visibility /> View profile
          </ActionMenuItem>
          <ActionMenuItem danger onClick={handleRemoveWorker}>
            <RemoveCircle /> Remove worker
          </ActionMenuItem>
        </MuiMenu>

        <PaginationRow>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              size="small"
              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>Showing {managedWorkers.length} worker(s)</PaginationText>
        </PaginationRow>
      </TableCard>

      {/* Assign Worker Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setAssignOpen(false)}><Close /></ModalClose>
            <ModalTitle>Assign Workers</ModalTitle>
            <ModalSubtitle>Select workers to assign to {manager.fullName}</ModalSubtitle>
            <FormGroup>
              <Label>Available Workers<span className="required">*</span></Label>
              {unassignedWorkers.length === 0 ? (
                <Box sx={{ padding: '16px', textAlign: 'center', color: colors.text.secondary, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                  No unassigned workers available
                </Box>
              ) : (
                <Box sx={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  {unassignedWorkers.map((worker) => (
                    <Box
                      key={worker.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderBottom: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        backgroundColor: selectedWorkerIds.includes(worker.id) ? '#EEF2FF' : 'transparent',
                        '&:hover': { backgroundColor: selectedWorkerIds.includes(worker.id) ? '#EEF2FF' : '#F9FAFB' },
                        '&:last-child': { borderBottom: 'none' },
                      }}
                      onClick={() => toggleWorkerSelection(worker.id)}
                    >
                      <Checkbox
                        checked={selectedWorkerIds.includes(worker.id)}
                        size="small"
                      />
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#E5E7EB', fontSize: 13 }}>
                        {worker.fullName?.charAt(0) || 'W'}
                      </Avatar>
                      <Box>
                        <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 500, color: colors.primary.navy }}>
                          {worker.fullName}
                        </Box>
                        <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>
                          {worker.email}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              {selectedWorkerIds.length > 0 && (
                <Box sx={{ marginTop: '8px', fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.primary.navy }}>
                  {selectedWorkerIds.length} worker(s) selected
                </Box>
              )}
            </FormGroup>
            <SubmitBtn 
              onClick={handleAssignSubmit} 
              disabled={selectedWorkerIds.length === 0 || assigning}
              style={{ opacity: selectedWorkerIds.length === 0 ? 0.5 : 1 }}
            >
              {assigning ? 'Assigning...' : `Assign ${selectedWorkerIds.length} Worker(s)`}
            </SubmitBtn>
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Success Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setSuccessOpen(false)}><Close /></ModalClose>
            <SuccessIcon><CheckCircle /></SuccessIcon>
            <ModalTitle>Successful</ModalTitle>
            <ModalSubtitle>
              You have successfully assigned <strong>{assignedCount} worker(s)</strong> to <strong>{manager.fullName}</strong> as their <strong>{getRoleDisplay(manager.role)}</strong>.
            </ModalSubtitle>
            <DoneButton onClick={() => setSuccessOpen(false)}>Done</DoneButton>
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default ManagerDetails;
