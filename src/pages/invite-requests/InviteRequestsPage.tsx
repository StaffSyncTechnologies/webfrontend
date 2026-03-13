import { useState, useMemo } from 'react';
import { Box, styled, CircularProgress, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { CheckCircle, Cancel, Visibility, FilterList, Search, Email, Phone, Person } from '@mui/icons-material';
import { DashboardContainer } from '../../components/layout/DashboardContainer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useGetInviteRequestsQuery, useReviewInviteRequestMutation } from '../../store/slices/inviteRequestSlice';
import { colors } from '../../utilities/colors';
import { useToast } from '../../hooks';
import type { InviteCodeRequest } from '../../store/slices/inviteRequestSlice';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '16px',
});

const TitleSection = styled(Box)({});

const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.75rem',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PageSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const StatCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const StatIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  width: 44,
  height: 44,
  borderRadius: '10px',
  backgroundColor: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StatValue = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 700,
  color: colors.primary.navy,
  lineHeight: 1.2,
});

const StatLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.8125rem',
  color: colors.text.secondary,
});

const GridCols3 = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  marginTop: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
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
  width: '280px',
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

const RequesterCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .email': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const ActionButton = styled(IconButton)({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  '&:hover': { backgroundColor: '#F3F4F6' },
});

// ============ HELPERS ============
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return { bg: '#FEF3C7', color: '#D97706' };
    case 'APPROVED': return { bg: '#D1FAE5', color: '#059669' };
    case 'REJECTED': return { bg: '#FFE4E6', color: '#DC2626' };
    default: return { bg: '#F3F4F6', color: '#6B7280' };
  }
};

// ============ COMPONENT ============
export function InviteRequestsPage() {
  useDocumentTitle('Invite Requests');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailRequest, setDetailRequest] = useState<InviteCodeRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data, isLoading, error } = useGetInviteRequestsQuery();
  const [reviewRequest, { isLoading: reviewing }] = useReviewInviteRequestMutation();
  const toast = useToast();

  const requests = useMemo(() => {
    const all = data?.data ?? [];
    let filtered = all;
    if (activeTab !== 'all') {
      filtered = filtered.filter((r) => r.status === activeTab.toUpperCase());
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.fullName.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          (r.phone && r.phone.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [data, activeTab, searchTerm]);

  const stats = useMemo(() => {
    const all = data?.data ?? [];
    return {
      total: all.length,
      pending: all.filter((r) => r.status === 'PENDING').length,
      approved: all.filter((r) => r.status === 'APPROVED').length,
      rejected: all.filter((r) => r.status === 'REJECTED').length,
    };
  }, [data]);

  const handleApprove = async (id: string) => {
    try {
      await reviewRequest({ id, status: 'APPROVED' }).unwrap();
      toast.success('Request approved successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectOpen = (id: string) => {
    setRejectId(id);
    setRejectNotes('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectId) return;
    try {
      await reviewRequest({ id: rejectId, status: 'REJECTED', notes: rejectNotes || undefined }).unwrap();
      toast.success('Request rejected');
      setRejectDialogOpen(false);
      setRejectId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reject request');
    }
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderRow>
        <TitleSection>
          <PageTitle>Invite Requests</PageTitle>
          <PageSubtitle>Review and manage worker invite code requests</PageSubtitle>
        </TitleSection>
      </HeaderRow>

      {/* Stats */}
      <GridCols3>
        <StatCard>
          <StatIcon bgColor="#FEF3C7">
            <FilterList sx={{ color: '#F59E0B', fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Requests</StatLabel>
          </Box>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#D1FAE5">
            <CheckCircle sx={{ color: '#10B981', fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </Box>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#FFE4E6">
            <Cancel sx={{ color: '#EF4444', fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>Rejected</StatLabel>
          </Box>
        </StatCard>
      </GridCols3>

      {/* Table */}
      <TableCard>
        <TabsRow>
          <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All ({stats.total})
          </Tab>
          <Tab active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
            Pending ({stats.pending})
          </Tab>
          <Tab active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>
            Approved ({stats.approved})
          </Tab>
          <Tab active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>
            Rejected ({stats.rejected})
          </Tab>
        </TabsRow>

        <FilterRow>
          <SearchInput
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: '#9CA3AF', fontSize: 20, mr: 1 }} />,
            }}
          />
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8, color: colors.status.error, fontFamily: "'Outfit', sans-serif" }}>
              Failed to load requests. Please try again.
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: colors.text.secondary, fontFamily: "'Outfit', sans-serif" }}>
              No invite requests found.
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Requester</Th>
                  <Th>Phone</Th>
                  <Th>Submitted</Th>
                  <Th>Status</Th>
                  <Th>Reviewed By</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const statusStyle = getStatusColor(req.status);
                  return (
                    <tr key={req.id}>
                      <Td>
                        <RequesterCell>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: colors.primary.blue, fontSize: 14 }}>
                            {req.fullName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <div className="name">{req.fullName}</div>
                            <div className="email">{req.email}</div>
                          </Box>
                        </RequesterCell>
                      </Td>
                      <Td>{req.phone || '—'}</Td>
                      <Td>
                        <Box>
                          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                            {formatDate(req.createdAt)}
                          </Box>
                          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>
                            {formatTime(req.createdAt)}
                          </Box>
                        </Box>
                      </Td>
                      <Td>
                        <Chip
                          label={req.status}
                          size="small"
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 500,
                            fontSize: '12px',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            borderRadius: '16px',
                          }}
                        />
                      </Td>
                      <Td>
                        {req.reviewer ? (
                          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px' }}>
                            {req.reviewer.fullName}
                            {req.reviewedAt && (
                              <Box sx={{ fontSize: '11px', color: colors.text.secondary }}>
                                {formatDate(req.reviewedAt)}
                              </Box>
                            )}
                          </Box>
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td>
                        <Box sx={{ display: 'flex', gap: '4px' }}>
                          <ActionButton
                            size="small"
                            title="View Details"
                            onClick={() => setDetailRequest(req)}
                          >
                            <Visibility sx={{ fontSize: 18, color: colors.primary.blue }} />
                          </ActionButton>
                          {req.status === 'PENDING' && (
                            <>
                              <ActionButton
                                size="small"
                                title="Approve"
                                onClick={() => handleApprove(req.id)}
                                disabled={reviewing}
                              >
                                <CheckCircle sx={{ fontSize: 18, color: colors.status.success }} />
                              </ActionButton>
                              <ActionButton
                                size="small"
                                title="Reject"
                                onClick={() => handleRejectOpen(req.id)}
                                disabled={reviewing}
                              >
                                <Cancel sx={{ fontSize: 18, color: colors.status.error }} />
                              </ActionButton>
                            </>
                          )}
                        </Box>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Box>
      </TableCard>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailRequest}
        onClose={() => setDetailRequest(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        {detailRequest && (
          <>
            <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Request Details
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Person sx={{ color: colors.text.secondary, fontSize: 20 }} />
                  <Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Full Name</Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{detailRequest.fullName}</Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Email sx={{ color: colors.text.secondary, fontSize: 20 }} />
                  <Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Email</Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{detailRequest.email}</Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone sx={{ color: colors.text.secondary, fontSize: 20 }} />
                  <Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Phone</Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{detailRequest.phone || 'Not provided'}</Box>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, mb: 0.5 }}>Status</Box>
                  <Chip
                    label={detailRequest.status}
                    size="small"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 500,
                      backgroundColor: getStatusColor(detailRequest.status).bg,
                      color: getStatusColor(detailRequest.status).color,
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Submitted</Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif" }}>{formatDate(detailRequest.createdAt)} at {formatTime(detailRequest.createdAt)}</Box>
                </Box>
                {detailRequest.reviewer && (
                  <Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Reviewed By</Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif" }}>{detailRequest.reviewer.fullName}</Box>
                  </Box>
                )}
                {detailRequest.notes && (
                  <Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Notes</Box>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif" }}>{detailRequest.notes}</Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {detailRequest.status === 'PENDING' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setDetailRequest(null);
                      handleRejectOpen(detailRequest.id);
                    }}
                    sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px' }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleApprove(detailRequest.id);
                      setDetailRequest(null);
                    }}
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      textTransform: 'none',
                      borderRadius: '8px',
                      backgroundColor: colors.status.success,
                      '&:hover': { backgroundColor: '#059669' },
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
              <Button
                onClick={() => setDetailRequest(null)}
                sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none' }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
          Reject Request
        </DialogTitle>
        <DialogContent>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, mb: 2 }}>
            Are you sure you want to reject this invite request? You can optionally add a reason below.
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Reason for rejection (optional)"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '8px', fontFamily: "'Outfit', sans-serif" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={reviewing}
            sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px' }}
          >
            {reviewing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
}

export default InviteRequestsPage;
