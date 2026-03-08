import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Add,
  Visibility,
  Block,
  MoreVert,
  CheckCircle,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox, IconButton, Menu as MuiMenu, Avatar } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { InviteWorkerModal } from '../../components/modals';
import { colors } from '../../utilities/colors';
import { 
  useGetWorkerListStatsQuery, 
  useGetWorkersQuery,
  useCreateWorkerBlockMutation,
  useSuspendWorkerMutation,
  useReactivateWorkerMutation,
} from '../../store/slices/workerSlice';
import { useToast } from '../../hooks/useToast';

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
    status === 'blocked' ? '#FFEBEE' :
    '#FEF3C7',
  color:
    status === 'active' ? '#059669' :
    status === 'blocked' ? '#DC2626' :
    '#D97706',
}));

const VerifiedBadge = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: '#D1FAE5',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  color: '#059669',
  '& svg': { fontSize: '14px' },
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
export function WorkersPage() {
  useDocumentTitle('Workers');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuWorkerId, setMenuWorkerId] = useState<string | null>(null);
  const [menuWorkerStatus, setMenuWorkerStatus] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Mutations
  const [blockWorker, { isLoading: blocking }] = useCreateWorkerBlockMutation();
  const [suspendWorker, { isLoading: suspending }] = useSuspendWorkerMutation();
  const [reactivateWorker, { isLoading: reactivating }] = useReactivateWorkerMutation();
  const toast = useToast();

  // Fetch worker list stats
  const { data: statsData } = useGetWorkerListStatsQuery();
  
  // Fetch worker list
  const { data: workersData, isLoading: workersLoading } = useGetWorkersQuery({});

  // Process workers data - backend returns { success: true, data: [...] }
  const workers = useMemo(() => {
    const data = workersData?.data || [];
    return (Array.isArray(data) ? data : []).map((w: any) => ({
      id: w.id,
      workerId: `WK-${w.id?.slice(-6).toUpperCase() || '000000'}`,
      name: w.fullName || 'Unknown',
      email: w.email || '',
      phone: w.phone || '',
      role: w.workerProfile?.jobTitle || w.workerSkills?.[0]?.skill?.name || 'Worker',
      status: w.status?.toLowerCase() === 'active' ? 'active' : 
              w.workerBlocks?.some((b: any) => b.status === 'ACTIVE') ? 'blocked' : 'pending',
      verified: w.workerProfile?.rtwStatus === 'VERIFIED',
      avatar: w.profilePicUrl || '',
    }));
  }, [workersData]);

  // Process stats data - backend returns { success: true, data: {...} }
  const stats = useMemo(() => {
    const data = statsData?.data;
    return {
      totalWorkers: data?.totalWorkers?.value ?? 0,
      totalWorkersChange: data?.totalWorkers?.change ?? 0,
      activeWorkers: data?.activeWorkers?.value ?? 0,
      activeWorkersChange: data?.activeWorkers?.change ?? 0,
      onShift: data?.onShift?.value ?? 0,
      onShiftChange: data?.onShift?.change ?? 0,
      blocked: data?.blocked?.value ?? 0,
      blockedChange: data?.blocked?.change ?? 0,
    };
  }, [statsData]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workerId: string, status: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuWorkerId(workerId);
    setMenuWorkerStatus(status);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuWorkerId(null);
    setMenuWorkerStatus(null);
  };

  const handleBlockWorker = async () => {
    if (!menuWorkerId) return;
    try {
      await blockWorker({ workerId: menuWorkerId, reason: 'Blocked by admin' }).unwrap();
      toast.success('Worker blocked successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to block worker');
    }
    handleMenuClose();
  };

  const handleSuspendWorker = async () => {
    if (!menuWorkerId) return;
    try {
      await suspendWorker({ workerId: menuWorkerId, reason: 'Suspended by admin' }).unwrap();
      toast.success('Worker suspended successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to suspend worker');
    }
    handleMenuClose();
  };

  const handleReactivateWorker = async () => {
    if (!menuWorkerId) return;
    try {
      await reactivateWorker(menuWorkerId).unwrap();
      toast.success('Worker reactivated successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reactivate worker');
    }
    handleMenuClose();
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Workers</PageTitle>
          <PageSubtitle>Manage and monitor your workforce</PageSubtitle>
        </TitleSection>
        <InviteButton onClick={() => setInviteOpen(true)}>
          <Add sx={{ fontSize: 18 }} />
          Invite New Worker
        </InviteButton>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Workers"
          value={stats.totalWorkers}
          icon={<People />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
          trend={{ 
            value: `${Math.abs(stats.totalWorkersChange)}%`, 
            label: 'this week', 
            direction: stats.totalWorkersChange >= 0 ? 'up' : 'down' 
          }}
        />
        <StatsCard
          title="Active Workers"
          value={stats.activeWorkers}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ 
            value: `${Math.abs(stats.activeWorkersChange)}%`, 
            label: 'this week', 
            direction: stats.activeWorkersChange >= 0 ? 'up' : 'down' 
          }}
        />
        <StatsCard
          title="On Shift"
          value={stats.onShift}
          icon={<People />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ 
            value: `${Math.abs(stats.onShiftChange)}%`, 
            label: 'this week', 
            direction: stats.onShiftChange >= 0 ? 'up' : 'down' 
          }}
        />
        <StatsCard
          title="Blocked"
          value={stats.blocked}
          icon={<Block />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
          trend={{ 
            value: `${Math.abs(stats.blockedChange)}%`, 
            label: 'this week', 
            direction: stats.blockedChange >= 0 ? 'up' : 'down' 
          }}
        />
      </GridCols4>

      <TableCard>
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
              All Status <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DropdownButton>
            <DropdownButton>
              All Roles <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DropdownButton>
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
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {workersLoading ? (
                <tr>
                  <Td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    Loading workers...
                  </Td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <Td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
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
                          <Box display="flex" alignItems="center" gap="6px">
                            <span className="name">{worker.name}</span>
                            {worker.verified && (
                              <VerifiedBadge>
                                <CheckCircle /> Verified
                              </VerifiedBadge>
                            )}
                          </Box>
                          <div className="id">#{worker.workerId}</div>
                        </Box>
                      </WorkerCell>
                    </Td>
                    <Td>{worker.email}</Td>
                    <Td>{worker.phone}</Td>
                    <Td>{worker.role}</Td>
                    <Td>
                      <StatusBadge status={worker.status}>
                        {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, worker.id, worker.status)}>
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
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/workers/${menuWorkerId}`); }}>
            <Visibility /> View Profile
          </ActionMenuItem>
          {menuWorkerStatus === 'active' && (
            <>
              <ActionMenuItem onClick={handleSuspendWorker}>
                <Pause /> {suspending ? 'Suspending...' : 'Suspend Worker'}
              </ActionMenuItem>
              <ActionMenuItem danger onClick={handleBlockWorker}>
                <Block /> {blocking ? 'Blocking...' : 'Block Worker'}
              </ActionMenuItem>
            </>
          )}
          {(menuWorkerStatus === 'pending' || menuWorkerStatus === 'blocked') && (
            <ActionMenuItem onClick={handleReactivateWorker}>
              <PlayArrow /> {reactivating ? 'Reactivating...' : 'Reactivate Worker'}
            </ActionMenuItem>
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

      <InviteWorkerModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </DashboardContainer>
  );
}

export default WorkersPage;
