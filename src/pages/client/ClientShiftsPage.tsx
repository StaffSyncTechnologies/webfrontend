import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarMonth,
  Search,
  FilterList,
  FileDownload,
  ChevronLeft,
  ChevronRight,
  Add,
  Visibility,
  MoreVert,
  AccessTime,
  CheckCircle,
  Schedule,
  Person,
  LocationOn,
  Edit,
  Delete,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox, IconButton, Menu as MuiMenu, Avatar, Chip } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { 
  useGetClientShiftsQuery,
  useCancelClientShiftMutation,
} from '../../store/slices/clientDashboardSlice';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';

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
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  marginTop: '24px',
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

const ShiftCell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  '& .title': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .meta': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => ({
  padding: '4px 12px',
  borderRadius: '16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor:
    status === 'ACTIVE' ? '#D1FAE5' :
    status === 'COMPLETED' ? '#DBEAFE' :
    status === 'CANCELLED' ? '#FEE2E2' :
    status === 'PENDING' ? '#FEF3C7' :
    '#F3F4F6',
  color:
    status === 'ACTIVE' ? '#059669' :
    status === 'COMPLETED' ? '#1D4ED8' :
    status === 'CANCELLED' ? '#DC2626' :
    status === 'PENDING' ? '#D97706' :
    '#6B7280',
}));

const WorkerChip = styled(Chip)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  height: '24px',
  backgroundColor: '#F3F4F6',
  color: colors.primary.navy,
  '&:hover': { backgroundColor: '#E5E7EB' },
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

// ============ COMPONENT ============
export function ClientShiftsPage() {
  useDocumentTitle('Shift Management');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuShiftId, setMenuShiftId] = useState<string | null>(null);

  const toast = useToast();

  // Fetch client shifts
  const { data: shiftsData, isLoading: shiftsLoading } = useGetClientShiftsQuery({});

  // Mutations
  const [cancelShift, { isLoading: cancelling }] = useCancelClientShiftMutation();

  // Process shifts data
  const shifts = useMemo(() => {
    const data = Array.isArray(shiftsData) ? shiftsData : [];
    return data.map((shift: any) => ({
      id: shift.id,
      title: shift.title || 'Shift',
      date: shift.startTime ? format(new Date(shift.startTime), 'MMM dd, yyyy') : 'N/A',
      time: shift.startTime ? format(new Date(shift.startTime), 'hh:mm a') : 'N/A',
      duration: shift.endTime && shift.startTime 
        ? `${Math.round((new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60))}h`
        : 'N/A',
      location: shift.location || 'Main Site',
      workers: shift.workers || [],
      requiredWorkers: shift.requiredWorkers || 1,
      status: shift.status || 'PENDING',
      payRate: shift.payRate || 0,
    }));
  }, [shiftsData]);

  // Calculate stats from shifts data
  const stats = useMemo(() => {
    const totalShifts = shifts.length;
    const activeShifts = shifts.filter(s => s.status === 'ACTIVE').length;
    const completedShifts = shifts.filter(s => s.status === 'COMPLETED').length;
    const pendingShifts = shifts.filter(s => s.status === 'PENDING').length;
    
    return {
      totalShifts,
      activeShifts,
      completedShifts,
      pendingShifts,
    };
  }, [shifts]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, shiftId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuShiftId(shiftId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuShiftId(null);
  };

  const handleViewShift = () => {
    if (menuShiftId) {
      navigate(`/client/shifts/${menuShiftId}`);
    }
    handleMenuClose();
  };

  const handleEditShift = () => {
    toast.info('Edit shift feature coming soon');
    handleMenuClose();
  };

  const handleCancelShift = async () => {
    if (!menuShiftId) return;
    try {
      await cancelShift(menuShiftId).unwrap();
      toast.success('Shift cancelled successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel shift');
    }
    handleMenuClose();
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Shift Management</PageTitle>
          <PageSubtitle>Create and manage work shifts for your team</PageSubtitle>
        </TitleSection>
        <CreateButton onClick={() => navigate('/client/shifts/request')}>
          <Add sx={{ fontSize: 18 }} />
          Request New Shift
        </CreateButton>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Shifts"
          value={stats.totalShifts}
          icon={<CalendarMonth />}
          color="#3B82F6"
          trend={{
            value: `${Math.round((stats.activeShifts / Math.max(stats.totalShifts, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="Active Shifts"
          value={stats.activeShifts}
          icon={<Schedule />}
          color="#10B981"
          trend={{
            value: `${Math.round((stats.activeShifts / Math.max(stats.totalShifts, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="Completed"
          value={stats.completedShifts}
          icon={<CheckCircle />}
          color="#F59E0B"
          trend={{
            value: `${Math.round((stats.completedShifts / Math.max(stats.totalShifts, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="Pending"
          value={stats.pendingShifts}
          icon={<AccessTime />}
          color="#8B5CF6"
          trend={{
            value: `${Math.round((stats.pendingShifts / Math.max(stats.totalShifts, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
      </GridCols4>

      <TableCard>
        <FilterRow>
          <FilterLeft>
            <SearchInput
              placeholder="Search shifts..."
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
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', minWidth: 130, bgcolor: 'white', borderRadius: '8px', '& .MuiSelect-select': { padding: '8px 12px' } }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
            <ExportButton>
              Export as CSV <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                <Th>Shift</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Duration</Th>
                <Th>Location</Th>
                <Th>Workers</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {shiftsLoading ? (
                <tr>
                  <Td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    Loading shifts...
                  </Td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <Td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No shifts found
                  </Td>
                </tr>
              ) : (
                shifts.slice(0, rowsPerPage).map((shift) => (
                  <tr key={shift.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <ShiftCell>
                        <span className="title">{shift.title}</span>
                        <span className="meta">£{shift.payRate}/hr • {shift.requiredWorkers} workers needed</span>
                      </ShiftCell>
                    </Td>
                    <Td>{shift.date}</Td>
                    <Td>{shift.time}</Td>
                    <Td>{shift.duration}</Td>
                    <Td>
                      <Box display="flex" alignItems="center" gap="4px">
                        <LocationOn sx={{ fontSize: 16, color: colors.text.secondary }} />
                        {shift.location}
                      </Box>
                    </Td>
                    <Td>
                      <Box display="flex" alignItems="center" gap="4px">
                        <Person sx={{ fontSize: 16, color: colors.text.secondary }} />
                        {shift.workers.length}/{shift.requiredWorkers}
                        {shift.workers.slice(0, 2).map((worker: any, index: number) => (
                          <WorkerChip
                            key={worker.id}
                            label={worker.fullName?.split(' ')[0] || 'Worker'}
                            size="small"
                          />
                        ))}
                        {shift.workers.length > 2 && (
                          <WorkerChip
                            label={`+${shift.workers.length - 2}`}
                            size="small"
                          />
                        )}
                      </Box>
                    </Td>
                    <Td>
                      <StatusBadge status={shift.status}>
                        {shift.status.charAt(0) + shift.status.slice(1).toLowerCase()}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, shift.id)}>
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
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '180px' },
          }}
        >
          <ActionMenuItem onClick={handleViewShift}>
            <Visibility /> View Details
          </ActionMenuItem>
          <ActionMenuItem onClick={handleEditShift}>
            <Edit /> Edit Shift
          </ActionMenuItem>
          <ActionMenuItem danger onClick={handleCancelShift}>
            <Delete /> {cancelling ? 'Cancelling...' : 'Cancel Shift'}
          </ActionMenuItem>
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
              <MenuItem value={5}>05</MenuItem>
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>Showing {Math.min(rowsPerPage, shifts.length)} out of {shifts.length} items</PaginationText>
          <PaginationControls>
            <PageButton disabled><ChevronLeft sx={{ fontSize: 18 }} /></PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>1</PageButton>
            <PageButton disabled={shifts.length <= rowsPerPage}><ChevronRight sx={{ fontSize: 18 }} /></PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>
    </DashboardContainer>
  );
}

export default ClientShiftsPage;
