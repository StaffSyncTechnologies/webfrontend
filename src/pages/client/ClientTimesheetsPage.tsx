import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetClientTimesheetsQuery,
  useApproveClientTimesheetMutation,
} from '../../store/slices/clientDashboardSlice';
import type { ClientTimesheet } from '../../store/slices/clientDashboardSlice';
import {
  AccessTime,
  Search,
  FilterList,
  Visibility,
  Edit,
  CheckCircle,
  Warning,
  Schedule,
  Person,
  AttachMoney,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Button, Chip, CircularProgress, Tabs, Tab } from '@mui/material';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const FilterRow = styled(Box)({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  marginBottom: '24px',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

const SearchInput = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontFamily: "'Outfit', sans-serif",
  },
});

const StatsContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '24px',
});

const StatCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #E5E7EB',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const StatIcon = styled(Box)<{ color: string }>(({ color }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: color,
  '& svg': {
    fontSize: '24px',
    color: colors.secondary.white,
  },
}));

const StatContent = styled(Box)({
  flex: 1,
});

const StatValue = styled('div')({
  fontSize: '24px',
  fontWeight: 700,
  color: colors.primary.navy,
  lineHeight: 1,
});

const StatLabel = styled('div')({
  fontSize: '14px',
  color: colors.text.secondary,
  marginTop: '4px',
});

const TimesheetTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  overflow: 'hidden',
  '& th': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.text.secondary,
    textAlign: 'left',
    padding: '16px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  '& td': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.text.primary,
    padding: '16px',
    borderBottom: '1px solid #F3F4F6',
  },
  '& tbody tr:hover': {
    backgroundColor: '#F9FAFB',
  },
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  ...(status === 'PENDING' && {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  }),
  ...(status === 'APPROVED' && {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  }),
  ...(status === 'FLAGGED' && {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  }),
  ...(status === 'REJECTED' && {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  }),
}));

const ActionButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: '6px',
  textTransform: 'none',
});

// ============ COMPONENT ============
export function ClientTimesheetsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch timesheets from backend
  const { data: timesheetsData, isLoading: timesheetsLoading, error: timesheetsError } = useGetClientTimesheetsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [approveTimesheet, { isLoading: isApproving }] = useApproveClientTimesheetMutation();

  // Filter timesheets based on search, status, and tab
  const filteredTimesheets = useMemo(() => {
    if (!timesheetsData) return [];
    
    let filtered = timesheetsData.filter((timesheet: ClientTimesheet) => {
      const matchesSearch = 
        timesheet.worker?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.shift?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.shift?.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Filter by tab
    if (activeTab === 0) { // All timesheets
      return filtered;
    } else if (activeTab === 1) { // Pending approval
      return filtered.filter(t => t.status === 'PENDING');
    } else if (activeTab === 2) { // Approved
      return filtered.filter(t => t.status === 'APPROVED');
    } else if (activeTab === 3) { // Flagged issues
      return filtered.filter(t => ['FLAGGED', 'REJECTED'].includes(t.status));
    }

    return filtered;
  }, [timesheetsData, searchTerm, statusFilter, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!timesheetsData) return { total: 0, pending: 0, approved: 0, flagged: 0, totalHours: 0, totalAmount: 0 };
    
    const total = timesheetsData.length;
    const pending = timesheetsData.filter(t => t.status === 'PENDING').length;
    const approved = timesheetsData.filter(t => t.status === 'APPROVED').length;
    const flagged = timesheetsData.filter(t => ['FLAGGED', 'REJECTED'].includes(t.status)).length;
    const totalHours = timesheetsData.reduce((acc, t) => acc + (t.hoursWorked || 0), 0);
    const totalAmount = totalHours * 15; // Assuming average rate of £15/hour

    return {
      total,
      pending,
      approved,
      flagged,
      totalHours,
      totalAmount,
    };
  }, [timesheetsData]);

  const handleViewTimesheet = (timesheetId: string) => {
    navigate(`/timesheets/${timesheetId}`);
  };

  const handleApproveTimesheet = async (timesheetId: string) => {
    try {
      await approveTimesheet(timesheetId).unwrap();
    } catch (error) {
      console.error('Failed to approve timesheet:', error);
    }
  };

  const handleFlagTimesheet = (timesheetId: string) => {
    // TODO: Implement flag timesheet functionality
    console.log('Flag timesheet:', timesheetId);
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <Box>
          <PageTitle>Timesheet Management</PageTitle>
          <Box sx={{ color: colors.text.secondary, fontSize: '16px', mt: 1 }}>
            Review and approve worker timesheets
          </Box>
        </Box>
      </HeaderRow>

      {/* Stats Cards */}
      <StatsContainer>
        <StatCard>
          <StatIcon color={colors.primary.blue}>
            <AccessTime />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Approval</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.status.success}>
            <CheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.status.error}>
            <Warning />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.flagged}</StatValue>
            <StatLabel>Flagged Issues</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.primary.blue}>
            <AttachMoney />
          </StatIcon>
          <StatContent>
            <StatValue>£{stats.totalAmount.toLocaleString()}</StatValue>
            <StatLabel>Total Amount</StatLabel>
          </StatContent>
        </StatCard>
      </StatsContainer>

      {/* Filters */}
      <FilterRow>
        <SearchInput
          placeholder="Search timesheets by worker name, shift, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: colors.text.secondary }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setStatusFilter(statusFilter === 'all' ? 'PENDING' : statusFilter === 'PENDING' ? 'APPROVED' : statusFilter === 'APPROVED' ? 'FLAGGED' : 'all')}
        >
          {statusFilter === 'all' ? 'All Status' : statusFilter}
        </Button>
      </FilterRow>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: '24px' }}>
        <Tab label="All Timesheets" />
        <Tab label="Pending Approval" />
        <Tab label="Approved" />
        <Tab label="Flagged Issues" />
      </Tabs>

      {/* Loading State */}
      {timesheetsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: '40px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {timesheetsError && !timesheetsLoading && (
        <Box sx={{ textAlign: 'center', py: '40px', color: colors.text.secondary }}>
          <AccessTime sx={{ fontSize: '48px', mb: '16px', opacity: 0.5 }} />
          <Box sx={{ fontSize: '18px', mb: '8px' }}>Error loading timesheets</Box>
          <Box sx={{ fontSize: '14px' }}>Please try again later</Box>
        </Box>
      )}

      {/* Timesheets Table */}
      {!timesheetsLoading && !timesheetsError && (
        <TimesheetTable>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Shift Details</th>
              <th>Date & Time</th>
              <th>Hours</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTimesheets.map((timesheet: ClientTimesheet) => (
              <tr key={timesheet.id}>
                <td>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box sx={{ width: '40px', height: '40px', borderRadius: '50%', bgcolor: colors.primary.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondary.white, fontSize: '14px', fontWeight: 600 }}>
                      {timesheet.worker?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                    </Box>
                    <Box>
                      <Box sx={{ fontWeight: 600, color: colors.primary.navy }}>{timesheet.worker?.fullName || 'Unknown'}</Box>
                      <Box sx={{ fontSize: '12px', color: colors.text.secondary }}>{timesheet.shift?.role || ''}</Box>
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box>
                    <Box sx={{ fontWeight: 500, color: colors.primary.navy }}>{timesheet.shift?.title || '-'}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary, mt: '2px' }}>
                      {timesheet.shift?.role || ''}
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box>
                    <Box sx={{ fontWeight: 500 }}>{timesheet.clockInAt ? new Date(timesheet.clockInAt).toLocaleDateString() : '-'}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary, mt: '2px' }}>
                      {timesheet.clockInAt ? new Date(timesheet.clockInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} - {timesheet.clockOutAt ? new Date(timesheet.clockOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still clocked in'}
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box sx={{ fontWeight: 600 }}>{timesheet.hoursWorked != null ? `${Number(timesheet.hoursWorked).toFixed(1)}h` : '-'}</Box>
                </td>
                <td>
                  <Box sx={{ fontWeight: 600, color: colors.status.success }}>
                    {timesheet.hoursWorked != null ? `£${(Number(timesheet.hoursWorked) * 15).toFixed(2)}` : '-'}
                  </Box>
                </td>
                <td>
                  <StatusChip label={timesheet.status.replace('_', ' ')} status={timesheet.status} />
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: '8px' }}>
                    <ActionButton
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleViewTimesheet(timesheet.id)}
                    >
                      View
                    </ActionButton>
                    {timesheet.status === 'PENDING' && (
                      <>
                        <ActionButton
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApproveTimesheet(timesheet.id)}
                          disabled={isApproving}
                        >
                          Approve
                        </ActionButton>
                        <ActionButton
                          variant="text"
                          color="error"
                          startIcon={<Warning />}
                          onClick={() => handleFlagTimesheet(timesheet.id)}
                        >
                          Flag
                        </ActionButton>
                      </>
                    )}
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </TimesheetTable>
      )}

      {!timesheetsLoading && !timesheetsError && filteredTimesheets.length === 0 && (
        <Box sx={{ textAlign: 'center', py: '40px', color: colors.text.secondary }}>
          <AccessTime sx={{ fontSize: '48px', mb: '16px', opacity: 0.5 }} />
          <Box sx={{ fontSize: '18px', mb: '8px' }}>No timesheets found</Box>
          <Box sx={{ fontSize: '14px' }}>Try adjusting your search or filters</Box>
        </Box>
      )}
    </DashboardContainer>
  );
}

export default ClientTimesheetsPage;
