import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Work,
  WorkOutline,
  CheckCircle,
  Warning,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Add,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  Campaign,
  Cancel,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox, IconButton, Menu as MuiMenu, CircularProgress } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { 
  useGetShiftsQuery, 
  useDeleteShiftMutation,
  useBroadcastShiftMutation,
  useCancelShiftMutation,
} from '../../store/slices/shiftSlice';
import type { Shift } from '../../types/api';

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

const CreateButton = styled('button')({
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
  '&:hover': {
    backgroundColor: '#1a2d4a',
  },
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
  '&:hover': {
    color: colors.primary.navy,
  },
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

const WorkerProgress = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: '100px',
});

const ProgressHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const ProgressBar = styled(Box)({
  width: '100%',
  height: '4px',
  backgroundColor: '#E5E7EB',
  borderRadius: '2px',
  overflow: 'hidden',
});

const ProgressFill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'percentage',
})<{ percentage: number }>(({ percentage }) => ({
  width: `${percentage}%`,
  height: '100%',
  backgroundColor: percentage === 100 ? colors.status.success : colors.primary.blue,
  borderRadius: '2px',
  transition: 'width 0.3s ease',
}));

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'open' | 'completed' | 'in_progress' }>(({ status }) => ({
  padding: '4px 12px',
  borderRadius: '16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor:
    status === 'completed' ? '#D1FAE5' :
    status === 'open' ? '#DBEAFE' :
    '#FEF3C7',
  color:
    status === 'completed' ? '#059669' :
    status === 'open' ? '#2563EB' :
    '#D97706',
}));

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
  '&:hover': {
    backgroundColor: '#F9FAFB',
  },
  '& svg': {
    fontSize: '18px',
  },
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
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const getShiftStatus = (shift: Shift): 'open' | 'completed' | 'in_progress' | 'cancelled' => {
  if (shift.status === 'CANCELLED') return 'cancelled';
  if (shift.status === 'COMPLETED') return 'completed';
  if (shift.status === 'IN_PROGRESS') return 'in_progress';
  return 'open';
};

// ============ COMPONENT ============
export function ShiftsPage() {
  useDocumentTitle('Shifts');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuShiftId, setMenuShiftId] = useState<string | null>(null);

  // API calls
  const statusFilter = activeTab === 'all' ? undefined : activeTab === 'open' ? 'OPEN' : 'COMPLETED';
  const { data: shiftsData, isLoading, error } = useGetShiftsQuery({ status: statusFilter });
  const [deleteShift] = useDeleteShiftMutation();
  const [broadcastShift] = useBroadcastShiftMutation();
  const [cancelShift] = useCancelShiftMutation();

  // Process shifts data - handle wrapped API response
  const shifts = useMemo(() => {
    if (!shiftsData) return [];
    if (Array.isArray(shiftsData)) return shiftsData;
    if (Array.isArray((shiftsData as any).data)) return (shiftsData as any).data;
    return [];
  }, [shiftsData]);
  
  // Calculate stats from actual data
  const stats = useMemo(() => {
    const allShifts = Array.isArray(shifts) ? shifts : [];
    const now = new Date();
    const urgentThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    return {
      totalShifts: allShifts.length,
      openShifts: allShifts.filter(s => s.status === 'OPEN').length,
      filledShifts: allShifts.filter(s => (s._count?.assignments ?? 0) >= (s.workersNeeded ?? 1)).length,
      urgentShifts: allShifts.filter(s => s.status === 'OPEN' && new Date(s.startAt) <= urgentThreshold).length,
    };
  }, [shifts]);

  // Filter shifts by search term
  const filteredShifts = useMemo(() => {
    const shiftsArray = Array.isArray(shifts) ? shifts : [];
    if (!searchTerm) return shiftsArray;
    const term = searchTerm.toLowerCase();
    return shiftsArray.filter(s => 
      s.title?.toLowerCase().includes(term) ||
      s.clientCompany?.name?.toLowerCase().includes(term) ||
      s.location?.name?.toLowerCase().includes(term) ||
      s.siteLocation?.toLowerCase().includes(term)
    );
  }, [shifts, searchTerm]);

  // Paginate shifts
  const paginatedShifts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredShifts.slice(start, start + rowsPerPage);
  }, [filteredShifts, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredShifts.length / rowsPerPage);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, shiftId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuShiftId(shiftId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuShiftId(null);
  };

  const handleDelete = async () => {
    if (menuShiftId) {
      try {
        await deleteShift(menuShiftId).unwrap();
        handleMenuClose();
      } catch (err) {
        console.error('Failed to delete shift:', err);
      }
    }
  };

  const handleBroadcast = async () => {
    if (menuShiftId) {
      try {
        await broadcastShift({ shiftId: menuShiftId }).unwrap();
        handleMenuClose();
      } catch (err) {
        console.error('Failed to broadcast shift:', err);
      }
    }
  };

  const handleCancel = async () => {
    if (menuShiftId) {
      try {
        await cancelShift(menuShiftId).unwrap();
        handleMenuClose();
      } catch (err) {
        console.error('Failed to cancel shift:', err);
      }
    }
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderRow>
        <TitleSection>
          <PageTitle>Shifts</PageTitle>
          <PageSubtitle>Manage and monitor agency workers shifts</PageSubtitle>
        </TitleSection>
        <CreateButton onClick={() => navigate('/shifts/create')}>
          <Add sx={{ fontSize: 18 }} />
          Create new shift
        </CreateButton>
      </HeaderRow>

      {/* Stats Cards */}
      <GridCols4>
        <StatsCard
          title="Total Shifts"
          value={stats.totalShifts}
          icon={<Work />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
        />
        <StatsCard
          title="Open Shifts"
          value={stats.openShifts}
          icon={<WorkOutline />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
        />
        <StatsCard
          title="Filled Shifts"
          value={stats.filledShifts}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
        />
        <StatsCard
          title="Urgent Shifts"
          value={stats.urgentShifts}
          icon={<Warning />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
        />
      </GridCols4>

      {/* Table Card */}
      <TableCard>
        {/* Tabs */}
        <TabsRow>
          <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All Shifts
          </Tab>
          <Tab active={activeTab === 'open'} onClick={() => setActiveTab('open')}>
            Open Shifts
          </Tab>
          <Tab active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
            Completed
          </Tab>
        </TabsRow>

        {/* Filters */}
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
            <DropdownButton>
              All Status <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DropdownButton>
            <ExportButton>
              Export as XLS <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </FilterRight>
        </FilterRow>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8, color: colors.status.error }}>
              Failed to load shifts. Please try again.
            </Box>
          ) : paginatedShifts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: colors.text.secondary }}>
              No shifts found.
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                  <Th>Shift Title & ID</Th>
                  <Th>Client</Th>
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>Location</Th>
                  <Th>Priority</Th>
                  <Th>Workers</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedShifts.map((shift) => {
                  const workersFilled = shift._count?.assignments ?? 0;
                  const workersNeeded = shift.workersNeeded ?? 1;
                  const percentage = workersNeeded > 0 ? Math.round((workersFilled / workersNeeded) * 100) : 0;
                  const status = getShiftStatus(shift);
                  const location = shift.location?.name || shift.siteLocation || 'N/A';
                  
                  return (
                    <tr key={shift.id}>
                      <Td><Checkbox size="small" /></Td>
                      <Td>
                        <ShiftTitleCell>
                          <div className="title">{shift.title}</div>
                          <div className="id">#{shift.id.slice(-8).toUpperCase()}</div>
                        </ShiftTitleCell>
                      </Td>
                      <Td>{shift.clientCompany?.name || 'Internal'}</Td>
                      <Td>{formatDate(shift.startAt)}</Td>
                      <Td>{formatTime(shift.startAt)} - {formatTime(shift.endAt)}</Td>
                      <Td>{location}</Td>
                      <Td>
                        <Box sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: shift.priority === 'URGENT' ? colors.status.error + '15' : 
                                         shift.priority === 'HIGH' ? colors.status.warning + '15' : 
                                         shift.priority === 'LOW' ? colors.text.secondary + '15' : '#f0f0f0',
                          color: shift.priority === 'URGENT' ? colors.status.error : 
                                shift.priority === 'HIGH' ? colors.status.warning : 
                                shift.priority === 'LOW' ? colors.text.secondary : colors.text.primary
                        }}>
                          {shift.priority === 'URGENT' && '🔴 '}{shift.priority || 'NORMAL'}
                        </Box>
                      </Td>
                      <Td>
                        <WorkerProgress>
                          <ProgressHeader>
                            <span>{workersFilled}/{workersNeeded} filled</span>
                            <span>{Math.min(percentage, 100)}%</span>
                          </ProgressHeader>
                          <ProgressBar>
                            <ProgressFill percentage={Math.min(percentage, 100)} />
                          </ProgressBar>
                        </WorkerProgress>
                      </Td>
                      <Td>
                        <StatusBadge status={status === 'cancelled' ? 'open' : status}>
                          {status === 'completed' ? 'Completed' : status === 'open' ? 'Open' : status === 'cancelled' ? 'Cancelled' : 'In Progress'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, shift.id)}>
                          <MoreVert sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Box>

        {/* Action Menu */}
        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
              minWidth: '180px',
            },
          }}
        >
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/shifts/${menuShiftId}`); }}>
            <Visibility /> View Shift
          </ActionMenuItem>
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/shifts/${menuShiftId}/edit`); }}>
            <Edit /> Edit Shift
          </ActionMenuItem>
          <ActionMenuItem onClick={handleBroadcast}>
            <Campaign /> Broadcast Shift
          </ActionMenuItem>
          <ActionMenuItem onClick={handleCancel}>
            <Cancel /> Cancel Shift
          </ActionMenuItem>
          <ActionMenuItem danger onClick={handleDelete}>
            <Delete /> Delete Shift
          </ActionMenuItem>
        </MuiMenu>

        {/* Pagination */}
        <Pagination>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              size="small"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                '& .MuiSelect-select': { padding: '6px 12px' },
              }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>
          <PaginationText>
            Showing {Math.min(paginatedShifts.length, rowsPerPage)} of {filteredShifts.length} items
          </PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <PageButton 
                key={page}
                onClick={() => setCurrentPage(page)}
                style={currentPage === page ? { backgroundColor: colors.primary.navy, color: 'white', border: 'none' } : {}}
              >
                {page}
              </PageButton>
            ))}
            <PageButton 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>
    </DashboardContainer>
  );
}

export default ShiftsPage;
