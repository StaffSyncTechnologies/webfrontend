import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarMonth,
  People,
  TrendingUp,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  MoreVert,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox, IconButton } from '@mui/material';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useGetRoleDashboardQuery,
  useGetShiftsByDayQuery,
  useGetWorkersAvailabilityQuery,
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
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const ViewPlansLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const ChartsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '24px',
  marginTop: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
});

const ChartCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #E5E7EB',
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

const DateDropdown = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
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
  padding: '0 16px',
});

const BarWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
});

const Bar = styled(Box)<{ height: number }>(({ height }) => ({
  width: '40px',
  height: `${height}%`,
  backgroundColor: colors.primary.blue,
  borderRadius: '4px 4px 0 0',
  minHeight: '20px',
}));

const BarLabel = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const DonutChartContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
});

const DonutChart = styled(Box)<{ available: number; booked: number }>(({ available, booked }) => ({
  position: 'relative',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: `conic-gradient(${colors.primary.blue} 0deg ${available * 3.6}deg, #94A3B8 ${available * 3.6}deg ${(available + booked) * 3.6}deg, #E5E7EB ${(available + booked) * 3.6}deg 360deg)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100px',
    height: '100px',
    backgroundColor: colors.secondary.white,
    borderRadius: '50%',
  },
}));

const DonutCenter = styled(Box)({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  '& .percentage': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    color: colors.primary.navy,
  },
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const DonutLegend = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '24px',
  width: '100%',
});

const LegendItem = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '& .left': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  '& .dot': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: colors.text.secondary,
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const ShiftSection = styled(Box)({
  marginTop: '24px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const TabsContainer = styled(Box)({
  display: 'flex',
  gap: '24px',
  borderBottom: '1px solid #E5E7EB',
  marginBottom: '24px',
});

const Tab = styled('button')<{ active?: boolean }>(({ active }) => ({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: active ? colors.primary.navy : colors.text.secondary,
  paddingBottom: '12px',
  cursor: 'pointer',
  borderBottom: active ? `2px solid ${colors.primary.navy}` : '2px solid transparent',
  marginBottom: '-1px',
}));

const SearchFilterRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  flexWrap: 'wrap',
  gap: '12px',
});

const SearchInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
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
  '&:hover': {
    backgroundColor: '#F9FAFB',
  },
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
  '&:hover': {
    backgroundColor: '#1a2d4a',
  },
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

const StatusBadge = styled('span')<{ status: 'open' | 'completed' }>(({ status }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: status === 'completed' ? '#D1FAE5' : '#DBEAFE',
  color: status === 'completed' ? '#059669' : '#2563EB',
}));

const ProgressBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '& .bar': {
    flex: 1,
    height: '6px',
    backgroundColor: '#E5E7EB',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  '& .fill': {
    height: '100%',
    borderRadius: '3px',
  },
  '& .text': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    minWidth: '80px',
  },
  '& .percent': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    minWidth: '40px',
    textAlign: 'right',
  },
});

// ============ HELPERS ============
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (startAt: string, endAt: string): string => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${start.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()} - ${end.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}`;
};

export function OpsManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'history' | 'requests'>('history');

  // Fetch data from API
  const { data: roleDashboard, isLoading: roleLoading } = useGetRoleDashboardQuery();
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsByDayQuery({});
  const { data: availabilityData, isLoading: availabilityLoading } = useGetWorkersAvailabilityQuery();
  const { data: shiftsOverview, isLoading: overviewLoading } = useGetShiftsOverviewQuery({ period: 'week' });
  const { data: subscriptionData } = useGetSubscriptionSummaryQuery();

  // Process stats
  const stats = useMemo(() => {
    const roleStats = (roleDashboard as any)?.stats || {};
    const fillRate = shiftsOverview?.fillRate?.percentage || 0;
    return {
      openShifts: roleStats.openShifts || 0,
      activeShifts: roleStats.activeShifts || 0,
      availableWorkers: roleStats.activeWorkers || 0,
      fillRate,
    };
  }, [roleDashboard, shiftsOverview]);

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

  // Process availability data
  const availability = useMemo(() => ({
    activePercentage: availabilityData?.activePercentage ?? 0,
    available: availabilityData?.available?.percentage ?? 0,
    booked: availabilityData?.booked?.percentage ?? 0,
  }), [availabilityData]);

  // Process upcoming shifts for table
  const upcomingShifts = useMemo(() => {
    const shifts = (roleDashboard as any)?.upcomingShifts || [];
    return shifts.map((s: any) => ({
      id: s.id,
      title: s.title || s.role,
      date: formatDate(s.startAt),
      duration: formatTime(s.startAt, s.endAt),
      location: s.clientName || 'N/A',
      workersFilled: s.workersAssigned || 0,
      workersNeeded: s.workersNeeded || 1,
      status: s.status === 'FILLED' || s.workersAssigned >= s.workersNeeded ? 'completed' : 'open',
    }));
  }, [roleDashboard]);

  const maxBarValue = Math.max(...shiftChartData.map((d: any) => d.value), 1);

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
          title="Open Shift"
          value={roleLoading ? '-' : stats.openShifts}
          icon={<CalendarMonth />}
          iconBgColor="#E0F2FE"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Active Shifts"
          value={roleLoading ? '-' : stats.activeShifts}
          icon={<CalendarMonth />}
          iconBgColor="#FEE2E2"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Available Workers"
          value={roleLoading ? '-' : stats.availableWorkers}
          icon={<People />}
          iconBgColor="#E0F2FE"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Fill Rate"
          value={overviewLoading ? '-' : `${stats.fillRate}%`}
          icon={<TrendingUp />}
          iconBgColor="#FEE2E2"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
      </GridCols4>

      {/* Charts Row */}
      <ChartsRow>
        {/* Bar Chart */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Shift this week</ChartTitle>
            <DateDropdown>
              Last 7 days <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DateDropdown>
          </ChartHeader>
          <BarChartContainer>
            {shiftsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>Loading...</Box>
            ) : (
              shiftChartData.map((item: any) => (
                <BarWrapper key={item.day}>
                  <Bar height={(item.value / maxBarValue) * 100 || 5} />
                  <BarLabel>{item.day}</BarLabel>
                </BarWrapper>
              ))
            )}
          </BarChartContainer>
        </ChartCard>

        {/* Donut Chart */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Workers Availability</ChartTitle>
          </ChartHeader>
          <DonutChartContainer>
            {availabilityLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '200px' }}>Loading...</Box>
            ) : (
              <>
                <DonutChart available={availability.available} booked={availability.booked}>
                  <DonutCenter>
                    <div className="percentage">{availability.activePercentage}%</div>
                    <div className="label">Active</div>
                  </DonutCenter>
                </DonutChart>
                <DonutLegend>
                  <LegendItem>
                    <div className="left">
                      <div className="dot" style={{ backgroundColor: colors.primary.blue }} />
                      <span className="name">Available</span>
                    </div>
                    <span className="value">{availability.available}%</span>
                  </LegendItem>
                  <LegendItem>
                    <div className="left">
                      <div className="dot" style={{ backgroundColor: '#94A3B8' }} />
                      <span className="name">Booked</span>
                    </div>
                    <span className="value">{availability.booked}%</span>
                  </LegendItem>
                </DonutLegend>
              </>
            )}
          </DonutChartContainer>
        </ChartCard>
      </ChartsRow>

      {/* Shift History Section */}
      <ShiftSection>
        <TabsContainer>
          <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Shift History</Tab>
          <Tab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>Shift Requests</Tab>
        </TabsContainer>

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
            <FilterButton>
              <FilterList sx={{ fontSize: 18 }} /> Filter
            </FilterButton>
          </Box>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <DropdownButton>Date Range <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <DropdownButton>All Status <KeyboardArrowDown sx={{ fontSize: 18 }} /></DropdownButton>
            <ExportButton>
              <FileDownload sx={{ fontSize: 18 }} /> Export as CSV
            </ExportButton>
          </Box>
        </SearchFilterRow>

        <Table>
          <thead>
            <tr>
              <Th><Checkbox size="small" /></Th>
              <Th>Shift Title & ID</Th>
              <Th>Date</Th>
              <Th>Duration</Th>
              <Th>Location</Th>
              <Th>Workers</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {roleLoading ? (
              <tr><Td colSpan={8} style={{ textAlign: 'center' }}>Loading...</Td></tr>
            ) : upcomingShifts.length === 0 ? (
              <tr><Td colSpan={8} style={{ textAlign: 'center' }}>No shifts found</Td></tr>
            ) : (
              upcomingShifts.map((shift: any) => {
                const fillPercent = (shift.workersFilled / shift.workersNeeded) * 100;
                const fillColor = fillPercent === 100 ? '#10B981' : fillPercent > 50 ? '#F59E0B' : '#3B82F6';
                return (
                  <tr key={shift.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <Box>
                        <div style={{ fontWeight: 500 }}>{shift.title}</div>
                        <div style={{ fontSize: '12px', color: colors.text.secondary }}>#{shift.id.slice(0, 8)}</div>
                      </Box>
                    </Td>
                    <Td>{shift.date}</Td>
                    <Td>{shift.duration}</Td>
                    <Td>{shift.location}</Td>
                    <Td>
                      <ProgressBar>
                        <span className="text">{shift.workersFilled}/{shift.workersNeeded} filled</span>
                        <div className="bar">
                          <div className="fill" style={{ width: `${fillPercent}%`, backgroundColor: fillColor }} />
                        </div>
                        <span className="percent">{Math.round(fillPercent)}%</span>
                      </ProgressBar>
                    </Td>
                    <Td>
                      <StatusBadge status={shift.status as 'open' | 'completed'}>
                        {shift.status === 'completed' ? 'Completed' : 'Open'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <IconButton size="small" onClick={() => navigate(`/shifts/${shift.id}`)}>
                        <MoreVert />
                      </IconButton>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </ShiftSection>
    </DashboardContainer>
  );
}

export default OpsManagerDashboard;
