import { useState, useMemo } from 'react';
import {
  Assessment,
  Download,
  TrendingUp,
  People,
  AccessTime,
  AttachMoney,
  CalendarToday,
  FilterList,
  Search,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Button, Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useGetClientHoursReportQuery, useGetClientSpendReportQuery } from '../../store/slices/clientDashboardSlice';

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

const ReportCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #E5E7EB',
  marginBottom: '20px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: colors.primary.blue,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
  },
});

const ReportHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
});

const ReportTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 4px 0',
});

const ReportDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: 0,
  lineHeight: 1.5,
});

const ReportMeta = styled(Box)({
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  marginTop: '12px',
});

const MetaItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const ActionButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: '6px',
  textTransform: 'none',
});

const ChartContainer = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #E5E7EB',
  marginBottom: '20px',
});

const ChartHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

const ChartTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
});

// ============ COMPONENT ============
export function ClientReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('all');

  // Fetch real report data from API
  const { data: hoursReport, isLoading: hoursLoading } = useGetClientHoursReportQuery({ from: undefined, to: undefined });
  const { data: spendReport, isLoading: spendLoading } = useGetClientSpendReportQuery({ from: undefined, to: undefined });

  // Mock data for development
  const mockReports = [
    {
      id: '1',
      title: 'Monthly Staffing Summary',
      description: 'Comprehensive overview of staffing metrics, including worker performance, shift coverage, and costs for the selected period.',
      type: 'STAFFING',
      period: 'March 2024',
      generatedDate: '2024-03-25',
      fileSize: '2.4 MB',
      format: 'PDF',
      downloadCount: 12,
    },
    {
      id: '2',
      title: 'Worker Performance Report',
      description: 'Detailed analysis of worker performance metrics, reliability scores, and feedback ratings.',
      type: 'PERFORMANCE',
      period: 'Q1 2024',
      generatedDate: '2024-03-20',
      fileSize: '1.8 MB',
      format: 'Excel',
      downloadCount: 8,
    },
    {
      id: '3',
      title: 'Cost Analysis Report',
      description: 'Breakdown of staffing costs by department, shift type, and worker categories with trend analysis.',
      type: 'FINANCIAL',
      period: 'March 2024',
      generatedDate: '2024-03-25',
      fileSize: '1.2 MB',
      format: 'PDF',
      downloadCount: 15,
    },
    {
      id: '4',
      title: 'Compliance & Safety Report',
      description: 'Compliance status, safety incidents, and regulatory requirements fulfillment.',
      type: 'COMPLIANCE',
      period: 'March 2024',
      generatedDate: '2024-03-24',
      fileSize: '980 KB',
      format: 'PDF',
      downloadCount: 6,
    },
    {
      id: '5',
      title: 'Shift Coverage Analysis',
      description: 'Analysis of shift fill rates, unfilled positions, and coverage patterns.',
      type: 'COVERAGE',
      period: 'March 2024',
      generatedDate: '2024-03-25',
      fileSize: '1.5 MB',
      format: 'Excel',
      downloadCount: 10,
    },
  ];

  // Filter reports based on search and type
  const filteredReports = useMemo(() => {
    return mockReports.filter(report => {
      const matchesSearch = 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = reportType === 'all' || report.type === reportType;
      
      return matchesSearch && matchesType;
    });
  }, [mockReports, searchTerm, reportType]);

  // Calculate stats from API data
  const stats = useMemo(() => {
    return {
      totalReports: mockReports.length,
      totalHours: hoursReport?.totalHours ?? 0,
      totalShifts: hoursReport?.totalShifts ?? 0,
      totalSpend: spendReport?.totalSpend ?? 0,
    };
  }, [mockReports, hoursReport, spendReport]);

  const handleDownloadReport = (reportId: string) => {
    // TODO: Implement download report functionality
    console.log('Download report:', reportId);
  };

  const handleGenerateReport = (type: string) => {
    // TODO: Implement generate report functionality
    console.log('Generate report:', type);
  };

  const handleExportData = (format: string) => {
    // TODO: Implement export data functionality
    console.log('Export data as:', format);
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <Box>
          <PageTitle>Reports & Analytics</PageTitle>
          <Box sx={{ color: colors.text.secondary, fontSize: '16px', mt: 1 }}>
            Comprehensive insights into your staffing operations
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={() => handleExportData('PDF')}
        >
          Export All Data
        </Button>
      </HeaderRow>

      {/* Stats Cards */}
      <StatsContainer>
        <StatCard>
          <StatIcon color={colors.primary.blue}>
            <Assessment />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalReports}</StatValue>
            <StatLabel>Available Reports</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.status.success}>
            <AccessTime />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalHours.toFixed(1)}</StatValue>
            <StatLabel>Total Hours</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.status.warning}>
            <CalendarToday />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalShifts}</StatValue>
            <StatLabel>Total Shifts</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.primary.blue}>
            <AttachMoney />
          </StatIcon>
          <StatContent>
            <StatValue>£{stats.totalSpend.toFixed(2)}</StatValue>
            <StatLabel>Total Spend</StatLabel>
          </StatContent>
        </StatCard>
      </StatsContainer>

      {/* Filters */}
      <FilterRow>
        <SearchInput
          placeholder="Search reports by title or description..."
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
        <FormControl sx={{ minWidth: '150px' }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            label="Report Type"
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="STAFFING">Staffing</MenuItem>
            <MenuItem value="PERFORMANCE">Performance</MenuItem>
            <MenuItem value="FINANCIAL">Financial</MenuItem>
            <MenuItem value="COMPLIANCE">Compliance</MenuItem>
            <MenuItem value="COVERAGE">Coverage</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: '120px' }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={dateRange}
            label="Period"
            onChange={(e) => setDateRange(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </FilterRow>

      {/* Quick Charts */}
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Staffing Overview</ChartTitle>
          <Button variant="outlined" startIcon={<TrendingUp />}>
            View Detailed Analytics
          </Button>
        </ChartHeader>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Box sx={{ textAlign: 'center', p: '20px', bgcolor: '#F9FAFB', borderRadius: '8px' }}>
            <People sx={{ fontSize: '32px', color: colors.primary.blue, mb: '8px' }} />
            <Box sx={{ fontSize: '24px', fontWeight: 700, color: colors.primary.navy }}>{stats.totalShifts}</Box>
            <Box sx={{ fontSize: '14px', color: colors.text.secondary }}>Total Shifts</Box>
          </Box>
          <Box sx={{ textAlign: 'center', p: '20px', bgcolor: '#F9FAFB', borderRadius: '8px' }}>
            <AccessTime sx={{ fontSize: '32px', color: colors.status.success, mb: '8px' }} />
            <Box sx={{ fontSize: '24px', fontWeight: 700, color: colors.primary.navy }}>{stats.totalHours.toFixed(1)}</Box>
            <Box sx={{ fontSize: '14px', color: colors.text.secondary }}>Total Hours</Box>
          </Box>
          <Box sx={{ textAlign: 'center', p: '20px', bgcolor: '#F9FAFB', borderRadius: '8px' }}>
            <AttachMoney sx={{ fontSize: '32px', color: colors.status.warning, mb: '8px' }} />
            <Box sx={{ fontSize: '24px', fontWeight: 700, color: colors.primary.navy }}>£{stats.totalSpend.toFixed(2)}</Box>
            <Box sx={{ fontSize: '14px', color: colors.text.secondary }}>Total Spend</Box>
          </Box>
          <Box sx={{ textAlign: 'center', p: '20px', bgcolor: '#F9FAFB', borderRadius: '8px' }}>
            <TrendingUp sx={{ fontSize: '32px', color: colors.primary.blue, mb: '8px' }} />
            <Box sx={{ fontSize: '24px', fontWeight: 700, color: colors.primary.navy }}>94%</Box>
            <Box sx={{ fontSize: '14px', color: colors.text.secondary }}>Fill Rate</Box>
            <Box sx={{ fontSize: '12px', color: colors.status.success, mt: '4px' }}>+3% from last month</Box>
          </Box>
        </Box>
      </ChartContainer>

      {/* Available Reports */}
      <Box>
        <ChartHeader>
          <ChartTitle>Available Reports</ChartTitle>
          <Button variant="contained" startIcon={<Assessment />}>
            Generate Custom Report
          </Button>
        </ChartHeader>

        {filteredReports.map((report) => (
          <ReportCard key={report.id}>
            <ReportHeader>
              <Box>
                <ReportTitle>{report.title}</ReportTitle>
                <ReportDescription>{report.description}</ReportDescription>
                <ReportMeta>
                  <MetaItem>
                    <CalendarToday sx={{ fontSize: 16 }} />
                    {report.period}
                  </MetaItem>
                  <MetaItem>
                    Generated: {report.generatedDate}
                  </MetaItem>
                  <MetaItem>
                    Size: {report.fileSize}
                  </MetaItem>
                  <MetaItem>
                    Format: {report.format}
                  </MetaItem>
                  <MetaItem>
                    Downloads: {report.downloadCount}
                  </MetaItem>
                </ReportMeta>
              </Box>
              <Chip 
                label={report.type} 
                size="small"
                sx={{ 
                  backgroundColor: '#F3F4F6',
                  color: colors.text.secondary,
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  fontFamily: "'Outfit', sans-serif"
                }} 
              />
            </ReportHeader>
            <Box sx={{ display: 'flex', gap: '12px', mt: '16px' }}>
              <ActionButton
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleDownloadReport(report.id)}
              >
                Download {report.format}
              </ActionButton>
              <ActionButton
                variant="outlined"
                onClick={() => handleGenerateReport(report.type)}
              >
                Regenerate
              </ActionButton>
            </Box>
          </ReportCard>
        ))}

        {filteredReports.length === 0 && (
          <Box sx={{ textAlign: 'center', py: '40px', color: colors.text.secondary }}>
            <Assessment sx={{ fontSize: '48px', mb: '16px', opacity: 0.5 }} />
            <Box sx={{ fontSize: '18px', mb: '8px' }}>No reports found</Box>
            <Box sx={{ fontSize: '14px' }}>Try adjusting your search or filters</Box>
          </Box>
        )}
      </Box>
    </DashboardContainer>
  );
}

export default ClientReportsPage;
