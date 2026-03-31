import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetClientDashboardQuery,
  useGetClientShiftsQuery,
  useGetClientTimesheetsQuery, 
} from '../../store/slices/clientDashboardSlice';
import type { ClientShift, ClientTimesheet } from '../../store/slices/clientDashboardSlice';
import type { RootState } from '../../store';
import {
  People,
  CalendarMonth,
  AttachMoney,
  Description,
  TrendingUp,
  Schedule,
  Assessment,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { Box, styled, Select, MenuItem, Button, Chip, CircularProgress } from '@mui/material';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import AgencySelector from '../../components/client/AgencySelector';
import { ClientChat } from '../../components/client/ClientChat';
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

const WelcomeText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: '8px 0 0 0',
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

const StyledSelect = styled(Select)<{ value?: string }>(() => ({
  minWidth: '150px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontFamily: "'Outfit', sans-serif",
  },
}));

const TableContainer = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #E5E7EB',
  marginTop: '24px',
});

const TableHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

const TableTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const StyledTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  '& th': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.text.secondary,
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #E5E7EB',
  },
  '& td': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.text.primary,
    padding: '12px',
    borderBottom: '1px solid #F3F4F6',
  },
  '& tbody tr:hover': {
    backgroundColor: '#F9FAFB',
  },
});

const StatusChip = styled(Chip)<{ status: string }>(({ status }) => {
  const s = status?.toUpperCase();
  return {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    ...((s === 'COMPLETED' || s === 'APPROVED') && {
      backgroundColor: '#D1FAE5',
      color: '#065F46',
    }),
    ...((s === 'PENDING' || s === 'OPEN') && {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    }),
    ...((s === 'CANCELLED') && {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
    }),
    ...((s === 'IN_PROGRESS' || s === 'FILLED') && {
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
    }),
    ...((s === 'FLAGGED') && {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
    }),
  };
});

const ActionButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: '6px',
  textTransform: 'none',
});

// ============ HELPERS ============
function computeAvgFillRate(shiftFillRate: { date: string; fillRate: number }[] | undefined): number {
  if (!shiftFillRate || shiftFillRate.length === 0) return 0;
  const sum = shiftFillRate.reduce((acc, d) => acc + d.fillRate, 0);
  return Math.round(sum / shiftFillRate.length);
}

// ============ COMPONENT ============
export function ClientDashboard() {
  const navigate = useNavigate();
  const [shiftStatus, setShiftStatus] = useState('all');
  
  // Get current client user
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch client dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetClientDashboardQuery();
  const { data: shiftsData } = useGetClientShiftsQuery({ status: shiftStatus !== 'all' ? shiftStatus : undefined });
  const { data: timesheetsData } = useGetClientTimesheetsQuery({ status: 'PENDING' });

  // Derived stats from real backend data
  const stats = useMemo(() => {
    const s = dashboardData?.stats;
    if (!s) return null;
    return {
      workersOnsite: s.workersOnsite ?? 0,
      totalShifts: s.totalShifts ?? 0,
      pendingTimesheets: s.pendingTimesheets ?? 0,
      totalMoneySpent: s.totalMoneySpent ?? 0,
      fillRate: computeAvgFillRate(s.shiftFillRate),
      upcomingShifts: s.upcomingShifts ?? 0,
      activeShifts: s.activeShifts ?? 0,
      workersAvailability: s.workersAvailability ?? { active: 0, available: 0, booked: 0 },
    };
  }, [dashboardData]);

  if (dashboardLoading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardContainer>
    );
  }

  if (dashboardError && !dashboardData) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap="16px">
          <Box sx={{ fontSize: '18px', color: colors.text.secondary }}>Unable to load dashboard data.</Box>
          <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <HeaderRow>
        <Box>
          <PageTitle>Client Dashboard</PageTitle>
          <WelcomeText>
            Welcome back! Here's an overview of your workforce and activities.
          </WelcomeText>
        </Box>
        <AgencySelector />
      </HeaderRow>

      {/* Stats Cards */}
      <GridCols4>
        <StatsCard
          title="Workers On Site"
          value={stats?.workersOnsite ?? 0}
          icon={<People />}
          color="#3B82F6"
          trend={{
            value: `${stats?.workersAvailability?.active ?? 0}% active`,
            direction: "neutral"
          }}
          onClick={() => navigate('/workers')}
        />
        <StatsCard
          title="Total Shifts (Month)"
          value={stats?.totalShifts ?? 0}
          icon={<CalendarMonth />}
          color="#10B981"
          trend={{
            value: `${stats?.activeShifts ?? 0} in progress`,
            direction: "neutral"
          }}
          onClick={() => navigate('/shifts')}
        />
        <StatsCard
          title="Pending Timesheets"
          value={stats?.pendingTimesheets ?? 0}
          icon={<Description />}
          color="#F59E0B"
          trend={{
            value: (stats?.pendingTimesheets ?? 0) > 0 ? "Action required" : "All up to date",
            direction: (stats?.pendingTimesheets ?? 0) > 0 ? "down" : "neutral"
          }}
          onClick={() => navigate('/timesheets')}
        />
        <StatsCard
          title="Total Spend (Month)"
          value={`£${(stats?.totalMoneySpent ?? 0).toLocaleString()}`}
          icon={<AttachMoney />}
          color="#8B5CF6"
          trend={{
            value: "Current month",
            direction: "neutral"
          }}
          onClick={() => navigate('/invoices')}
        />
      </GridCols4>

      {/* Additional Stats Row */}
      <GridCols4 style={{ marginTop: '24px' }}>
        <StatsCard
          title="Shift Fill Rate"
          value={`${stats?.fillRate ?? 0}%`}
          icon={<TrendingUp />}
          color="#06B6D4"
          trend={{
            value: (stats?.fillRate ?? 0) >= 90 ? "Excellent" : (stats?.fillRate ?? 0) >= 75 ? "Good" : "Needs improvement",
            direction: (stats?.fillRate ?? 0) >= 90 ? "up" : (stats?.fillRate ?? 0) >= 75 ? "neutral" : "down"
          }}
        />
        <StatsCard
          title="Upcoming Shifts"
          value={stats?.upcomingShifts ?? 0}
          icon={<Schedule />}
          color="#84CC16"
          trend={{
            value: "Next 7 days",
            direction: "neutral"
          }}
          onClick={() => navigate('/shifts')}
        />
        <StatsCard
          title="Workers Available"
          value={`${stats?.workersAvailability?.available ?? 0}%`}
          icon={<Assessment />}
          color="#059669"
          trend={{
            value: `${stats?.workersAvailability?.booked ?? 0}% booked`,
            direction: "neutral"
          }}
        />
        <StatsCard
          title="Active Shifts"
          value={stats?.activeShifts ?? 0}
          icon={<People />}
          color="#7C3AED"
          trend={{
            value: "Currently running",
            direction: "neutral"
          }}
        />
      </GridCols4>

      {/* Chat Section */}
      <Box sx={{ marginTop: '32px' }}>
        <ClientChat clientUserId={user?.id || ''} />
      </Box>

      {/* Filters */}
      <FilterRow>
        <StyledSelect
          value={shiftStatus}
          onChange={(e) => setShiftStatus(e.target.value as string)}
          displayEmpty
        >
          <MenuItem value="all">All Shifts</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="FILLED">Filled</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </StyledSelect>
      </FilterRow>

      {/* Recent Shifts Table */}
      <TableContainer>
        <TableHeader>
          <TableTitle>Recent Shifts</TableTitle>
          <ActionButton onClick={() => navigate('/shifts')}>
            View All
          </ActionButton>
        </TableHeader>
        
        <StyledTable>
          <thead>
            <tr>
              <th>Shift</th>
              <th>Date / Time</th>
              <th>Workers</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shiftsData?.slice(0, 5).map((shift: ClientShift) => (
              <tr key={shift.id}>
                <td>
                  <Box>
                    <Box sx={{ fontWeight: 600 }}>{shift.title}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary }}>
                      {shift.siteLocation || shift.location?.name || shift.role}
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box>
                    <Box>{new Date(shift.startAt).toLocaleDateString()}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary }}>
                      {new Date(shift.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Box>
                  </Box>
                </td>
                <td>{shift.assignments?.length ?? 0}/{shift.workersNeeded}</td>
                <td>
                  <StatusChip 
                    label={shift.status.replace('_', ' ')} 
                    status={shift.status}
                    size="small"
                  />
                </td>
                <td>
                  <ActionButton 
                    size="small" 
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/shifts/${shift.id}`)}
                  >
                    View
                  </ActionButton>
                </td>
              </tr>
            ))}
            {(!shiftsData || shiftsData.length === 0) && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                  No shifts found
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>

      {/* Pending Timesheets */}
      <TableContainer>
        <TableHeader>
          <TableTitle>Pending Timesheets</TableTitle>
          <ActionButton onClick={() => navigate('/timesheets')}>
            View All
          </ActionButton>
        </TableHeader>
        
        <StyledTable>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Shift</th>
              <th>Clock In/Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheetsData?.slice(0, 5).map((ts: ClientTimesheet) => (
              <tr key={ts.id}>
                <td>{ts.worker?.fullName || 'Unknown'}</td>
                <td>
                  <Box>
                    <Box sx={{ fontWeight: 500 }}>{ts.shift?.title || '-'}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary }}>{ts.shift?.role || ''}</Box>
                  </Box>
                </td>
                <td>
                  <Box>
                    <Box>{ts.clockInAt ? new Date(ts.clockInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary }}>
                      {ts.clockOutAt ? new Date(ts.clockOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still clocked in'}
                    </Box>
                  </Box>
                </td>
                <td>{ts.hoursWorked != null ? `${Number(ts.hoursWorked).toFixed(1)}h` : '-'}</td>
                <td>
                  <StatusChip 
                    label={ts.status.replace('_', ' ')} 
                    status={ts.status}
                    size="small"
                  />
                </td>
                <td>
                  <ActionButton 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => navigate(`/timesheets/${ts.id}`)}
                  >
                    Review
                  </ActionButton>
                </td>
              </tr>
            ))}
            {(!timesheetsData || timesheetsData.length === 0) && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>
                  No pending timesheets
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>
    </DashboardContainer>
  );
}

export default ClientDashboard;
