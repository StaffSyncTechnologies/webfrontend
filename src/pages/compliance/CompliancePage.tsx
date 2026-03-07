import { useState } from 'react';
import {
  VerifiedUser,
  Search,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  Refresh,
  MoreVert,
  Close,
  Person,
  ContentCopy,
} from '@mui/icons-material';
import { useDocumentTitle } from '../../hooks';
import {
  Box,
  styled,
  CircularProgress,
  InputBase,
  Select,
  MenuItem,
  IconButton,
  Menu,
  Modal,
  TextField,
} from '@mui/material';
import { DashboardContainer, PageTitle } from '../../components/layout';
import { Card, Button } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useGetComplianceStatsQuery,
  useListComplianceWorkersQuery,
  useVerifyRTWManualMutation,
  useGetWorkerDocumentsQuery,
  useVerifyDocumentMutation,
  useGetWorkerRTWQuery,
  type ComplianceWorker,
} from '../../store/slices/complianceSlice';
import { useToast } from '../../hooks';

// ============ STYLED COMPONENTS ============
const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
});

const StatsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  marginBottom: '24px',
  '@media (max-width: 1200px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
  },
});

const StatCard = styled(Card)<{ color?: string }>(({ color }) => ({
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  borderLeft: `4px solid ${color || colors.primary.blue}`,
}));

const StatIcon = styled(Box)<{ bgcolor?: string }>(({ bgcolor }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: bgcolor || colors.primary.blue + '15',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: '24px',
    color: bgcolor?.replace('15', '') || colors.primary.blue,
  },
}));

const StatContent = styled(Box)({
  flex: 1,
});

const StatValue = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.75rem',
  fontWeight: 700,
  color: colors.text.primary,
  lineHeight: 1.2,
});

const StatLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
});

const FiltersRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
});

const SearchWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  padding: '8px 16px',
  gap: '8px',
  minWidth: '280px',
  '& svg': {
    color: colors.text.secondary,
    fontSize: '1.25rem',
  },
});

const SearchInput = styled(InputBase)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.primary,
  flex: 1,
});

const FilterSelect = styled(Select)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  minWidth: '160px',
  '& .MuiSelect-select': {
    padding: '10px 16px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

const TableCard = styled(Card)({
  padding: 0,
  overflow: 'hidden',
});

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
});

const Th = styled('th')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 600,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '16px',
  borderBottom: `1px solid ${colors.secondary.lightGray}`,
  backgroundColor: '#FAFAFA',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const Td = styled('td')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.primary,
  padding: '16px',
  borderBottom: `1px solid ${colors.secondary.lightGray}`,
  verticalAlign: 'middle',
});

const WorkerInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const Avatar = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: colors.primary.blue + '20',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.primary.blue,
  fontWeight: 600,
  fontSize: '0.875rem',
});

const WorkerName = styled('div')({
  fontWeight: 600,
  color: colors.text.primary,
});

const WorkerEmail = styled('div')({
  fontSize: '0.75rem',
  color: colors.text.secondary,
});

const StatusBadge = styled('span')<{ status: string }>(({ status }) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    APPROVED: { bg: colors.status.success + '15', text: colors.status.success },
    PENDING: { bg: colors.status.warning + '15', text: colors.status.warning },
    REJECTED: { bg: colors.status.error + '15', text: colors.status.error },
    EXPIRED: { bg: colors.status.error + '15', text: colors.status.error },
    REQUIRES_REVIEW: { bg: colors.primary.blue + '15', text: colors.primary.blue },
    NOT_STARTED: { bg: '#E5E7EB', text: colors.text.secondary },
  };
  const color = statusColors[status] || statusColors.NOT_STARTED;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: color.bg,
    color: color.text,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'capitalize',
  };
});

const EmptyState = styled(Box)({
  padding: '64px 24px',
  textAlign: 'center',
  color: colors.text.secondary,
});

const Pagination = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  borderTop: `1px solid ${colors.secondary.lightGray}`,
});

const PaginationInfo = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
});

const PaginationControls = styled(Box)({
  display: 'flex',
  gap: '8px',
});

// Modal styles
const ModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300,
  padding: '20px',
});

const ModalCard = styled(Card)({
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: 0,
});

const ModalHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: `1px solid ${colors.secondary.lightGray}`,
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.25rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
});

const ModalBody = styled(Box)({
  padding: '24px',
});

const ModalFooter = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  padding: '16px 24px',
  borderTop: `1px solid ${colors.secondary.lightGray}`,
});

const FormGroup = styled(Box)({
  marginBottom: '20px',
});

const FormLabel = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '8px',
});

const StyledTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    borderRadius: '8px',
  },
});

const TabsRow = styled(Box)({
  display: 'flex',
  gap: '8px',
  marginBottom: '20px',
});

const Tab = styled(Box)<{ active?: boolean }>(({ active }) => ({
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: active ? colors.primary.blue : '#F3F4F6',
  color: active ? '#fff' : colors.text.secondary,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: active ? colors.primary.blue : '#E5E7EB',
  },
}));

// ============ HELPER FUNCTIONS ============
const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle fontSize="small" />;
    case 'PENDING':
      return <Schedule fontSize="small" />;
    case 'REJECTED':
    case 'EXPIRED':
      return <Cancel fontSize="small" />;
    case 'REQUIRES_REVIEW':
      return <Warning fontSize="small" />;
    default:
      return null;
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase();
};

// ============ COMPONENT ============
export function CompliancePage() {
  useDocumentTitle('RTW Compliance');
  const toast = useToast();

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedWorker, setSelectedWorker] = useState<ComplianceWorker | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);

  // Form state
  const [manualStatus, setManualStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [auditNote, setAuditNote] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // API hooks
  const { data: stats, isLoading: statsLoading } = useGetComplianceStatsQuery();
  const { data: workersData, isLoading: workersLoading, refetch } = useListComplianceWorkersQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: search || undefined,
    page,
    limit: 10,
  });
  const [verifyManual, { isLoading: verifyingManual }] = useVerifyRTWManualMutation();
  const [verifyDocument, { isLoading: verifyingDocument }] = useVerifyDocumentMutation();
  
  // Document query - only fetch when modal is open
  const { data: documents, isLoading: documentsLoading } = useGetWorkerDocumentsQuery(
    selectedWorker?.id ?? '',
    { skip: !selectedWorker || !documentsModalOpen }
  );

  // Worker RTW details - fetch when verify modal is open
  const { data: workerRTW } = useGetWorkerRTWQuery(
    selectedWorker?.id ?? '',
    { skip: !selectedWorker || !verifyModalOpen }
  );

  // Copy to clipboard handler
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const workers = workersData?.workers ?? [];
  const pagination = workersData?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, worker: ComplianceWorker) => {
    setMenuAnchor(event.currentTarget);
    setSelectedWorker(worker);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const openVerifyModal = () => {
    setVerifyModalOpen(true);
    handleMenuClose();
    // Reset form
    setManualStatus('APPROVED');
    setAuditNote('');
    setExpiresAt('');
  };

  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    setSelectedWorker(null);
  };

  const handleManualVerify = async () => {
    if (!selectedWorker || !auditNote) {
      toast.error('Please provide an audit note');
      return;
    }
    try {
      await verifyManual({
        workerId: selectedWorker.id,
        status: manualStatus,
        auditNote,
        expiresAt: expiresAt || undefined,
      }).unwrap();
      toast.success(`Worker RTW ${manualStatus.toLowerCase()} successfully`);
      closeVerifyModal();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update RTW status');
    }
  };

  const openDocumentsModal = () => {
    setDocumentsModalOpen(true);
    handleMenuClose();
  };

  const closeDocumentsModal = () => {
    setDocumentsModalOpen(false);
    setSelectedWorker(null);
  };

  const handleVerifyDocument = async (docId: string) => {
    if (!selectedWorker) return;
    try {
      await verifyDocument({ workerId: selectedWorker.id, docId }).unwrap();
      toast.success('Document verified successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to verify document');
    }
  };

  return (
    <DashboardContainer header={<PageTitle>RTW Compliance</PageTitle>}>
      {/* Stats Cards */}
      <StatsGrid>
        <StatCard color={colors.status.success}>
          <StatIcon bgcolor={colors.status.success + '15'}>
            <CheckCircle sx={{ color: colors.status.success }} />
          </StatIcon>
          <StatContent>
            <StatValue>{statsLoading ? '-' : stats?.approved || 0}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard color={colors.status.warning}>
          <StatIcon bgcolor={colors.status.warning + '15'}>
            <Schedule sx={{ color: colors.status.warning }} />
          </StatIcon>
          <StatContent>
            <StatValue>{statsLoading ? '-' : stats?.pending || 0}</StatValue>
            <StatLabel>Pending Review</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard color={colors.status.error}>
          <StatIcon bgcolor={colors.status.error + '15'}>
            <Cancel sx={{ color: colors.status.error }} />
          </StatIcon>
          <StatContent>
            <StatValue>{statsLoading ? '-' : (stats?.rejected || 0) + (stats?.expired || 0)}</StatValue>
            <StatLabel>Rejected / Expired</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard color={colors.primary.blue}>
          <StatIcon bgcolor={colors.primary.blue + '15'}>
            <Warning sx={{ color: colors.primary.blue }} />
          </StatIcon>
          <StatContent>
            <StatValue>{statsLoading ? '-' : stats?.expiringSoon || 0}</StatValue>
            <StatLabel>Expiring Soon</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <PageHeader>
        <FiltersRow>
          <SearchWrapper>
            <Search />
            <SearchInput
              placeholder="Search workers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </SearchWrapper>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as string);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="NOT_STARTED">Not Started</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
            <MenuItem value="REQUIRES_REVIEW">Requires Review</MenuItem>
          </FilterSelect>
        </FiltersRow>
        <Button variant="outline" onClick={() => refetch()}>
          <Refresh fontSize="small" /> Refresh
        </Button>
      </PageHeader>

      {/* Workers Table */}
      <TableCard>
        {workersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : workers.length === 0 ? (
          <EmptyState>
            <VerifiedUser sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <div>No workers found</div>
          </EmptyState>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Worker</Th>
                  <Th>RTW Status</Th>
                  <Th>Share Code</Th>
                  <Th>Checked</Th>
                  <Th>Expires</Th>
                  <Th>Checked By</Th>
                  <Th style={{ width: 50 }}></Th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <Td>
                      <WorkerInfo>
                        <Avatar>{worker.fullName.charAt(0)}</Avatar>
                        <Box>
                          <WorkerName>{worker.fullName}</WorkerName>
                          <WorkerEmail>{worker.email}</WorkerEmail>
                        </Box>
                      </WorkerInfo>
                    </Td>
                    <Td>
                      <StatusBadge status={worker.rtwStatus}>
                        {getStatusIcon(worker.rtwStatus)}
                        {formatStatus(worker.rtwStatus)}
                      </StatusBadge>
                    </Td>
                    <Td>{worker.rtwShareCode || '-'}</Td>
                    <Td>{formatDate(worker.rtwCheckedAt)}</Td>
                    <Td>{formatDate(worker.rtwExpiresAt)}</Td>
                    <Td>{worker.rtwCheckedBy || '-'}</Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, worker)}>
                        <MoreVert />
                      </IconButton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination>
              <PaginationInfo>
                Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </PaginationInfo>
              <PaginationControls>
                <Button
                  variant="outline"
                  size="small"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </PaginationControls>
            </Pagination>
          </>
        )}
      </TableCard>

      {/* Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={openDocumentsModal}>
          <VerifiedUser sx={{ mr: 1 }} /> View Documents
        </MenuItem>
        <MenuItem onClick={openVerifyModal}>
          <Person sx={{ mr: 1 }} /> RTW Verification
        </MenuItem>
      </Menu>

      {/* Verify Modal */}
      <Modal open={verifyModalOpen} onClose={closeVerifyModal}>
        <ModalOverlay onClick={closeVerifyModal}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                RTW Verification
              </ModalTitle>
              <IconButton size="small" onClick={closeVerifyModal}>
                <Close />
              </IconButton>
            </ModalHeader>
            <ModalBody>
              {selectedWorker && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <WorkerInfo>
                    <Avatar>{selectedWorker.fullName.charAt(0)}</Avatar>
                    <Box>
                      <WorkerName>{selectedWorker.fullName}</WorkerName>
                      <WorkerEmail>{selectedWorker.email}</WorkerEmail>
                    </Box>
                  </WorkerInfo>
                </Box>
              )}

              <Box sx={{ mb: 2, p: 2, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
                <Box sx={{ fontSize: '0.875rem', color: '#1E40AF', mb: 1 }}>
                  Verify share codes on the official UK Government website:
                </Box>
                <a
                  href="https://www.gov.uk/view-right-to-work"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#2563EB',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  gov.uk/view-right-to-work ↗
                </a>
              </Box>

              {/* Worker RTW Info with Copy */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '200px', p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Box sx={{ fontSize: '0.75rem', color: colors.text.secondary, mb: 0.5 }}>Share Code</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1rem' }}>
                      {workerRTW?.rtwShareCode || selectedWorker?.rtwShareCode || '—'}
                    </Box>
                    {(workerRTW?.rtwShareCode || selectedWorker?.rtwShareCode) && (
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(workerRTW?.rtwShareCode || selectedWorker?.rtwShareCode || '', 'Share Code')}
                        sx={{ p: 0.5 }}
                      >
                        <ContentCopy sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: '200px', p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Box sx={{ fontSize: '0.75rem', color: colors.text.secondary, mb: 0.5 }}>Date of Birth</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {workerRTW?.dateOfBirth ? formatDate(workerRTW.dateOfBirth) : '—'}
                    </Box>
                    {workerRTW?.dateOfBirth && (
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(new Date(workerRTW.dateOfBirth!).toLocaleDateString('en-GB'), 'Date of Birth')}
                        sx={{ p: 0.5 }}
                      >
                        <ContentCopy sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>

              <FormGroup>
                <FormLabel>Decision *</FormLabel>
                <FilterSelect
                  fullWidth
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as 'APPROVED' | 'REJECTED')}
                >
                  <MenuItem value="APPROVED">Approve RTW</MenuItem>
                  <MenuItem value="REJECTED">Reject RTW</MenuItem>
                </FilterSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Audit Note *</FormLabel>
                <StyledTextField
                  multiline
                  rows={3}
                  placeholder="Document type checked, reference numbers, etc."
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                />
              </FormGroup>
              {manualStatus === 'APPROVED' && (
                <FormGroup>
                  <FormLabel>Expiry Date (if applicable)</FormLabel>
                  <StyledTextField
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormGroup>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={closeVerifyModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleManualVerify}
                disabled={verifyingManual}
              >
                {verifyingManual ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Submit'
                )}
              </Button>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Documents Modal */}
      <Modal open={documentsModalOpen} onClose={closeDocumentsModal}>
        <ModalOverlay onClick={closeDocumentsModal}>
          <ModalCard onClick={(e) => e.stopPropagation()} sx={{ maxWidth: '700px' }}>
            <ModalHeader>
              <ModalTitle>Worker Documents</ModalTitle>
              <IconButton size="small" onClick={closeDocumentsModal}>
                <Close />
              </IconButton>
            </ModalHeader>
            <ModalBody>
              {selectedWorker && (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <WorkerInfo>
                    <Avatar>{selectedWorker.fullName.charAt(0)}</Avatar>
                    <Box>
                      <WorkerName>{selectedWorker.fullName}</WorkerName>
                      <WorkerEmail>{selectedWorker.email}</WorkerEmail>
                    </Box>
                  </WorkerInfo>
                </Box>
              )}

              {documentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !documents || documents.length === 0 ? (
                <EmptyState>
                  <VerifiedUser sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                  <div>No documents uploaded</div>
                </EmptyState>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {documents.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        p: 2,
                        border: `1px solid ${colors.secondary.lightGray}`,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Box sx={{ fontWeight: 600, color: colors.text.primary, mb: 0.5 }}>
                          {doc.title || doc.type}
                        </Box>
                        <Box sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                          {doc.documentType && <span>{doc.documentType} • </span>}
                          {doc.documentNumber && <span>#{doc.documentNumber} • </span>}
                          Uploaded {formatDate(doc.createdAt)}
                          {doc.expiresAt && <span> • Expires {formatDate(doc.expiresAt)}</span>}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {doc.verified ? (
                          <StatusBadge status="APPROVED">
                            <CheckCircle fontSize="small" /> Verified
                          </StatusBadge>
                        ) : (
                          <>
                            <StatusBadge status="PENDING">Pending</StatusBadge>
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleVerifyDocument(doc.id)}
                              disabled={verifyingDocument}
                            >
                              Verify
                            </Button>
                          </>
                        )}
                        {doc.fileUrl && (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => window.open(doc.fileUrl!, '_blank')}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={closeDocumentsModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default CompliancePage;
