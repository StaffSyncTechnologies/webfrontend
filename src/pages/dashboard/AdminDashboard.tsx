import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAdminStatsQuery,
  useGetShiftsByDayQuery,
  useGetWorkersAvailabilityQuery,
  useGetRecentActivityQuery,
  useGetRecentClientsQuery,
} from '../../store/slices/dashboardSlice';
import { useGetSubscriptionSummaryQuery } from '../../store/slices/subscriptionSlice';
import {
  People,
  Contacts,
  AttachMoney,
  CalendarMonth,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox } from '@mui/material';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
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

const DonutChart = styled(Box)({
  position: 'relative',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: `conic-gradient(${colors.primary.blue} 0deg 324deg, #E5E7EB 324deg 360deg)`,
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
});

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

const ActivitySection = styled(Box)({
  marginTop: '24px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const ActivityHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
});

const ActivityTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const SearchFilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
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

const WorkerCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const Avatar = styled(Box)({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: '#E5E7EB',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const StatusBadge = styled('span')<{ status: 'completed' | 'ongoing' }>(({ status }) => ({
  padding: '4px 12px',
  borderRadius: '16px',
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
  '&:hover': {
    textDecoration: 'underline',
  },
});

const Pagination = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '24px',
  marginTop: '16px',
  paddingTop: '16px',
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
  '&:hover': {
    backgroundColor: '#F9FAFB',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const ClientsSection = styled(Box)({
  marginTop: '24px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '24px',
});

const ClientsHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const ClientsTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

const ViewAllLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const ClientsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
});

const ClientCard = styled(Box)({
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#FAFAFA',
  '&:hover': {
    borderColor: colors.primary.blue,
    cursor: 'pointer',
  },
});

const ClientName = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 8px 0',
});

const ClientInfo = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  margin: '4px 0',
});

const ClientStatusBadge = styled('span')<{ status: string }>(({ status }) => ({
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '12px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  backgroundColor: status === 'ACTIVE' ? '#D1FAE5' : status === 'PENDING' ? '#FEF3C7' : '#F3F4F6',
  color: status === 'ACTIVE' ? '#059669' : status === 'PENDING' ? '#D97706' : '#6B7280',
  marginTop: '8px',
}));

// ============ HELPERS ============
const formatCurrencyValue = (value: number, currency = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value);
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' | ' + date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
};

// ============ COMPONENT ============
export function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from API
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetAdminStatsQuery();
  const { data: shiftsData, isLoading: shiftsLoading, error: shiftsError } = useGetShiftsByDayQuery({});
  const { data: availabilityData, isLoading: availabilityLoading, error: availabilityError } = useGetWorkersAvailabilityQuery();
  const { data: activityData, isLoading: activityLoading, error: activityError } = useGetRecentActivityQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchTerm || undefined,
  });
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetRecentClientsQuery({ limit: 6 });
  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError } = useGetSubscriptionSummaryQuery();

  // Log errors for debugging
  if (subscriptionError) console.error('Subscription API error:', subscriptionError);
  if (statsError) console.error('Stats API error:', statsError);
  if (shiftsError) console.error('Shifts API error:', shiftsError);
  if (availabilityError) console.error('Availability API error:', availabilityError);
  if (activityError) console.error('Activity API error:', activityError);
  if (clientsError) console.error('Clients API error:', clientsError);

  // Process stats data
  const stats = useMemo(() => ({
    totalWorkers: statsData?.totalWorkers?.value ?? 0,
    totalClients: statsData?.totalClients?.value ?? 0,
    totalRevenue: statsData?.totalRevenue?.value ? formatCurrencyValue(statsData.totalRevenue.value) : '£0',
    shiftsToday: statsData?.shiftsToday?.value ?? 0,
    changes: {
      workers: statsData?.totalWorkers?.change ?? 0,
      clients: statsData?.totalClients?.change ?? 0,
      revenue: statsData?.totalRevenue?.change ?? 0,
      shifts: statsData?.shiftsToday?.change ?? 0,
    },
  }), [statsData]);

  // Process shift chart data
  const shiftChartData = useMemo(() => {
    if (!shiftsData?.shifts || !Array.isArray(shiftsData.shifts)) {
      return [{ day: 'MON', value: 0 }, { day: 'TUE', value: 0 }, { day: 'WED', value: 0 }, { day: 'THU', value: 0 }, { day: 'FRI', value: 0 }, { day: 'SAT', value: 0 }, { day: 'SUN', value: 0 }];
    }
    const maxCount = Math.max(...shiftsData.shifts.map(s => s.count), 1);
    return shiftsData.shifts.map((shiftData) => ({
      day: shiftData.day,
      value: Math.round((shiftData.count / maxCount) * 100),
    }));
  }, [shiftsData]);

  // Process availability data for donut chart
  const availability = useMemo(() => {
    if (!availabilityData) {
      return {
        activePercentage: 0,
        available: 0,
        booked: 0,
      };
    }
    
    const total = availabilityData.total || 1;
    const availableCount = availabilityData.available?.count || 0;
    const bookedCount = availabilityData.booked?.count || 0;
    
    return {
      activePercentage: availabilityData.activePercentage || 0,
      available: availabilityData.available?.percentage || 0,
      booked: availabilityData.booked?.percentage || 0,
    };
  }, [availabilityData]);

  // Process activities
  const activities = useMemo(() => (activityData?.activities ?? []) as Array<{
    id: string;
    worker: {
      id: string;
      name: string;
      avatar?: string;
    };
    clockIn: string;
    clockOut?: string;
    location: string;
    status: 'Completed' | 'Ongoing';
    shiftId: string;
    shiftTitle: string;
  }>, [activityData]);
  const pagination = useMemo(() => activityData?.pagination ?? { page: 1, limit: 8, total: 0, totalPages: 1 }, [activityData]);

  // Process recent clients
  const recentClients = useMemo(() => {
    if (!clientsData) return [];
    if (Array.isArray(clientsData)) return clientsData;
    if (Array.isArray((clientsData as any)?.data)) return (clientsData as any).data;
    return [];
  }, [clientsData]);

  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderRow>
        <PageTitle>Dashboard</PageTitle>
        <SubscriptionBadge>
          <SubscriptionInfo>
            <span className="label">Subscription Plan</span>
            <span className="value">
              {subscriptionLoading ? 'Loading...' : (subscriptionData?.planName || 'Free Trial')}
              {!subscriptionLoading && subscriptionData?.daysRemaining !== null && subscriptionData?.daysRemaining !== undefined && (
                <span style={{ color: (subscriptionData.daysRemaining ?? 0) <= 30 ? '#D97706' : colors.text.secondary, marginLeft: '8px', fontSize: '13px' }}>
                  ({subscriptionData.daysRemaining} days left)
                </span>
              )}
            </span>
          </SubscriptionInfo>
          <ViewPlansLink onClick={() => navigate('/settings/billing')}>View Plans</ViewPlansLink>
        </SubscriptionBadge>
      </HeaderRow>

      {/* Stats Overview */}
      <GridCols4>
        <StatsCard
          title="Total Workers"
          value={statsLoading && !statsError ? '-' : stats.totalWorkers}
          icon={<People />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
          trend={{ value: `${Math.abs(stats.changes.workers)}%`, label: 'this week', direction: stats.changes.workers >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Total Clients"
          value={statsLoading && !statsError ? '-' : stats.totalClients}
          icon={<Contacts />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ value: `${Math.abs(stats.changes.clients)}%`, label: 'this week', direction: stats.changes.clients >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Total Revenue"
          value={statsLoading && !statsError ? '-' : stats.totalRevenue}
          icon={<AttachMoney />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ value: `${Math.abs(stats.changes.revenue)}%`, label: 'this week', direction: stats.changes.revenue >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Shifts Today"
          value={statsLoading && !statsError ? '-' : stats.shiftsToday}
          icon={<CalendarMonth />}
          iconBgColor="#FFE4E6"
          iconColor="#F97316"
          trend={{ value: `${Math.abs(stats.changes.shifts)}%`, label: 'this week', direction: stats.changes.shifts >= 0 ? 'up' : 'down' }}
        />
      </GridCols4>

      {/* Charts Section */}
      <ChartsRow>
        {/* Bar Chart - Shift this week */}
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
              shiftChartData.map((item) => (
                <BarWrapper key={item.day}>
                  <Bar height={item.value || 5} />
                  <BarLabel>{item.day}</BarLabel>
                </BarWrapper>
              ))
            )}
          </BarChartContainer>
        </ChartCard>

        {/* Donut Chart - Workers Availability */}
        <ChartCard>
          <ChartTitle>Workers Availability</ChartTitle>
          <DonutChartContainer>
            {availabilityLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '200px' }}>Loading...</Box>
            ) : (
              <>
                <DonutChart style={{ background: `conic-gradient(${colors.primary.blue} 0deg ${(availability.available / 100) * 360}deg, #E5E7EB ${(availability.available / 100) * 360}deg 360deg)` }}>
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
                      <div className="dot" style={{ backgroundColor: '#E5E7EB' }} />
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

      {/* Recent Clients Section */}
      <ClientsSection>
        <ClientsHeader>
          <ClientsTitle>Recent Clients</ClientsTitle>
          <ViewAllLink onClick={() => navigate('/clients')}>View All</ViewAllLink>
        </ClientsHeader>
        {clientsLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
        ) : recentClients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: colors.text.secondary }}>No clients yet</Box>
        ) : (
          <ClientsGrid>
            {recentClients.map((client: any) => (
              <ClientCard key={client.id} onClick={() => navigate(`/clients/${client.id}`)}>
                <ClientName>{client.name}</ClientName>
                <ClientInfo>{client.contactName}</ClientInfo>
                <ClientInfo>{client.contactEmail}</ClientInfo>
                <ClientInfo>{client.totalShifts} shifts • {client.totalUsers} users</ClientInfo>
                <ClientStatusBadge status={client.status}>{client.status}</ClientStatusBadge>
              </ClientCard>
            ))}
          </ClientsGrid>
        )}
      </ClientsSection>

      {/* Recent Activity Table */}
      <ActivitySection>
        <ActivityHeader>
          <ActivityTitle>Recent Activity</ActivityTitle>
          <SearchFilterRow>
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
            <DateDropdown>
              Date Range <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DateDropdown>
            <ExportButton>
              Export as CSV <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </SearchFilterRow>
        </ActivityHeader>

        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
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
              activities.map((activity) => (
                <tr key={activity.id}>
                  <Td><Checkbox size="small" /></Td>
                  <Td>
                    <WorkerCell>
                      <Avatar style={activity.worker.avatar ? { backgroundImage: `url(${activity.worker.avatar})` } : {}} />
                      {activity.worker.name}
                    </WorkerCell>
                  </Td>
                  <Td>{formatDateTime(activity.clockIn)}</Td>
                  <Td>{formatDateTime(activity.clockOut)}</Td>
                  <Td>{activity.location}</Td>
                  <Td>
                    <StatusBadge status={activity.status === 'Completed' ? 'completed' : 'ongoing'}>
                      {activity.status}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ViewLink onClick={() => navigate(`/shifts/${activity.shiftId}`)}>View</ViewLink>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Pagination>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              size="small"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                '& .MuiSelect-select': { padding: '6px 12px' },
              }}
            >
              <MenuItem value={5}>05</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>Showing {activities.length} out of {pagination.total} items</PaginationText>
          <PaginationControls>
            <PageButton disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>
              {currentPage}
            </PageButton>
            <PageButton disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </Pagination>
      </ActivitySection>
    </DashboardContainer>
  );
}

export default AdminDashboard;
