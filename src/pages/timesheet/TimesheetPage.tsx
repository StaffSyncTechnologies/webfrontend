import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Work,
  CheckCircle,
  PendingActions,
  Flag,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  Visibility,
  Check,
  Block,
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
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { 
  useTimesheetStats, 
  useTimesheetList, 
  useTimesheetByClient,
  useApproveTimesheet, 
  useFlagTimesheet,
  useBulkApproveTimesheets,
  useExportTimesheets,
  type TimesheetListParams,
} from '../../hooks/api/useTimesheetApi';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';

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
    approved: '#D1FAE5',
    pending: '#FEF3C7',
    flagged: '#FFE4E6',
  };
  const colorMap: Record<string, string> = {
    approved: '#059669',
    pending: '#D97706',
    flagged: '#DC2626',
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

// Client Hours Card
const ClientHoursCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '20px',
  marginBottom: '24px',
});

const ClientHoursHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const ClientHoursTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
});

const ClientHoursTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: "'Outfit', sans-serif",
  '& th': {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text.secondary,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  '& td': {
    padding: '12px 16px',
    fontSize: '14px',
    color: colors.text.primary,
    borderBottom: '1px solid #F3F4F6',
  },
  '& tr:hover td': {
    backgroundColor: '#F9FAFB',
  },
});

const WeeklyBar = styled(Box)<{ width: number }>(({ width }) => ({
  height: '8px',
  backgroundColor: colors.primary.navy,
  borderRadius: '4px',
  width: `${Math.min(width, 100)}%`,
  minWidth: width > 0 ? '4px' : '0',
}));

// ============ HELPERS ============
const formatTime = (dateStr: string | null) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};


const formatDuration = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)} mins`;
  return `${hours.toFixed(1)} hours`;
};

// Flag reason options
const FLAG_REASONS = [
  { value: 'LATE_CLOCK_IN', label: 'Late Clock In' },
  { value: 'EARLY_CLOCK_OUT', label: 'Early Clock Out' },
  { value: 'LOCATION_MISMATCH', label: 'Location Mismatch' },
  { value: 'HOURS_DISCREPANCY', label: 'Hours Discrepancy' },
];

// ============ COMPONENT ============
export function TimesheetPage() {
  useDocumentTitle('Timesheet');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'FLAGGED' | ''>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<string | null>(null);
  
  // Flag dialog state
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagNote, setFlagNote] = useState('');
  
  // Toast notification state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API hooks
  const params: TimesheetListParams = {
    page: currentPage,
    limit: rowsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(searchTerm && { search: searchTerm }),
  };
  
  const { data: stats, isLoading: statsLoading } = useTimesheetStats();
  const { data: listData, isLoading: listLoading } = useTimesheetList(params);
  const { data: clientData, isLoading: clientLoading } = useTimesheetByClient(4);
  const approveMutation = useApproveTimesheet();
  const flagMutation = useFlagTimesheet();
  const bulkApproveMutation = useBulkApproveTimesheets();
  const exportMutation = useExportTimesheets();

  const timesheets = listData?.timesheets ?? [];
  const pagination = listData?.pagination;
  const clientHours = clientData?.clients ?? [];
  const maxClientHours = Math.max(...clientHours.map(c => c.totalHours), 1);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuRowId(rowId);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRowId(null);
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        setToast({ open: true, message: 'Timesheet approved successfully', severity: 'success' });
      },
      onError: () => {
        setToast({ open: true, message: 'Failed to approve timesheet', severity: 'error' });
      },
    });
    handleMenuClose();
  };

  const openFlagDialog = (id: string) => {
    setFlagTargetId(id);
    setFlagReason('');
    setFlagNote('');
    setFlagDialogOpen(true);
    handleMenuClose();
  };

  const handleFlagSubmit = () => {
    if (flagTargetId && flagReason) {
      flagMutation.mutate(
        { attendanceId: flagTargetId, reason: flagReason },
        {
          onSuccess: () => {
            setToast({ open: true, message: 'Timesheet flagged for review', severity: 'success' });
            setFlagDialogOpen(false);
          },
          onError: () => {
            setToast({ open: true, message: 'Failed to flag timesheet', severity: 'error' });
          },
        }
      );
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length > 0) {
      bulkApproveMutation.mutate(selectedIds, {
        onSuccess: () => {
          setToast({ open: true, message: `${selectedIds.length} timesheet(s) approved`, severity: 'success' });
          setSelectedIds([]);
        },
        onError: () => {
          setToast({ open: true, message: 'Failed to approve timesheets', severity: 'error' });
        },
      });
    }
  };

  const handleExport = () => {
    exportMutation.mutate({ status: statusFilter || undefined });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(timesheets.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Timesheet</PageTitle>
          <PageSubtitle>Review attendance, approve hours, and resolve exceptions</PageSubtitle>
        </TitleSection>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Shifts"
          value={statsLoading ? 0 : (stats?.total.count ?? 0)}
          icon={<Work />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
          trend={{ value: `${stats?.total.change ?? 0}%`, label: 'this week', direction: (stats?.total.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Approved this week"
          value={statsLoading ? 0 : (stats?.approved.count ?? 0)}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ value: `${stats?.approved.change ?? 0}%`, label: 'this week', direction: (stats?.approved.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Pending Approval"
          value={statsLoading ? 0 : (stats?.pending.count ?? 0)}
          icon={<PendingActions />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ value: `${stats?.pending.change ?? 0}%`, label: 'this week', direction: (stats?.pending.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Flagged"
          value={statsLoading ? 0 : (stats?.flagged.count ?? 0)}
          icon={<Flag />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
          trend={{ value: `${stats?.flagged.change ?? 0}%`, label: 'this week', direction: (stats?.flagged.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
      </GridCols4>

      {/* Client Hours Summary */}
      <ClientHoursCard>
        <ClientHoursHeader>
          <ClientHoursTitle>Hours by Client (Last 4 Weeks)</ClientHoursTitle>
        </ClientHoursHeader>
        {clientLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : clientHours.length === 0 ? (
          <Box textAlign="center" py={3} color={colors.text.secondary}>
            No client data available
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <ClientHoursTable>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total Hours</th>
                  <th>Avg Weekly</th>
                  <th>Workers</th>
                  <th style={{ width: '200px' }}>Weekly Trend</th>
                </tr>
              </thead>
              <tbody>
                {clientHours.map((client) => (
                  <tr key={client.clientId}>
                    <td style={{ fontWeight: 500 }}>{client.clientName}</td>
                    <td>{client.totalHours} hrs</td>
                    <td>{client.avgWeeklyHours} hrs</td>
                    <td>{client.avgWorkers}</td>
                    <td>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box flex={1}>
                          <WeeklyBar width={(client.totalHours / maxClientHours) * 100} />
                        </Box>
                        <Box fontSize="12px" color={colors.text.secondary} minWidth="60px">
                          {client.weeklyBreakdown.slice(-1)[0]?.hours ?? 0} hrs
                        </Box>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ClientHoursTable>
          </Box>
        )}
      </ClientHoursCard>

      <TableCard>
        <CardHeader><h3>Attendance Sheet</h3></CardHeader>

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
            <FilterButton>
              <FilterList sx={{ fontSize: 18 }} />
              Filter
            </FilterButton>
          </FilterLeft>
          <FilterRight>
            <DropdownButton>
              Date Range <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DropdownButton>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              displayEmpty
              size="small"
              sx={{ minWidth: 120, fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="FLAGGED">Flagged</MenuItem>
            </Select>
            {selectedIds.length > 0 && (
              <ExportButton onClick={handleBulkApprove} disabled={bulkApproveMutation.isPending}>
                Approve Selected ({selectedIds.length})
              </ExportButton>
            )}
            <ExportButton onClick={handleExport} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? 'Exporting...' : 'Export as XLS'} <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}>
                  <Checkbox 
                    size="small" 
                    checked={selectedIds.length === timesheets.length && timesheets.length > 0}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < timesheets.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </Th>
                <Th>Worker</Th>
                <Th>Client</Th>
                <Th>Date</Th>
                <Th>Shift Time</Th>
                <Th>Actual Time</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr>
                  <Td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <CircularProgress size={24} />
                  </Td>
                </tr>
              ) : timesheets.length === 0 ? (
                <tr>
                  <Td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                    No timesheets found
                  </Td>
                </tr>
              ) : (
                timesheets.map((row) => (
                  <tr key={row.id}>
                    <Td>
                      <Checkbox 
                        size="small" 
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      />
                    </Td>
                    <Td>
                      <WorkerCell>
                        <Avatar 
                          sx={{ width: 32, height: 32, bgcolor: '#E5E7EB', fontSize: 13 }}
                          src={row.worker.avatar}
                        >
                          {row.worker.fullName.charAt(0)}
                        </Avatar>
                        {row.worker.fullName}
                      </WorkerCell>
                    </Td>
                    <Td>{row.client?.companyName ?? '-'}</Td>
                    <Td>{row.date ?? '-'}</Td>
                    <Td>{formatTime(row.shiftTime?.scheduled?.start)} - {formatTime(row.shiftTime?.scheduled?.end)}</Td>
                    <Td>{formatTime(row.shiftTime?.actual?.start)} - {formatTime(row.shiftTime?.actual?.end)}</Td>
                    <Td>{row.duration ?? formatDuration(row.durationHours)}</Td>
                    <Td>
                      <StatusBadge status={row.status}>{row.status}</StatusBadge>
                    </Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.id)}>
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Box>

        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '160px' },
          }}
        >
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/timesheet/${menuRowId}`); }}>
            <Visibility /> View Details
          </ActionMenuItem>
          <ActionMenuItem onClick={() => menuRowId && handleApprove(menuRowId)}>
            <Check /> Approve
          </ActionMenuItem>
          <ActionMenuItem danger onClick={() => menuRowId && openFlagDialog(menuRowId)}>
            <Block /> Flag for review
          </ActionMenuItem>
        </MuiMenu>

        {/* Flag Dialog */}
        <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Flag Timesheet for Review</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Reason</InputLabel>
              <Select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                label="Reason"
              >
                {FLAG_REASONS.map((reason) => (
                  <MenuItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes (optional)"
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setFlagDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleFlagSubmit} 
              variant="contained" 
              color="error"
              disabled={!flagReason || flagMutation.isPending}
            >
              {flagMutation.isPending ? 'Flagging...' : 'Flag Timesheet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setToast({ ...toast, open: false })} 
            severity={toast.severity}
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

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
          <PaginationText>
            Showing {timesheets.length} out of {pagination?.total ?? 0} items
          </PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>
              {currentPage}
            </PageButton>
            <PageButton 
              disabled={currentPage >= (pagination?.totalPages ?? 1)}
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

export default TimesheetPage;
