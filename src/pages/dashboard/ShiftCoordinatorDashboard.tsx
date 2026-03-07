import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People,
  TrendingUp,
  CheckCircle,
  Flag,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  CalendarMonth,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Checkbox, Select, MenuItem, IconButton } from '@mui/material';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useGetRoleDashboardQuery,
  useGetShiftsByDayQuery,
  useGetWorkersAvailabilityQuery,
  useGetRecentActivityQuery,
  useGetShiftsOverviewQuery,
} from '../../store/slices/dashboardSlice';
import { useGetSubscriptionSummaryQuery } from '../../store/slices/subscriptionSlice';

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

const SubscriptionBadge = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const SubscriptionInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  '& .label': { fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary },
  '& .value': { fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.primary.navy },
});

const ViewPlansLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
});

const ChartsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '24px',
  marginTop: '24px',
  '@media (max-width: 900px)': { gridTemplateColumns: '1fr' },
});

const ChartCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const ChartHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const ChartTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const DropdownButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  cursor: 'pointer',
});

const BarChartContainer = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  height: '200px',
  paddingTop: '20px',
});

const BarWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
});

const Bar = styled(Box)<{ height: number }>(({ height }) => ({
  width: '32px',
  height: `${height}%`,
  backgroundColor: colors.primary.blue,
  borderRadius: '4px 4px 0 0',
  marginBottom: '8px',
}));

const BarLabel = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const DonutContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const DonutChart = styled(Box)({
  position: 'relative',
  width: '160px',
  height: '160px',
});

const DonutCenter = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  '& .percentage': { fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 700, color: colors.primary.navy },
});

const Legend = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '16px',
  width: '100%',
});

const LegendItem = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '& .label': { display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary },
  '& .value': { fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 500, color: colors.primary.navy },
});

const LegendDot = styled(Box)<{ color: string }>(({ color }) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: color,
}));

const ActivitySection = styled(Box)({
  marginTop: '24px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const SectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '24px',
});

const SearchFilterRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  flexWrap: 'wrap',
  gap: '12px',
});

const SearchInput = styled(TextField)({
  '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } },
  '& .MuiInputBase-input': { padding: '10px 14px', fontFamily: "'Outfit', sans-serif", fontSize: '14px' },
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
});

const Table = styled('table')({ width: '100%', borderCollapse: 'collapse' });
const Th = styled('th')({ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 500, color: colors.text.secondary, textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #E5E7EB' });
const Td = styled('td')({ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.primary.navy, padding: '16px', borderBottom: '1px solid #E5E7EB', verticalAlign: 'middle' });

const WorkerCell = styled(Box)({ display: 'flex', alignItems: 'center', gap: '12px' });
const Avatar = styled(Box)({ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E5E7EB', backgroundSize: 'cover', backgroundPosition: 'center' });

const StatusBadge = styled('span')<{ status: 'completed' | 'ongoing' }>(({ status }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: status === 'completed' ? '#D1FAE5' : '#F3F4F6',
  color: status === 'completed' ? '#059669' : '#6B7280',
}));

const ViewLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
});

const Pagination = styled(Box)({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 0' });
const PaginationInfo = styled('span')({ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary });
const PaginationControls = styled(Box)({ display: 'flex', alignItems: 'center', gap: '8px' });

// ============ HELPERS ============
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' | ' + date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
};

export function ShiftCoordinatorDashboard() {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from API
  const { data: roleDashboard, isLoading: roleLoading } = useGetRoleDashboardQuery();
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsByDayQuery({});
  const { data: availabilityData, isLoading: availabilityLoading } = useGetWorkersAvailabilityQuery();
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivityQuery({ page: currentPage, limit: rowsPerPage });
  const { data: shiftsOverview } = useGetShiftsOverviewQuery({ period: 'week' });
  const { data: subscriptionData } = useGetSubscriptionSummaryQuery();

  // Process stats
  const stats = useMemo(() => {
    const roleStats = (roleDashboard as any)?.stats || {};
    return {
      managedWorkers: availabilityData?.total || 0,
      shiftFillRate: shiftsOverview?.fillRate?.percentage || 0,
      approvedAttendance: roleStats.shiftsThisWeek || 0,
      flaggedAttendance: roleStats.openShifts || 0,
    };
  }, [roleDashboard, availabilityData, shiftsOverview]);

  // Process shift chart data
  const shiftChartData = useMemo(() => {
    if (!shiftsData?.shifts) {
      return [{ day: 'MON', value: 0 }, { day: 'TUE', value: 0 }, { day: 'WED', value: 0 }, { day: 'THU', value: 0 }, { day: 'FRI', value: 0 }, { day: 'SAT', value: 0 }, { day: 'SUN', value: 0 }];
    }
    const maxCount = Math.max(...shiftsData.shifts.map((s: any) => s.count), 1);
    return shiftsData.shifts.map((s: any) => ({
      day: s.day,
      value: Math.round((s.count / maxCount) * 100),
    }));
  }, [shiftsData]);

  // Process availability for donut chart
  const timesheetApproved = useMemo(() => {
    const approved = activityData?.activities?.filter((a: any) => a.status === 'Completed').length || 0;
    const total = activityData?.pagination?.total || 1;
    return Math.round((approved / total) * 100) || 85;
  }, [activityData]);

  // Process activities
  const activities = useMemo(() => {
    return (activityData?.activities || []).map((a: any) => ({
      id: a.id,
      worker: a.worker?.name || 'Unknown',
      avatar: a.worker?.avatar,
      clockIn: formatDateTime(a.clockIn),
      clockOut: formatDateTime(a.clockOut),
      location: a.location || 'N/A',
      status: a.status === 'Completed' ? 'completed' : 'ongoing',
    }));
  }, [activityData]);

  const pagination = activityData?.pagination || { total: 0, totalPages: 1 };

  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderRow>
        <PageTitle>Dashboard</PageTitle>
        <SubscriptionBadge>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarMonth sx={{ color: colors.primary.blue }} />
            <SubscriptionInfo>
              <span className="label">Subscription Plan</span>
              <span className="value">
                {subscriptionData?.planName || 'Free Trial'}
                {subscriptionData?.daysRemaining !== undefined && ` (${subscriptionData.daysRemaining} days left)`}
              </span>
            </SubscriptionInfo>
          </Box>
          <ViewPlansLink onClick={() => navigate('/settings/billing')}>View Plans</ViewPlansLink>
        </SubscriptionBadge>
      </HeaderRow>

      {/* Stats Cards */}
      <GridCols4>
        <StatsCard
          title="Managed Workers"
          value={roleLoading ? '-' : stats.managedWorkers}
          icon={<People />}
          iconBgColor="#E0F2FE"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Shift Fill Rate"
          value={roleLoading ? '-' : `${stats.shiftFillRate}%`}
          icon={<TrendingUp />}
          iconBgColor="#FEF3C7"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Approved Attendance"
          value={roleLoading ? '-' : stats.approvedAttendance}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Flagged Attendance"
          value={roleLoading ? '-' : stats.flaggedAttendance}
          icon={<Flag />}
          iconBgColor="#FEE2E2"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
      </GridCols4>

      {/* Charts Row */}
      <ChartsRow>
        {/* Bar Chart */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Shift Fill Rate</ChartTitle>
            <DropdownButton>Last 7 days <KeyboardArrowDown sx={{ fontSize: 16 }} /></DropdownButton>
          </ChartHeader>
          <BarChartContainer>
            {shiftsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>Loading...</Box>
            ) : (
              shiftChartData.map((item: any) => (
                <BarWrapper key={item.day}>
                  <Bar height={item.value || 5} />
                  <BarLabel>{item.day}</BarLabel>
                </BarWrapper>
              ))
            )}
          </BarChartContainer>
        </ChartCard>

        {/* Donut Chart */}
        <ChartCard>
          <ChartTitle>Shift Timesheet</ChartTitle>
          <DonutContainer>
            <DonutChart>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={colors.primary.blue}
                  strokeWidth="3"
                  strokeDasharray={`${timesheetApproved}, 100`}
                />
              </svg>
              <DonutCenter><span className="percentage">{timesheetApproved}%</span></DonutCenter>
            </DonutChart>
            <Legend>
              <LegendItem>
                <span className="label"><LegendDot color={colors.primary.blue} /> Approved</span>
                <span className="value">{timesheetApproved}%</span>
              </LegendItem>
              <LegendItem>
                <span className="label"><LegendDot color="#E5E7EB" /> Flagged</span>
                <span className="value">{100 - timesheetApproved}%</span>
              </LegendItem>
            </Legend>
          </DonutContainer>
        </ChartCard>
      </ChartsRow>

      {/* Shift Recent Activity */}
      <ActivitySection>
        <SectionTitle>Shift Recent Activity</SectionTitle>
        <SearchFilterRow>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <SearchInput
              placeholder="Search here..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: colors.text.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FilterButton><FilterList sx={{ fontSize: 18 }} /> Filter</FilterButton>
          </Box>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <DropdownButton>Date Range <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <ExportButton><FileDownload sx={{ fontSize: 18 }} /> Export as CSV</ExportButton>
          </Box>
        </SearchFilterRow>

        <Table>
          <thead>
            <tr>
              <Th><Checkbox size="small" /></Th>
              <Th>Worker</Th>
              <Th>Clock in</Th>
              <Th>Clock out</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {activityLoading ? (
              <tr><Td colSpan={7} style={{ textAlign: 'center' }}>Loading...</Td></tr>
            ) : activities.length === 0 ? (
              <tr><Td colSpan={7} style={{ textAlign: 'center' }}>No recent activity</Td></tr>
            ) : (
              activities.map((activity: any) => (
                <tr key={activity.id}>
                  <Td><Checkbox size="small" /></Td>
                  <Td>
                    <WorkerCell>
                      <Avatar style={activity.avatar ? { backgroundImage: `url(${activity.avatar})` } : {}} />
                      <span style={{ fontWeight: 500 }}>{activity.worker}</span>
                    </WorkerCell>
                  </Td>
                  <Td>{activity.clockIn}</Td>
                  <Td>{activity.clockOut}</Td>
                  <Td>{activity.location}</Td>
                  <Td>
                    <StatusBadge status={activity.status as 'completed' | 'ongoing'}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </StatusBadge>
                  </Td>
                  <Td><ViewLink onClick={() => navigate(`/shifts/${activity.id}`)}>View</ViewLink></Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Pagination>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PaginationInfo>Rows per page</PaginationInfo>
            <Select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              size="small"
              sx={{ minWidth: 60, fontFamily: "'Outfit', sans-serif", '& .MuiSelect-select': { padding: '4px 8px' } }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationInfo>Showing {activities.length} out of {pagination.total} items</PaginationInfo>
          <PaginationControls>
            <IconButton size="small" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><KeyboardArrowDown sx={{ transform: 'rotate(90deg)' }} /></IconButton>
            <Box sx={{ width: 28, height: 28, borderRadius: '4px', backgroundColor: colors.primary.navy, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '13px' }}>{currentPage}</Box>
            <IconButton size="small" disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}><KeyboardArrowDown sx={{ transform: 'rotate(-90deg)' }} /></IconButton>
          </PaginationControls>
        </Pagination>
      </ActivitySection>
    </DashboardContainer>
  );
}

export default ShiftCoordinatorDashboard;
