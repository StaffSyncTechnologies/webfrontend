import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Work,
  Receipt,
  ReceiptLong,
  AccessTime,
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
  Block,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { useClientDetails, clientKeys } from '../../hooks/api/useClientsApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import api from '../../services/api';
import { ViewInvoiceModal } from './ViewInvoiceModal';

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

// Tabs + Table
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

const WorkerCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = {
    upcoming: '#DBEAFE', ongoing: '#F3F4F6', completed: '#D1FAE5', 'no show': '#FFE4E6',
    paid: '#D1FAE5', pending: '#FEF3C7', overdue: '#FFE4E6', verified: '#D1FAE5',
  };
  const colorMap: Record<string, string> = {
    upcoming: '#2563EB', ongoing: '#6B7280', completed: '#059669', 'no show': '#DC2626',
    paid: '#059669', pending: '#D97706', overdue: '#DC2626', verified: '#059669',
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

const ActiveWorkersBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'count',
})<{ count: number }>(({ count }) => ({
  padding: '4px 12px',
  borderRadius: '16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: count > 0 ? '#D1FAE5' : '#F3F4F6',
  color: count > 0 ? '#059669' : '#6B7280',
}));

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

// Overview styles
const OverviewContent = styled(Box)({
  padding: '24px',
});

const SectionTitle = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 12px',
});

const AboutText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  lineHeight: 1.7,
  margin: '0 0 24px',
});

const DocsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
});

const DocItem = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
});

const DocIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'verified' | 'pending' | 'expired' }>(({ variant }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor:
    variant === 'verified' ? '#D1FAE5' :
    variant === 'pending' ? '#FEF3C7' : '#FFE4E6',
  color:
    variant === 'verified' ? '#059669' :
    variant === 'pending' ? '#D97706' : '#DC2626',
  '& svg': { fontSize: '18px' },
  flexShrink: 0,
}));

const DocInfo = styled(Box)({
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  '& .meta': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    marginTop: '2px',
  },
  '& .status-icon': {
    fontSize: '16px',
  },
});

const ContactCell = styled(Box)({
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .role': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

// ============ HELPERS ============
const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CL';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return '£0.00';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(amount));
};

type TabKey = 'overview' | 'department' | 'shifts' | 'payslips' | 'timesheet';

// Timesheet types
interface WeekData {
  weekNumber: number;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalShifts: number;
  totalWorkers: number;
  totalAmount: number;
  status: 'UNINVOICED' | 'INVOICED' | 'PARTIAL';
  invoiceId?: string;
}

// ============ COMPONENT ============
export function ClientDetails() {
  useDocumentTitle('Client Details');
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  // API hooks
  const { data: clientData, isLoading } = useClientDetails(id || '');

  const client = clientData || null;
  const recentShifts = clientData?.recentShifts || [];
  const recentInvoices = clientData?.recentInvoices || [];

  // Fetch weekly timesheet data for this client
  const { data: timesheetData, isLoading: timesheetLoading } = useQuery({
    queryKey: ['client-timesheet', id],
    queryFn: async () => {
      const response = await api.get(`/attendance/timesheet/client/${id}?weeks=8`);
      return response.data.data;
    },
    enabled: !!id && activeTab === 'timesheet',
  });

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (week: WeekData) => {
      const response = await api.post(`/clients/${id}/invoices/generate`, {
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-timesheet', id] });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id || '') });
      setGenerateDialogOpen(false);
      setSelectedWeek(null);
    },
  });

  const handleGenerateClick = (week: WeekData) => {
    setSelectedWeek(week);
    setGenerateDialogOpen(true);
  };

  const handleConfirmGenerate = () => {
    if (selectedWeek) {
      generateInvoiceMutation.mutate(selectedWeek);
    }
  };

  const weeklyData: WeekData[] = timesheetData?.weeks || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleMenuClose = () => setMenuAnchor(null);

  if (isLoading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  if (!client) {
    return (
      <DashboardContainer>
        <BackLink onClick={() => navigate('/clients')}>
          <ArrowBack sx={{ fontSize: 18 }} /> Back to Clients
        </BackLink>
        <Box textAlign="center" py={8} color={colors.text.secondary}>
          Client not found
        </Box>
      </DashboardContainer>
    );
  }

  const renderOverview = () => (
    <OverviewContent>
      <SectionTitle>About Client</SectionTitle>
      <AboutText>
        {client.name} is a client in the {client.industry || 'General'} sector. 
        Contact: {client.contactName || 'N/A'} ({client.contactEmail || 'No email'}).
        {client.address && ` Location: ${client.address}, ${client.city || ''} ${client.postcode || ''}`}
      </AboutText>
      <SectionTitle>Client Information</SectionTitle>
      <DocsGrid>
        <DocItem>
          <DocIcon variant="verified">
            <CheckCircle />
          </DocIcon>
          <DocInfo>
            <div className="name">Total Shifts <CheckCircle sx={{ fontSize: 16, color: '#059669' }} /></div>
            <div className="meta">{client._count?.shifts ?? 0} shifts completed</div>
          </DocInfo>
        </DocItem>
        <DocItem>
          <DocIcon variant="verified">
            <CheckCircle />
          </DocIcon>
          <DocInfo>
            <div className="name">Total Invoices <CheckCircle sx={{ fontSize: 16, color: '#059669' }} /></div>
            <div className="meta">{client._count?.invoices ?? 0} invoices generated</div>
          </DocInfo>
        </DocItem>
        <DocItem>
          <DocIcon variant="verified">
            <CheckCircle />
          </DocIcon>
          <DocInfo>
            <div className="name">Active Workers <CheckCircle sx={{ fontSize: 16, color: '#059669' }} /></div>
            <div className="meta">{client._count?.workerAssignments ?? 0} workers assigned</div>
          </DocInfo>
        </DocItem>
        <DocItem>
          <DocIcon variant={client.status === 'ACTIVE' ? 'verified' : 'pending'}>
            {client.status === 'ACTIVE' ? <CheckCircle /> : <Warning />}
          </DocIcon>
          <DocInfo>
            <div className="name">
              Status 
              {client.status === 'ACTIVE' && <CheckCircle sx={{ fontSize: 16, color: '#059669' }} />}
              {client.status !== 'ACTIVE' && <Warning sx={{ fontSize: 16, color: '#D97706' }} />}
            </div>
            <div className="meta">{client.status}</div>
          </DocInfo>
        </DocItem>
      </DocsGrid>
    </OverviewContent>
  );

  const renderDepartments = () => (
    <>
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
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
              <Th>Department</Th>
              <Th>Address/Floor</Th>
              <Th>Address/Floor</Th>
              <Th>Main Contact</Th>
              <Th>Active workers</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                No departments configured. Department management coming soon.
              </Td>
            </tr>
          </tbody>
        </Table>
      </Box>
    </>
  );

  const renderShiftHistory = () => (
    <>
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
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
              <Th>Shift Title & ID</Th>
              <Th>Worker</Th>
              <Th>Date</Th>
              <Th>Duration</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {recentShifts.length === 0 ? (
              <tr>
                <Td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                  No shifts found
                </Td>
              </tr>
            ) : (
              recentShifts.map((s: any) => (
                <tr key={s.id}>
                  <Td><Checkbox size="small" /></Td>
                  <Td>
                    <ShiftTitleCell>
                      <div className="title">{s.title || 'Shift'}</div>
                      <div className="id">#{s.id.slice(0, 8).toUpperCase()}</div>
                    </ShiftTitleCell>
                  </Td>
                  <Td>-</Td>
                  <Td>{formatDate(s.startAt)}</Td>
                  <Td>{formatTime(s.startAt)} - {formatTime(s.endAt)}</Td>
                  <Td><StatusBadge status={s.status}>{s.status}</StatusBadge></Td>
                  <Td>
                    <IconButton size="small" onClick={handleMenuOpen}>
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Box>
    </>
  );

  const renderPayslips = () => (
    <>
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
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
              <Th>Invoice ID</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.length === 0 ? (
              <tr>
                <Td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                  No invoices found
                </Td>
              </tr>
            ) : (
              recentInvoices.map((p: any) => (
                <tr key={p.id}>
                  <Td><Checkbox size="small" /></Td>
                  <Td>{p.invoiceNumber}</Td>
                  <Td>{formatDate(p.createdAt || p.periodStart)}</Td>
                  <Td>{formatCurrency(p.total)}</Td>
                  <Td>{formatDate(p.dueDate)}</Td>
                  <Td><StatusBadge status={p.status}>{p.status}</StatusBadge></Td>
                  <Td><ActionLink onClick={() => setViewInvoiceId(p.id)}>View Invoice</ActionLink></Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Box>
    </>
  );

  const renderTimesheet = () => (
    <>
      <Box sx={{ padding: '24px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 600, color: colors.primary.navy }}>
              Weekly Timesheet Summary
            </h3>
            <p style={{ margin: '4px 0 0', fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary }}>
              View hours worked and generate invoices
            </p>
          </Box>
        </Box>

        {timesheetLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : weeklyData.length === 0 ? (
          <Box textAlign="center" py={4} color={colors.text.secondary}>
            No timesheet data available
          </Box>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Week</Th>
                <Th>Period</Th>
                <Th>Hours</Th>
                <Th>Shifts</Th>
                <Th>Workers</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((week) => (
                <tr key={week.weekNumber}>
                  <Td style={{ fontWeight: 600 }}>{week.weekLabel}</Td>
                  <Td style={{ fontSize: '12px', color: colors.text.secondary }}>
                    {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                  </Td>
                  <Td>{week.totalHours} hrs</Td>
                  <Td>{week.totalShifts}</Td>
                  <Td>{week.totalWorkers}</Td>
                  <Td style={{ fontWeight: 600 }}>{formatCurrency(week.totalAmount)}</Td>
                  <Td>
                    <StatusBadge status={week.status === 'INVOICED' ? 'Completed' : 'Pending'}>
                      {week.status}
                    </StatusBadge>
                  </Td>
                  <Td>
                    {week.status === 'UNINVOICED' && week.totalShifts > 0 ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleGenerateClick(week)}
                        sx={{ 
                          bgcolor: colors.primary.navy, 
                          textTransform: 'none',
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '12px',
                          '&:hover': { bgcolor: '#1a365d' },
                        }}
                      >
                        Generate Invoice
                      </Button>
                    ) : week.invoiceId ? (
                      <ActionLink onClick={() => setViewInvoiceId(week.invoiceId!)}>View Invoice</ActionLink>
                    ) : (
                      <span style={{ color: colors.text.secondary, fontSize: '12px' }}>-</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Box>
    </>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'department': return renderDepartments();
      case 'shifts': return renderShiftHistory();
      case 'payslips': return renderPayslips();
      case 'timesheet': return renderTimesheet();
    }
  };

  return (
    <DashboardContainer>
      <BackLink onClick={() => navigate('/clients')}>
        <ArrowBack sx={{ fontSize: 18 }} /> Go back
      </BackLink>
      <Breadcrumb>
        <span>Clients</span>
        <span>{'>'}</span>
        <span className="current">Client Details</span>
      </Breadcrumb>

      {/* Profile Card */}
      <ProfileCard>
        <ProfileCardTitle>Client Details</ProfileCardTitle>
        <ProfileRow>
          <ProfileLeft>
            <Avatar sx={{ width: 80, height: 80, bgcolor: colors.primary.blue, fontSize: 28, fontWeight: 700 }}>
              {getInitials(client.name)}
            </Avatar>
            <ProfileInfo>
              <ProfileName>
                <h3>{client.name}</h3>
                <ActiveTag>{client.status}</ActiveTag>
              </ProfileName>
              <ProfileMeta>
                <MetaItem><Email /> {client.contactEmail || '-'}</MetaItem>
                <MetaItem><Phone /> {client.contactPhone || '-'}</MetaItem>
              </ProfileMeta>
              <ProfileMeta style={{ marginTop: '4px' }}>
                <MetaItem><Badge /> #{client.id?.slice(0, 8).toUpperCase()}</MetaItem>
                <MetaItem><LocationOn /> {client.city || client.address || '-'}</MetaItem>
              </ProfileMeta>
            </ProfileInfo>
          </ProfileLeft>
          <BlockButton>
            <Block sx={{ fontSize: 18 }} /> Block client
          </BlockButton>
        </ProfileRow>
      </ProfileCard>

      {/* Stats */}
      <StatsRow>
        <StatItem>
          <StatIcon bgColor="#E0F2FE" iconColor="#3B82F6"><Work /></StatIcon>
          <StatText>
            <div className="label">Total Shifts</div>
            <div className="value">{client._count?.shifts ?? 0}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#D1FAE5" iconColor="#10B981"><Receipt /></StatIcon>
          <StatText>
            <div className="label">Total Invoices</div>
            <div className="value">{client._count?.invoices ?? 0}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#FEF3C7" iconColor="#F59E0B"><ReceiptLong /></StatIcon>
          <StatText>
            <div className="label">Active Workers</div>
            <div className="value">{client._count?.workerAssignments ?? 0}</div>
          </StatText>
        </StatItem>
        <StatItem>
          <StatIcon bgColor="#EDE9FE" iconColor="#7C3AED"><AccessTime /></StatIcon>
          <StatText>
            <div className="label">Industry</div>
            <div className="value">{client.industry || '-'}</div>
          </StatText>
        </StatItem>
      </StatsRow>

      {/* Tabs + Content */}
      <TableCard>
        <TabsRow>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</Tab>
          <Tab active={activeTab === 'department'} onClick={() => setActiveTab('department')}>Department</Tab>
          <Tab active={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')}>Shift History</Tab>
          <Tab active={activeTab === 'payslips'} onClick={() => setActiveTab('payslips')}>Invoices</Tab>
          <Tab active={activeTab === 'timesheet'} onClick={() => setActiveTab('timesheet')}>Timesheet</Tab>
        </TabsRow>

        {getTabContent()}

        {/* Action Menu for shifts tab */}
        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '160px' },
          }}
        >
          <ActionMenuItem onClick={handleMenuClose}>
            <Visibility /> View shift
          </ActionMenuItem>
          <ActionMenuItem onClick={handleMenuClose}>
            <Edit /> Edit Shift
          </ActionMenuItem>
          <ActionMenuItem danger onClick={handleMenuClose}>
            <Delete /> Delete Shift
          </ActionMenuItem>
        </MuiMenu>

        {activeTab !== 'overview' && (
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
            <PaginationText>Showing 10 out of 100 items</PaginationText>
            <PaginationControls>
              <PageButton disabled><ChevronLeft sx={{ fontSize: 18 }} /></PageButton>
              <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>1</PageButton>
              <PageButton><ChevronRight sx={{ fontSize: 18 }} /></PageButton>
            </PaginationControls>
          </PaginationRow>
        )}
      </TableCard>

      {/* Generate Invoice Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Generate Invoice
        </DialogTitle>
        <DialogContent>
          {selectedWeek && (
            <Box>
              <p style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 16px' }}>
                Generate invoice for <strong>{selectedWeek.weekLabel}</strong>?
              </p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, margin: '0 0 16px' }}>
                Period: {formatDate(selectedWeek.weekStart)} - {formatDate(selectedWeek.weekEnd)}
              </p>
              <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>Hours:</span>
                  <strong style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>{selectedWeek.totalHours} hrs</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>Shifts:</span>
                  <strong style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>{selectedWeek.totalShifts}</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>Subtotal:</span>
                  <strong style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>{formatCurrency(selectedWeek.totalAmount)}</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>VAT (20%):</span>
                  <strong style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>{formatCurrency(selectedWeek.totalAmount * 0.2)}</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" borderTop="1px solid #E5E7EB" pt={1} mt={1}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600 }}>Total:</span>
                  <strong style={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', color: colors.primary.navy }}>{formatCurrency(selectedWeek.totalAmount * 1.2)}</strong>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setGenerateDialogOpen(false)}
            sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmGenerate}
            disabled={generateInvoiceMutation.isPending}
            sx={{ 
              bgcolor: colors.primary.navy, 
              fontFamily: "'Outfit', sans-serif", 
              textTransform: 'none',
              '&:hover': { bgcolor: '#1a365d' },
            }}
          >
            {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Modal */}
      <ViewInvoiceModal
        open={!!viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
        invoiceId={viewInvoiceId}
      />
    </DashboardContainer>
  );
}

export default ClientDetails;
