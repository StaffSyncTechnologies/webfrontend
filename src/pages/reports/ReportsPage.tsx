import { useState } from 'react';
import {
  People,
  Business,
  AttachMoney,
  CalendarToday,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
} from '@mui/icons-material';
import {
  Box,
  styled,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Checkbox,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useGetExecutiveSummaryQuery,
  useGetShiftReportQuery,
  useGetAttendanceReportQuery,
  useGetWorkforceReportQuery,
  useGetClientReportQuery,
} from '../../store/slices/reportSlice';

// ============ STYLED COMPONENTS ============
const HeaderSection = styled(Box)({
  marginBottom: '24px',
});

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

// Charts Row
const ChartsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1.8fr 1fr',
  gap: '24px',
  marginTop: '24px',
  marginBottom: '24px',
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
  marginBottom: '20px',
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
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

// Bar Chart (SVG) - now accepts data prop
const BarChartSvg = ({ data }: { data: Array<{ day: string; count: number }> }) => {
  // Default data if no data provided
  const chartData = data.length > 0 ? data.map(d => ({
    day: d.day.substring(0, 3).toUpperCase(),
    value: d.count,
  })) : [
    { day: 'MON', value: 0 },
    { day: 'TUE', value: 0 },
    { day: 'WED', value: 0 },
    { day: 'THU', value: 0 },
    { day: 'FRI', value: 0 },
    { day: 'SAT', value: 0 },
    { day: 'SUN', value: 0 },
  ];
  
  const maxVal = Math.max(...chartData.map(d => d.value), 10);
  const chartH = 200;
  const barW = 40;
  const gap = 50;
  const startX = 40;
  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  return (
    <svg width="100%" height="260" viewBox="0 0 430 260" preserveAspectRatio="xMidYMid meet">
      {yLabels.map((label) => {
        const y = chartH - (label / maxVal) * chartH + 20;
        return (
          <g key={label}>
            <text x="25" y={y + 4} textAnchor="end" fontFamily="Outfit, sans-serif" fontSize="11" fill="#9CA3AF">{label}</text>
            <line x1={startX} y1={y} x2={420} y2={y} stroke="#F3F4F6" strokeWidth="1" />
          </g>
        );
      })}
      {chartData.map((d, i) => {
        const barH = maxVal > 0 ? (d.value / maxVal) * chartH : 0;
        const x = startX + 15 + i * (barW + gap);
        const y = chartH - barH + 20;
        return (
          <g key={d.day}>
            <rect x={x} y={y} width={barW} height={barH || 2} rx="4" fill={colors.primary.blue} />
            <text x={x + barW / 2} y={chartH + 38} textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="11" fill="#9CA3AF">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
};

// Donut Chart (SVG)
const DonutChartSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const DonutSvg = ({ activePercent = 90 }: { activePercent?: number }) => {
  const radius = 70;
  const stroke = 18;
  const center = 90;
  const circumference = 2 * Math.PI * radius;
  const activeDash = (activePercent / 100) * circumference;
  const remainDash = circumference - activeDash;

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#E0F2FE" strokeWidth={stroke} />
      <circle
        cx={center} cy={center} r={radius} fill="none"
        stroke={colors.primary.blue}
        strokeWidth={stroke}
        strokeDasharray={`${activeDash} ${remainDash}`}
        strokeDashoffset={circumference / 4}
        strokeLinecap="round"
      />
      <text x={center} y={center - 6} textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="28" fontWeight="700" fill={colors.primary.navy}>{activePercent}%</text>
      <text x={center} y={center + 16} textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="13" fill="#6B7280">Active</text>
    </svg>
  );
};

const LegendRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  padding: '0 20px',
  marginTop: '12px',
});

const LegendItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
});

// Recent Activity Table
const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
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

const DateRangeBtn = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
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
  gap: '10px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = { completed: '#D1FAE5', ongoing: '#F3F4F6' };
  const colorMap: Record<string, string> = { completed: '#059669', ongoing: '#6B7280' };
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

const ViewLink = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.blue,
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
});

const PaginationRow = styled(Box)({
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
export function ReportsPage() {
  useDocumentTitle('Reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // API hooks
  const { data: executiveSummary, isLoading: summaryLoading } = useGetExecutiveSummaryQuery({ period: '30' });
  const { data: shiftReport, isLoading: shiftsLoading } = useGetShiftReportQuery({});
  const { data: attendanceReport, isLoading: attendanceLoading } = useGetAttendanceReportQuery({});
  const { data: workforceReport } = useGetWorkforceReportQuery();
  const { data: clientReport } = useGetClientReportQuery({});

  // Extract KPIs from executive summary
  const kpis = executiveSummary?.kpis || [];
  const totalWorkers = kpis.find(k => k.name === 'Active Workers')?.value || workforceReport?.summary?.totalWorkers || 0;
  const totalClients = clientReport?.summary?.totalClients || 0;
  const totalRevenue = kpis.find(k => k.name === 'Gross Payroll')?.value || 0;
  const shiftsToday = shiftReport?.summary?.totalShifts || 0;

  // Trends
  const workersTrend = kpis.find(k => k.name === 'Active Workers');
  const shiftsTrend = kpis.find(k => k.name === 'Shifts Created');

  // Shift data for bar chart
  const dayBreakdown = shiftReport?.dayBreakdown || [];

  // Worker availability from workforce report
  const statusBreakdown = workforceReport?.statusBreakdown || [];
  const activeWorkers = statusBreakdown.find(s => s.status === 'ACTIVE')?.percentage || 90;

  // Recent attendance for table
  const recentActivity = attendanceReport?.statusBreakdown?.map((item, idx) => ({
    id: String(idx + 1),
    worker: 'Worker',
    clockIn: new Date().toLocaleString(),
    clockOut: item.status === 'APPROVED' ? new Date().toLocaleString() : '-',
    location: 'Organization Location',
    status: item.status === 'APPROVED' ? 'Completed' : item.status === 'PENDING' ? 'Ongoing' : item.status,
  })) || [];

  const isLoading = summaryLoading || shiftsLoading || attendanceLoading;

  return (
    <DashboardContainer>
      <HeaderSection>
        <PageTitle>Report</PageTitle>
        <PageSubtitle>Review attendance, approve hours, and resolve exceptions</PageSubtitle>
      </HeaderSection>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <GridCols4>
            <StatsCard
              title="Total Workers"
              value={totalWorkers}
              icon={<People />}
              iconBgColor="#E0F2FE"
              iconColor="#3B82F6"
              trend={{ 
                value: `${Math.abs(workersTrend?.change || 0)}%`, 
                label: 'vs last period', 
                direction: workersTrend?.trend === 'up' ? 'up' : workersTrend?.trend === 'down' ? 'down' : 'up' 
              }}
            />
            <StatsCard
              title="Total Clients"
              value={totalClients}
              icon={<Business />}
              iconBgColor="#D1FAE5"
              iconColor="#10B981"
              trend={{ value: `${clientReport?.summary?.activityRate || 0}%`, label: 'active', direction: 'up' }}
            />
            <StatsCard
              title="Total Revenue"
              value={`£${totalRevenue.toLocaleString()}`}
              icon={<AttachMoney />}
              iconBgColor="#FEF3C7"
              iconColor="#F59E0B"
              trend={{ value: 'this period', label: '', direction: 'up' }}
            />
            <StatsCard
              title="Shifts (30 days)"
              value={shiftsToday}
              icon={<CalendarToday />}
              iconBgColor="#EDE9FE"
              iconColor="#7C3AED"
              trend={{ 
                value: `${Math.abs(shiftsTrend?.change || 0)}%`, 
                label: 'vs last period', 
                direction: shiftsTrend?.trend === 'up' ? 'up' : shiftsTrend?.trend === 'down' ? 'down' : 'up' 
              }}
            />
          </GridCols4>
        </>
      )}

      <ChartsRow>
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Shifts by Day</ChartTitle>
            <DropdownButton>Last 30 days <KeyboardArrowDown sx={{ fontSize: 16 }} /></DropdownButton>
          </ChartHeader>
          <BarChartSvg data={dayBreakdown} />
        </ChartCard>

        <ChartCard>
          <ChartTitle>Workers Availability</ChartTitle>
          <DonutChartSection>
            <Box sx={{ marginTop: '16px' }}>
              <DonutSvg activePercent={activeWorkers} />
            </Box>
            <LegendRow>
              <LegendItem>
                <FiberManualRecord sx={{ fontSize: 10, color: colors.primary.blue }} /> Active
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: colors.primary.navy }}>{activeWorkers}%</span>
              </LegendItem>
            </LegendRow>
            <LegendRow>
              <LegendItem>
                <FiberManualRecord sx={{ fontSize: 10, color: '#E0F2FE' }} /> Other
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: colors.primary.navy }}>{100 - activeWorkers}%</span>
              </LegendItem>
            </LegendRow>
          </DonutChartSection>
        </ChartCard>
      </ChartsRow>

      <TableCard>
        <CardHeader><h3>Attendance Summary</h3></CardHeader>

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
            <DateRangeBtn>Date Range <KeyboardArrowDown sx={{ fontSize: 16 }} /></DateRangeBtn>
            <ExportButton>Export as CSV <FileDownload sx={{ fontSize: 18 }} /></ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                <Th>Status</Th>
                <Th>Count</Th>
                <Th>Percentage</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {attendanceReport?.statusBreakdown?.length ? (
                attendanceReport.statusBreakdown.map((item, idx) => (
                  <tr key={idx}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <WorkerCell>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: item.status === 'APPROVED' ? '#D1FAE5' : item.status === 'PENDING' ? '#FEF3C7' : '#FEE2E2', fontSize: 13, color: item.status === 'APPROVED' ? '#059669' : item.status === 'PENDING' ? '#D97706' : '#DC2626' }}>
                          {item.status.charAt(0)}
                        </Avatar>
                        {item.status}
                      </WorkerCell>
                    </Td>
                    <Td>{item.count}</Td>
                    <Td>{item.percentage}%</Td>
                    <Td><ViewLink>View Details</ViewLink></Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <Td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                    No attendance data available
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>

        {/* Attendance Stats Summary */}
        {attendanceReport && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 700, color: colors.primary.navy }}>
                {attendanceReport.summary?.totalRecords || 0}
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Total Records</Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 700, color: colors.status.success }}>
                {attendanceReport.summary?.approvalRate || 0}%
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Approval Rate</Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 700, color: colors.primary.blue }}>
                {attendanceReport.summary?.totalHoursWorked?.toFixed(1) || 0}
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Total Hours</Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 700, color: '#7C3AED' }}>
                {attendanceReport.punctuality?.punctualityRate || 0}%
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>Punctuality</Box>
            </Box>
          </Box>
        )}
      </TableCard>
    </DashboardContainer>
  );
}

export default ReportsPage;
