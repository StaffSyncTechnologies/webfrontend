import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People,
  CheckCircle,
  Cancel,
  Chat,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Add,
  Visibility,
  Edit,
  Block,
  MoreVert,
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
} from '@mui/material';
import { useDocumentTitle, useAuth } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { InviteTeamModal } from '../../components/modals';
import { colors } from '../../utilities/colors';
import { HR } from '../../utilities/endpoint';
import {
  useGetManagerStatsQuery,
  useListManagersQuery,
  useUpdateManagerStatusMutation,
  useDeleteManagerMutation,
  useGetUnassignedWorkersQuery,
  useAssignWorkersMutation,
} from '../../store/slices/hrSlice';
import { CircularProgress, Modal, Avatar } from '@mui/material';

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

const ManagerCell = styled(Box)({
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
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = {
    active: '#D1FAE5',
    inactive: '#F3F4F6',
    blocked: '#FFE4E6',
  };
  const colorMap: Record<string, string> = {
    active: '#059669',
    inactive: '#6B7280',
    blocked: '#DC2626',
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
const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'SUSPENDED': return 'Blocked';
    case 'INVITED': return 'Invited';
    case 'PENDING': return 'Pending';
    default: return status;
  }
};

// ============ COMPONENT ============
export function HRManagementPage() {
  useDocumentTitle('HR Management');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && 'role' in user && (user as { role: string }).role === 'ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuManagerId, setMenuManagerId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [assigningManagerId, setAssigningManagerId] = useState<string | null>(null);

  // API Hooks
  const { data: stats, isLoading: statsLoading } = useGetManagerStatsQuery();
  const { data: managersData, isLoading: managersLoading } = useListManagersQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status: statusFilter as any || undefined,
  });
  const [updateStatus] = useUpdateManagerStatusMutation();
  const [deleteManager] = useDeleteManagerMutation();
  const { data: unassignedWorkers = [], isLoading: workersLoading } = useGetUnassignedWorkersQuery();
  const [assignWorkers, { isLoading: assigning }] = useAssignWorkersMutation();

  const managers = managersData?.managers ?? [];
  const pagination = managersData?.pagination ?? { page: 1, limit: 8, total: 0, totalPages: 1 };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuManagerId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuManagerId(null);
  };

  const handleBlockManager = async () => {
    if (!menuManagerId) return;
    const manager = managers.find(m => m.id === menuManagerId);
    const newStatus = manager?.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await updateStatus({ managerId: menuManagerId, status: newStatus }).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to update manager status:', error);
    }
  };

  const handleDeleteManager = async () => {
    if (!menuManagerId) return;
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    try {
      await deleteManager(menuManagerId).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete manager:', error);
    }
  };

  const handleExport = () => {
    window.open(HR.EXPORT_MANAGERS, '_blank');
  };

  const selectedManager = useMemo(() => 
    managers.find(m => m.id === menuManagerId), 
    [managers, menuManagerId]
  );

  const assigningManager = useMemo(() =>
    managers.find(m => m.id === assigningManagerId),
    [managers, assigningManagerId]
  );

  const handleOpenAssignModal = (managerId: string) => {
    setAssigningManagerId(managerId);
    setSelectedWorkerIds([]);
    setAssignOpen(true);
    handleMenuClose();
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleAssignSubmit = async () => {
    if (!assigningManagerId || selectedWorkerIds.length === 0) return;
    try {
      await assignWorkers({ managerId: assigningManagerId, workerIds: selectedWorkerIds }).unwrap();
      setAssignOpen(false);
      setSelectedWorkerIds([]);
      setAssigningManagerId(null);
    } catch (error) {
      console.error('Failed to assign workers:', error);
    }
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>HR Management</PageTitle>
          <PageSubtitle>Monitor manager performance and agency workload distribution</PageSubtitle>
        </TitleSection>
        <InviteButton onClick={() => setInviteOpen(true)}>
          <Add sx={{ fontSize: 18 }} />
          Invite New Team
        </InviteButton>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Managers"
          value={statsLoading ? '-' : (stats?.totalManagers?.count ?? 0)}
          icon={<People />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ value: `${stats?.totalManagers?.change ?? 0}%`, label: 'this week', direction: (stats?.totalManagers?.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Active Managers"
          value={statsLoading ? '-' : (stats?.activeManagers?.count ?? 0)}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ value: `${stats?.activeManagers?.change ?? 0}%`, label: 'this week', direction: (stats?.activeManagers?.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Inactive Managers"
          value={statsLoading ? '-' : (stats?.inactiveManagers?.count ?? 0)}
          icon={<Cancel />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
          trend={{ value: `${stats?.inactiveManagers?.change ?? 0}%`, label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Average Compliance"
          value={statsLoading ? '-' : `${stats?.averageCompliance?.score ?? 0}%`}
          icon={<Chat />}
          iconBgColor="#EDE9FE"
          iconColor="#7C3AED"
          trend={{ value: `${stats?.averageCompliance?.change ?? 0}%`, label: 'compliance score', direction: 'up' }}
        />
      </GridCols4>

      <TableCard>
        <CardHeader><h3>List of managers</h3></CardHeader>

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
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              displayEmpty
              size="small"
              sx={{ minWidth: 120, fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="SUSPENDED">Blocked</MenuItem>
              <MenuItem value="INVITED">Invited</MenuItem>
            </Select>
            <ExportButton onClick={handleExport}>Export as XLS <FileDownload sx={{ fontSize: 18 }} /></ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          {managersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <CircularProgress />
            </Box>
          ) : managers.length === 0 ? (
            <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary }}>
              No managers found.
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                  <Th>Manager</Th>
                  <Th>Email address</Th>
                  <Th>Phone number</Th>
                  <Th>Role</Th>
                  <Th>Managed Workers</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {managers.map((m) => (
                  <tr key={m.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <ManagerCell>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#E5E7EB', fontSize: 13 }}>
                          {m.fullName?.charAt(0) || 'M'}
                        </Avatar>
                        <Box>
                          <span className="name">{m.fullName}</span>
                          <div className="id">#{m.teamNumber || m.id.slice(-8).toUpperCase()}</div>
                        </Box>
                      </ManagerCell>
                    </Td>
                    <Td>{m.email}</Td>
                    <Td>{m.phone || '-'}</Td>
                    <Td>{m.roleDisplay}</Td>
                    <Td>{m.managedWorkersCount}</Td>
                    <Td><StatusBadge status={getStatusDisplay(m.status)}>{getStatusDisplay(m.status)}</StatusBadge></Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, m.id)}>
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
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '180px' },
          }}
        >
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/hr-management/${menuManagerId}`); }}>
            <Visibility /> View profile
          </ActionMenuItem>
          {selectedManager?.role === 'SHIFT_COORDINATOR' && (
            <ActionMenuItem onClick={() => menuManagerId && handleOpenAssignModal(menuManagerId)}>
              <Edit /> Assign workers
            </ActionMenuItem>
          )}
          <ActionMenuItem danger onClick={handleBlockManager}>
            <Block /> {selectedManager?.status === 'SUSPENDED' ? 'Activate' : 'Block'} manager
          </ActionMenuItem>
          {isAdmin && (
            <ActionMenuItem danger onClick={handleDeleteManager}>
              <Delete /> Delete manager
            </ActionMenuItem>
          )}
        </MuiMenu>

        <Pagination>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              size="small"
              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>
            Showing {Math.min(rowsPerPage, managers.length)} of {pagination.total} items
          </PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage <= 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(page => (
              <PageButton 
                key={page}
                onClick={() => setCurrentPage(page)}
                style={currentPage === page ? { backgroundColor: colors.primary.navy, color: 'white', border: 'none' } : {}}
              >
                {page}
              </PageButton>
            ))}
            <PageButton 
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>

      {/* Invite Team Modal */}
      <InviteTeamModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      {/* Assign Workers Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)}>
        <Box sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{
            backgroundColor: colors.secondary.white,
            borderRadius: '12px',
            padding: '32px',
            width: '520px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            outline: 'none',
          }}>
            <IconButton
              onClick={() => setAssignOpen(false)}
              sx={{ position: 'absolute', top: '16px', right: '16px' }}
            >
              <Close />
            </IconButton>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: colors.primary.navy, textAlign: 'center', mb: 1 }}>
              Assign Workers to Shift Coordinator
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, textAlign: 'center', mb: 3 }}>
              Select workers to assign to {assigningManager?.fullName || 'this shift coordinator'}
            </Box>
            
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 500, color: colors.primary.navy, mb: 1 }}>
              Available Workers
            </Box>
            
            {workersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : unassignedWorkers.length === 0 ? (
              <Box sx={{ padding: '24px', textAlign: 'center', color: colors.text.secondary, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                No unassigned workers available
              </Box>
            ) : (
              <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px', mb: 2 }}>
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
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.primary.navy, mb: 2 }}>
                {selectedWorkerIds.length} worker(s) selected
              </Box>
            )}
            
            <Box
              component="button"
              onClick={handleAssignSubmit}
              disabled={selectedWorkerIds.length === 0 || assigning}
              sx={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: colors.primary.navy,
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: colors.secondary.white,
                cursor: selectedWorkerIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedWorkerIds.length === 0 ? 0.5 : 1,
                '&:hover': { backgroundColor: selectedWorkerIds.length > 0 ? '#1a2d4a' : colors.primary.navy },
              }}
            >
              {assigning ? 'Assigning...' : `Assign ${selectedWorkerIds.length} Worker(s)`}
            </Box>
          </Box>
        </Box>
      </Modal>
    </DashboardContainer>
  );
}

export default HRManagementPage;
