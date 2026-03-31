import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People,
  Search,
  FilterList,
  FileDownload,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  AccessTime,
  CheckCircle,
  Schedule,
  Report,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox, IconButton, Menu as MuiMenu, Avatar } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { 
  useGetClientWorkersQuery,
} from '../../store/slices/clientDashboardSlice';
import { useToast } from '../../hooks/useToast';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-start',
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
  gap: '12px',
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .id': {
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
    status === 'active' ? '#D1FAE5' :
    status === 'on_shift' ? '#DBEAFE' :
    status === 'off_shift' ? '#FEF3C7' :
    '#F3F4F6',
  color:
    status === 'active' ? '#059669' :
    status === 'on_shift' ? '#1D4ED8' :
    status === 'off_shift' ? '#D97706' :
    '#6B7280',
}));

const AvailabilityBadge = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '12px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  '& svg': { fontSize: '14px' },
});

const ActionMenuItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '& svg': { fontSize: '18px' },
});

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
export function ClientWorkersPage() {
  useDocumentTitle('Workers');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuWorkerId, setMenuWorkerId] = useState<string | null>(null);

  const toast = useToast();

  // Fetch client workers
  const { data: workersData, isLoading: workersLoading } = useGetClientWorkersQuery();

  // Process workers data
  const workers = useMemo(() => {
    const data = Array.isArray(workersData) ? workersData : [];
    return data.map((w: any) => ({
      id: w.id,
      workerId: `WK-${w.id?.slice(-6).toUpperCase() || '000000'}`,
      name: w.fullName || 'Unknown',
      email: w.email || '',
      phone: w.phone || '',
      role: w.workerProfile?.jobTitle || w.workerSkills?.[0]?.skill?.name || 'Worker',
      status: w.status?.toLowerCase() === 'active' ? 'active' : 
              w.currentShift ? 'on_shift' : 'off_shift',
      availability: w.workerAvailability?.[0]?.status === 'AVAILABLE' ? 'available' : 'unavailable',
      avatar: w.profilePicUrl || '',
      lastShift: w.lastShift?.endTime || null,
    }));
  }, [workersData]);

  // Calculate stats from workers data
  const stats = useMemo(() => {
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const onShift = workers.filter(w => w.status === 'on_shift').length;
    const available = workers.filter(w => w.availability === 'available').length;
    
    return {
      totalWorkers,
      activeWorkers,
      onShift,
      available,
    };
  }, [workers]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workerId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuWorkerId(workerId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuWorkerId(null);
  };

  const handleViewProfile = () => {
    // Clients cannot view worker profiles - only available to agencies
    toast.info('Worker profile viewing is only available to agencies');
    handleMenuClose();
  };

  const handleAssignShift = () => {
    // Clients cannot assign shifts - only available to agencies
    toast.info('Shift assignment is only available to agencies');
    handleMenuClose();
  };

  const handleReportWorker = () => {
    if (menuWorkerId) {
      // Navigate to worker reporting page or open report modal
      toast.info('Report worker feature coming soon');
    }
    handleMenuClose();
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Workers</PageTitle>
          <PageSubtitle>Manage your workforce and assignments</PageSubtitle>
        </TitleSection>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Workers"
          value={stats.totalWorkers}
          icon={<People />}
          color="#3B82F6"
          trend={{
            value: `${Math.round((stats.activeWorkers / Math.max(stats.totalWorkers, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="Active Workers"
          value={stats.activeWorkers}
          icon={<CheckCircle />}
          color="#10B981"
          trend={{
            value: `${Math.round((stats.activeWorkers / Math.max(stats.totalWorkers, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="On Shift"
          value={stats.onShift}
          icon={<Schedule />}
          color="#F59E0B"
          trend={{
            value: `${Math.round((stats.onShift / Math.max(stats.totalWorkers, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="Available"
          value={stats.available}
          icon={<AccessTime />}
          color="#8B5CF6"
          trend={{
            value: `${Math.round((stats.available / Math.max(stats.totalWorkers, 1)) * 100)}%`,
            direction: "neutral"
          }}
        />
      </GridCols4>

      <TableCard>
        <FilterRow>
          <FilterLeft>
            <SearchInput
              placeholder="Search workers..."
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="on_shift">On Shift</MenuItem>
              <MenuItem value="off_shift">Off Shift</MenuItem>
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
                <Th>Worker</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Availability</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {workersLoading ? (
                <tr>
                  <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    Loading workers...
                  </Td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No workers found
                  </Td>
                </tr>
              ) : (
                workers.slice(0, rowsPerPage).map((worker) => (
                  <tr key={worker.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <WorkerCell>
                        <Avatar 
                          src={worker.avatar} 
                          sx={{ width: 36, height: 36, bgcolor: '#E5E7EB', fontSize: 14 }}
                        >
                          {worker.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <span className="name">{worker.name}</span>
                          <div className="id">#{worker.workerId}</div>
                        </Box>
                      </WorkerCell>
                    </Td>
                    <Td>{worker.email}</Td>
                    <Td>{worker.phone}</Td>
                    <Td>{worker.role}</Td>
                    <Td>
                      <StatusBadge status={worker.status}>
                        {worker.status === 'on_shift' ? 'On Shift' : 
                         worker.status === 'off_shift' ? 'Off Shift' :
                         worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <AvailabilityBadge 
                        sx={{ 
                          backgroundColor: worker.availability === 'available' ? '#D1FAE5' : '#FEE2E2',
                          color: worker.availability === 'available' ? '#059669' : '#DC2626',
                        }}
                      >
                        {worker.availability === 'available' ? (
                          <>
                            <CheckCircle sx={{ fontSize: 14 }} /> Available
                          </>
                        ) : (
                          <>
                            <AccessTime sx={{ fontSize: 14 }} /> Busy
                          </>
                        )}
                      </AvailabilityBadge>
                    </Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, worker.id)}>
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
          <ActionMenuItem onClick={handleReportWorker}>
            <Report /> Report to Agency
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
          <PaginationText>Showing {Math.min(rowsPerPage, workers.length)} out of {workers.length} items</PaginationText>
          <PaginationControls>
            <PageButton disabled><ChevronLeft sx={{ fontSize: 18 }} /></PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>1</PageButton>
            <PageButton disabled={workers.length <= rowsPerPage}><ChevronRight sx={{ fontSize: 18 }} /></PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>
    </DashboardContainer>
  );
}

export default ClientWorkersPage;
