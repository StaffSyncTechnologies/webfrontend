import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BeachAccess,
  CheckCircle,
  EventBusy,
  PendingActions,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  Visibility,
  Check,
  Close,
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
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useGetAdminLeaveRequestsQuery,
  useReviewLeaveRequestMutation,
  type LeaveRequest,
} from '../../store/slices/holidaySlice';

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

const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  marginTop: '24px',
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

const WorkerCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = {
    pending: '#FEF3C7',
    approved: '#D1FAE5',
    rejected: '#FFE4E6',
  };
  const colorMap: Record<string, string> = {
    pending: '#D97706',
    approved: '#059669',
    rejected: '#DC2626',
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

const Pagination = styled(Box)({
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

// ============ HELPERS ============
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'PENDING': return 'Pending';
    case 'APPROVED': return 'Approved';
    case 'DENIED': return 'Rejected';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const getLeaveTypeLabel = (type: string): string => {
  switch (type) {
    case 'ANNUAL': return 'Annual Leave';
    case 'SICK': return 'Sick Leave';
    case 'UNPAID': return 'Unpaid Leave';
    case 'COMPASSIONATE': return 'Compassionate';
    case 'MATERNITY': return 'Maternity';
    case 'PATERNITY': return 'Paternity';
    default: return type;
  }
};

type TabKey = 'history' | 'pending' | 'calendar' | 'balances';

// ============ COMPONENT ============
export function HolidayPage() {
  useDocumentTitle('Holiday');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'DENIED' | ''>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // API Hooks
  const { data: leaveData, isLoading } = useGetAdminLeaveRequestsQuery({
    page: currentPage,
    limit: rowsPerPage,
    ...(activeTab === 'pending' ? { status: 'PENDING' } : statusFilter ? { status: statusFilter } : {}),
  });
  const [reviewRequest] = useReviewLeaveRequestMutation();

  const requests = leaveData?.requests ?? [];
  const pagination = leaveData?.pagination ?? { page: 1, limit: 8, total: 0, totalPages: 1 };
  const stats = leaveData?.stats ?? { pending: 0, approved: 0, denied: 0 };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = requests.length;
    const approved = requests.filter(r => r.status === 'APPROVED').length;
    const pending = stats.pending || 0;
    const totalDays = requests.reduce((sum, r) => sum + (r.days || 0), 0);
    return { total, approved, pending, totalDays };
  }, [requests, stats]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: LeaveRequest) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRequest(request);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRequest(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await reviewRequest({ id: selectedRequest.id, status: 'APPROVED' }).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await reviewRequest({ id: selectedRequest.id, status: 'DENIED' }).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const renderHistoryTable = () => (
    <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <thead>
          <tr>
            <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
            <Th>Worker</Th>
            <Th>Type</Th>
            <Th>Start Date</Th>
            <Th>End Date</Th>
            <Th>Duration</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                <CircularProgress size={24} />
              </Td>
            </tr>
          ) : requests.length === 0 ? (
            <tr>
              <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                No leave requests found.
              </Td>
            </tr>
          ) : (
            requests.map((h) => (
              <tr key={h.id}>
                <Td><Checkbox size="small" /></Td>
                <Td>
                  <WorkerCell>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#E5E7EB', fontSize: 13 }}>
                      {h.worker?.fullName?.charAt(0) || 'W'}
                    </Avatar>
                    {h.worker?.fullName || 'Unknown'}
                  </WorkerCell>
                </Td>
                <Td>{getLeaveTypeLabel(h.leaveType)}</Td>
                <Td>{formatDate(h.startDate)}</Td>
                <Td>{formatDate(h.endDate)}</Td>
                <Td>{h.days} day{h.days !== 1 ? 's' : ''}</Td>
                <Td><StatusBadge status={getStatusLabel(h.status)}>{getStatusLabel(h.status)}</StatusBadge></Td>
                <Td>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, h)}>
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Box>
  );

  const renderBalancesTable = () => (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ padding: '48px 24px', textAlign: 'center' }}>
        <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>
          Balances view - showing worker entitlements (coming soon)
        </Box>
      </Box>
    </Box>
  );

  const renderCalendarPlaceholder = () => (
    <Box sx={{ padding: '48px 24px', textAlign: 'center' }}>
      <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>
        Calendar view coming soon
      </Box>
    </Box>
  );

  const getTableContent = () => {
    switch (activeTab) {
      case 'history':
      case 'pending':
        return renderHistoryTable();
      case 'calendar':
        return renderCalendarPlaceholder();
      case 'balances':
        return renderBalancesTable();
    }
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Holiday</PageTitle>
          <PageSubtitle>Review requests, track approvals, and manage holidays</PageSubtitle>
        </TitleSection>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Requests"
          value={isLoading ? '-' : (pagination.total || 0)}
          icon={<BeachAccess />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
          trend={{ value: `${summaryStats.totalDays || 0}`, label: 'total days requested', direction: 'up' }}
        />
        <StatsCard
          title="Approved"
          value={isLoading ? '-' : (stats.approved || 0)}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ value: `${stats.approved || 0}`, label: 'requests', direction: 'up' }}
        />
        <StatsCard
          title="Denied"
          value={isLoading ? '-' : (stats.denied || 0)}
          icon={<EventBusy />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
          trend={{ value: `${stats.denied || 0}`, label: 'requests', direction: 'down' }}
        />
        <StatsCard
          title="Pending Requests"
          value={isLoading ? '-' : (stats.pending || 0)}
          icon={<PendingActions />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ value: `${stats.pending || 0}`, label: 'to review', direction: 'up' }}
        />
      </GridCols4>

      <TableCard>
        <TabsRow>
          <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Holiday History</Tab>
          <Tab active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>Pending Requests</Tab>
          <Tab active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>Calendar</Tab>
          <Tab active={activeTab === 'balances'} onClick={() => setActiveTab('balances')}>Balances</Tab>
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
            <ExportButton>Export as XLS <FileDownload sx={{ fontSize: 18 }} /></ExportButton>
          </FilterRight>
        </FilterRow>

        {getTableContent()}

        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '180px' },
          }}
        >
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/holiday/${selectedRequest?.id}`); }}>
            <Visibility /> View request
          </ActionMenuItem>
          {selectedRequest?.status === 'PENDING' && (
            <>
              <ActionMenuItem onClick={handleApprove}>
                <Check /> Approve request
              </ActionMenuItem>
              <ActionMenuItem danger onClick={handleReject}>
                <Close /> Reject request
              </ActionMenuItem>
            </>
          )}
        </MuiMenu>

        <Pagination>
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
          <PaginationText>Showing {requests.length} out of {pagination.total} items</PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>
              {currentPage}
            </PageButton>
            <PageButton 
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>
    </DashboardContainer>
  );
}

export default HolidayPage;
