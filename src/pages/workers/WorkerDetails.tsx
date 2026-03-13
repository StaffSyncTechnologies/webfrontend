import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Work,
  AttachMoney,
  AccessTime,
  CheckCircle as CheckCircleIcon,
  Email,
  Phone,
  Badge,
  LocationOn,
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
  Check,
  Close,
  Delete,
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
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { InviteWorkerModal } from '../../components/modals';
import { colors } from '../../utilities/colors';
import {
  useGetWorkerByIdQuery,
  useGetWorkerStatsQuery,
  useGetWorkerShiftsQuery,
  useGetWorkerPayslipsQuery,
  useGetWorkerHolidaysQuery,
  useGetWorkerSkillsQuery,
  useGetWorkerDocumentsQuery,
  useCreateWorkerBlockMutation,
} from '../../store/slices/workerSlice';

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

const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const InviteButton = styled('button')({
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

// Profile Card
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

// Stats Row
const StatsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  marginBottom: '24px',
  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
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

// Tabs and Table
const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
});

const TabsRow = styled(Box)({
  display: 'flex',
  borderBottom: '1px solid #E5E7EB',
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
  padding: '16px 24px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': { color: colors.primary.navy },
}));

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

const ShiftTitleCell = styled(Box)({
  '& .title': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .id': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    marginTop: '2px',
  },
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = {
    upcoming: '#DBEAFE',
    ongoing: '#F3F4F6',
    completed: '#D1FAE5',
    'no show': '#FFE4E6',
    approved: '#D1FAE5',
    pending: '#FEF3C7',
    rejected: '#FFE4E6',
    processing: '#FEF3C7',
    paid: '#D1FAE5',
  };
  const colorMap: Record<string, string> = {
    upcoming: '#2563EB',
    ongoing: '#6B7280',
    completed: '#059669',
    'no show': '#DC2626',
    approved: '#059669',
    pending: '#D97706',
    rejected: '#DC2626',
    processing: '#D97706',
    paid: '#059669',
  };
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

const ActionLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
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

type TabKey = 'skills' | 'shifts' | 'payslips' | 'holidays';

// ============ COMPONENT ============
export function WorkerDetails() {
  useDocumentTitle('Worker Details');
  const navigate = useNavigate();
  const { id: workerId } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('shifts');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  // RTK Query hooks
  const { data: workerData, isLoading: workerLoading } = useGetWorkerByIdQuery(workerId!, { skip: !workerId });
  const { data: statsData } = useGetWorkerStatsQuery(workerId!, { skip: !workerId });
  const { data: shiftsData } = useGetWorkerShiftsQuery(
    { workerId: workerId!, page: currentPage, limit: rowsPerPage },
    { skip: !workerId }
  );
  const { data: payslipsData } = useGetWorkerPayslipsQuery(
    { workerId: workerId!, page: currentPage, limit: rowsPerPage },
    { skip: !workerId }
  );
  const { data: holidaysData } = useGetWorkerHolidaysQuery(
    { workerId: workerId!, page: currentPage, limit: rowsPerPage },
    { skip: !workerId }
  );
  const { data: skillsData } = useGetWorkerSkillsQuery(workerId!, { skip: !workerId });
  const { data: documentsData } = useGetWorkerDocumentsQuery(workerId!, { skip: !workerId });
  const [createBlock] = useCreateWorkerBlockMutation();

  // Extract worker info
  const worker = useMemo(() => {
    const w = (workerData as any)?.data || workerData;
    return {
      id: w?.id || '',
      fullName: w?.fullName || '',
      name: w?.fullName || '',
      email: w?.email || '',
      phone: w?.phone || '',
      workerId: `#WK-${w?.id?.slice(-6).toUpperCase() || '000000'}`,
      location: w?.workerProfile?.address || 'Not specified',
      avatar: w?.profilePicUrl || '',
      verified: w?.verified || false,
    };
  }, [workerData]);

  // Extract stats
  const stats = useMemo(() => {
    const s = (statsData as any)?.data || statsData;
    return {
      totalShifts: s?.totalShifts || 0,
      totalEarnings: `£${(s?.totalEarnings || 0).toFixed(2)}`,
      totalHours: s?.totalHours || '0h 0m',
      attendanceRate: `${s?.attendanceRate || 0}%`,
    };
  }, [statsData]);

  // Extract shift history
  const shiftHistory = useMemo(() => {
    const raw = shiftsData as any;
    const shifts = Array.isArray(raw?.data?.data) ? raw.data.data : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return shifts.map((s: any) => ({
      id: s.id,
      shiftId: s.shiftCode,
      title: s.title,
      location: s.location,
      date: s.date,
      duration: s.duration,
      status: s.status,
    }));
  }, [shiftsData]);

  // Extract payslips
  const payslips = useMemo(() => {
    const raw = payslipsData as any;
    const pays = Array.isArray(raw?.data?.data) ? raw.data.data : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return pays.map((p: any) => ({
      id: p.id,
      dateTime: `${p.periodStart} | ${p.periodEnd}`,
      payRate: `£${(p.payRate || 0).toFixed(2)}`,
      grossPay: `£${(p.grossPay || 0).toFixed(2)}`,
      deductions: `£${(p.deductions || 0).toFixed(2)}`,
      netPay: `£${(p.netPay || 0).toFixed(2)}`,
      status: p.status,
    }));
  }, [payslipsData]);

  // Extract holidays
  const holidays = useMemo(() => {
    const raw = holidaysData as any;
    const hols = Array.isArray(raw?.data?.data) ? raw.data.data : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return hols.map((h: any) => ({
      id: h.id,
      type: h.type || 'Holiday',
      startDate: h.startDate,
      endDate: h.endDate,
      duration: `${h.days || 1} days`,
      status: h.status,
    }));
  }, [holidaysData]);

  // Extract skills and documents
  const skillsAndDocs = useMemo(() => {
    const rawSkills = Array.isArray(skillsData) ? skillsData : (skillsData as any)?.data || [];
    const skills = rawSkills?.map((s: any) => ({
      name: s.skill?.name || s.name || 'Unknown',
      type: 'Skill',
      expiryDate: '-',
      status: 'approved',
    }));
    const rawDocs = Array.isArray(documentsData) ? documentsData : (documentsData as any)?.data || [];
    const docs = rawDocs?.map((d: any) => ({
      name: d.name || d.type || 'Document',
      type: 'Document',
      expiryDate: d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-GB') : '-',
      status: d.verified ? 'approved' : d.expiryDate && new Date(d.expiryDate) < new Date() ? 'rejected' : 'pending',
    }));
    return [...(skills || []), ...(docs || [])];
  }, [skillsData, documentsData]);

  // Pagination info
  const getPagination = () => {
    switch (activeTab) {
      case 'shifts': return shiftsData?.pagination;
      case 'payslips': return payslipsData?.pagination;
      case 'holidays': return holidaysData?.pagination;
      default: return null;
    }
  };
  const pagination = getPagination();

  const handleBlockWorker = async () => {
    if (!workerId) return;
    try {
      await createBlock({ workerId, reason: 'Blocked by admin' }).unwrap();
    } catch (err) {
      console.error('Failed to block worker:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleMenuClose = () => setMenuAnchor(null);

  
  const renderShiftHistory = () => (
    <>
      <thead>
        <tr>
          <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
          <Th>Shift Title & ID</Th>
          <Th>Location</Th>
          <Th>Date</Th>
          <Th>Duration</Th>
          <Th>Status</Th>
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody>
        {shiftHistory.map((s: any) => (
          <tr key={s.id}>
            <Td><Checkbox size="small" /></Td>
            <Td>
              <ShiftTitleCell>
                <div className="title">{s.title}</div>
                <div className="id">{s.shiftId}</div>
              </ShiftTitleCell>
            </Td>
            <Td>{s.location}</Td>
            <Td>{s.date}</Td>
            <Td>{s.duration}</Td>
            <Td><StatusBadge status={s.status}>{s.status}</StatusBadge></Td>
            <Td>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert sx={{ fontSize: 18 }} />
              </IconButton>
            </Td>
          </tr>
        ))}
      </tbody>
    </>
  );

  const renderPayslips = () => (
    <>
      <thead>
        <tr>
          <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
          <Th>Date & Time</Th>
          <Th>Pay rate (per hour)</Th>
          <Th>Grosspay</Th>
          <Th>Deductions</Th>
          <Th>Netpay</Th>
          <Th>Status</Th>
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody>
        {payslips.map((p: any) => (
          <tr key={p.id}>
            <Td><Checkbox size="small" /></Td>
            <Td>{p.dateTime}</Td>
            <Td>{p.payRate}</Td>
            <Td>{p.grossPay}</Td>
            <Td>{p.deductions}</Td>
            <Td>{p.netPay}</Td>
            <Td><StatusBadge status={p.status}>{p.status}</StatusBadge></Td>
            <Td><ActionLink>Download receipt</ActionLink></Td>
          </tr>
        ))}
      </tbody>
    </>
  );

  const renderHolidays = () => (
    <>
      <thead>
        <tr>
          <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
          <Th>Type</Th>
          <Th>Start Date</Th>
          <Th>End Date</Th>
          <Th>Duration</Th>
          <Th>Status</Th>
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody>
        {holidays.map((h: any) => (
          <tr key={h.id}>
            <Td><Checkbox size="small" /></Td>
            <Td>{h.type}</Td>
            <Td>{h.startDate}</Td>
            <Td>{h.endDate}</Td>
            <Td>{h.duration}</Td>
            <Td><StatusBadge status={h.status}>{h.status}</StatusBadge></Td>
            <Td>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert sx={{ fontSize: 18 }} />
              </IconButton>
            </Td>
          </tr>
        ))}
      </tbody>
    </>
  );

  const renderSkills = () => (
    <>
      <thead>
        <tr>
          <Th>Skill / Document</Th>
          <Th>Type</Th>
          <Th>Expiry Date</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {skillsAndDocs.length === 0 ? (
          <tr>
            <Td colSpan={4} style={{ textAlign: 'center', color: '#9CA3AF' }}>
              No skills or documents found
            </Td>
          </tr>
        ) : (
          skillsAndDocs.map((item, index) => (
            <tr key={index}>
              <Td>{item.name}</Td>
              <Td>{item.type}</Td>
              <Td>{item.expiryDate}</Td>
              <Td>
                <StatusBadge status={item.status}>
                  {item.status === 'approved' ? 'Valid' : item.status === 'pending' ? 'Pending' : 'Expired'}
                </StatusBadge>
              </Td>
            </tr>
          ))
        )}
      </tbody>
    </>
  );

  const getTableContent = () => {
    switch (activeTab) {
      case 'shifts': return renderShiftHistory();
      case 'payslips': return renderPayslips();
      case 'holidays': return renderHolidays();
      case 'skills': return renderSkills();
    }
  };

  const getShiftMenuItems = () => (
    <>
      <ActionMenuItem onClick={handleMenuClose}>
        <Visibility /> View shift
      </ActionMenuItem>
      <ActionMenuItem danger onClick={handleMenuClose}>
        <Delete /> Delete Shift
      </ActionMenuItem>
    </>
  );

  const getHolidayMenuItems = () => (
    <>
      <ActionMenuItem onClick={handleMenuClose}>
        <Visibility /> View Request
      </ActionMenuItem>
      <ActionMenuItem onClick={handleMenuClose}>
        <Check /> Approve Request
      </ActionMenuItem>
      <ActionMenuItem danger onClick={handleMenuClose}>
        <Close /> Reject Request
      </ActionMenuItem>
    </>
  );

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/workers')}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <HeaderRow>
        <Breadcrumb>
          <span>Workers</span>
          <span>{'>'}</span>
          <span className="current">Workers Details</span>
        </Breadcrumb>
        <InviteButton onClick={() => setInviteOpen(true)}>
          <Add sx={{ fontSize: 18 }} /> Invite New Worker
        </InviteButton>
      </HeaderRow>

      {/* Profile Card */}
      <ProfileCard>
        <ProfileCardTitle>Worker Details</ProfileCardTitle>
        {workerLoading ? (
          <Box sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>Loading worker details...</Box>
        ) : !worker ? (
          <Box sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>Worker not found</Box>
        ) : (
          <ProfileRow>
            <ProfileLeft>
              <Avatar 
                src={worker.avatar} 
                sx={{ width: 80, height: 80, bgcolor: '#E5E7EB', fontSize: 28 }}
              >
                {worker.name.charAt(0)}
              </Avatar>
              <ProfileInfo>
                <ProfileName>
                  <h3>{worker.name}</h3>
                  {worker.verified && <VerifiedTag>Verified</VerifiedTag>}
                </ProfileName>
                <ProfileMeta>
                  <MetaItem><Email /> {worker.email || 'No email'}</MetaItem>
                  <MetaItem><Phone /> {worker.phone || 'No phone'}</MetaItem>
                </ProfileMeta>
                <ProfileMeta style={{ marginTop: '4px' }}>
                  <MetaItem><Badge /> {worker.workerId}</MetaItem>
                  <MetaItem><LocationOn /> {worker.location}</MetaItem>
                </ProfileMeta>
              </ProfileInfo>
            </ProfileLeft>
            <BlockButton onClick={handleBlockWorker}>
              <Block sx={{ fontSize: 18 }} /> Block worker
            </BlockButton>
          </ProfileRow>
        )}
      </ProfileCard>

      {/* Stats */}
      <StatsRow>
        <StatItem>
          <StatIcon bgColor="#E0F2FE" iconColor="#3B82F6"><Work /></StatIcon>
          <StatText>
            <div className="label">Total Shifts</div>
            <div className="value">{stats.totalShifts}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#D1FAE5" iconColor="#10B981"><AttachMoney /></StatIcon>
          <StatText>
            <div className="label">Total Earnings</div>
            <div className="value">{stats.totalEarnings}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#FEF3C7" iconColor="#F59E0B"><AccessTime /></StatIcon>
          <StatText>
            <div className="label">Total Hours</div>
            <div className="value">{stats.totalHours}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#EDE9FE" iconColor="#7C3AED"><CheckCircleIcon /></StatIcon>
          <StatText>
            <div className="label">Attendance Rate</div>
            <div className="value">{stats.attendanceRate}</div>
          </StatText>
        </StatItem>
      </StatsRow>

      {/* Tabs + Table */}
      <TableCard>
        <TabsRow>
          <Tab active={activeTab === 'skills'} onClick={() => { setActiveTab('skills'); setCurrentPage(1); }}>Skills and Documents</Tab>
          <Tab active={activeTab === 'shifts'} onClick={() => { setActiveTab('shifts'); setCurrentPage(1); }}>Shift History</Tab>
          <Tab active={activeTab === 'payslips'} onClick={() => { setActiveTab('payslips'); setCurrentPage(1); }}>Payslips</Tab>
          <Tab active={activeTab === 'holidays'} onClick={() => { setActiveTab('holidays'); setCurrentPage(1); }}>Holiday Request</Tab>
        </TabsRow>

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
            <ExportButton>
              Export as {activeTab === 'holidays' ? 'XLS' : 'CSV'} <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>{getTableContent()}</Table>
        </Box>

        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '180px' },
          }}
        >
          {activeTab === 'shifts' ? getShiftMenuItems() : getHolidayMenuItems()}
        </MuiMenu>

        <PaginationRow>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              size="small"
              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}
            >
              <MenuItem value={5}>05</MenuItem>
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>
            Showing {pagination ? Math.min(pagination.limit, pagination.total - (pagination.page - 1) * pagination.limit) : 0} out of {pagination?.total || 0} items
          </PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>
              {currentPage}
            </PageButton>
            <PageButton 
              disabled={!pagination || currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </PaginationRow>
      </TableCard>

      <InviteWorkerModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </DashboardContainer>
  );
}

export default WorkerDetails;
