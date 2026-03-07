import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Schedule,
  Cancel,
  VerifiedUser,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  MoreVert,
  CalendarMonth,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Checkbox, IconButton, Select, MenuItem } from '@mui/material';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { useGetRoleDashboardQuery } from '../../store/slices/dashboardSlice';
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

const ComplianceSection = styled(Box)({
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

const RiskBadge = styled('span')<{ level: 'low' | 'medium' | 'high' }>(({ level }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: level === 'low' ? '#D1FAE5' : level === 'medium' ? '#FEF3C7' : '#FEE2E2',
  color: level === 'low' ? '#059669' : level === 'medium' ? '#D97706' : '#DC2626',
}));

const StatusBadge = styled('span')<{ status: 'verified' | 'pending' | 'expired' }>(({ status }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: status === 'verified' ? '#D1FAE5' : status === 'pending' ? '#FEF3C7' : '#FEE2E2',
  color: status === 'verified' ? '#059669' : status === 'pending' ? '#D97706' : '#DC2626',
}));

const Pagination = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
  padding: '12px 0',
});

const PaginationInfo = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
});

const PaginationControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

// ============ HELPERS ============
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getRiskLevel = (rtwStatus: string): 'low' | 'medium' | 'high' => {
  if (rtwStatus === 'EXPIRED' || rtwStatus === 'REQUIRES_REVIEW') return 'high';
  if (rtwStatus === 'PENDING') return 'medium';
  return 'low';
};

const getStatusFromRtw = (rtwStatus: string): 'verified' | 'pending' | 'expired' => {
  if (rtwStatus === 'VERIFIED' || rtwStatus === 'COMPLIANT') return 'verified';
  if (rtwStatus === 'EXPIRED') return 'expired';
  return 'pending';
};

export function ComplianceOfficerDashboard() {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from API
  const { data: roleDashboard, isLoading: roleLoading } = useGetRoleDashboardQuery();
  const { data: subscriptionData } = useGetSubscriptionSummaryQuery();

  // Process stats
  const stats = useMemo(() => {
    const roleStats = (roleDashboard as any)?.stats || {};
    const totalWorkers = (roleStats.pendingRtw || 0) + (roleStats.expiringSoon || 0) + (roleStats.pendingDocuments || 0);
    const complianceRate = totalWorkers > 0 ? Math.round(((totalWorkers - roleStats.pendingRtw) / totalWorkers) * 100) : 100;
    return {
      rtwVerified: totalWorkers - (roleStats.pendingRtw || 0) - (roleStats.expiringSoon || 0),
      rtwPending: roleStats.pendingRtw || 0,
      rtwExpired: roleStats.expiringSoon || 0,
      complianceRate,
    };
  }, [roleDashboard]);

  // Process compliance issues for table
  const complianceWorkers = useMemo(() => {
    const issues = (roleDashboard as any)?.complianceIssues || [];
    return issues.map((w: any) => ({
      id: w.id?.slice(0, 10) || 'WK-000000',
      name: w.fullName || 'Unknown',
      avatar: '',
      riskLevel: getRiskLevel(w.workerProfile?.rtwStatus),
      lastCheck: formatDate(w.workerProfile?.rtwExpiresAt),
      rtwCode: w.id?.slice(0, 8)?.toUpperCase() || 'N/A',
      validDate: formatDate(w.workerProfile?.rtwExpiresAt),
      status: getStatusFromRtw(w.workerProfile?.rtwStatus),
    }));
  }, [roleDashboard]);

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
          title="RTW Verified"
          value={roleLoading ? '-' : stats.rtwVerified}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="RTW Pending"
          value={roleLoading ? '-' : stats.rtwPending}
          icon={<Schedule />}
          iconBgColor="#FEF3C7"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="RTW Expired"
          value={roleLoading ? '-' : stats.rtwExpired}
          icon={<Cancel />}
          iconBgColor="#FEE2E2"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Compliance Rate"
          value={roleLoading ? '-' : `${stats.complianceRate}%`}
          icon={<VerifiedUser />}
          iconBgColor="#E0F2FE"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
      </GridCols4>

      {/* Compliance Risk Overview */}
      <ComplianceSection>
        <SectionTitle>Compliance Risk Overview</SectionTitle>

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
            <ExportButton>
              <FileDownload sx={{ fontSize: 18 }} /> Export as CSV
            </ExportButton>
          </Box>
        </SearchFilterRow>

        <Table>
          <thead>
            <tr>
              <Th><Checkbox size="small" /></Th>
              <Th>Worker</Th>
              <Th>Risk Level</Th>
              <Th>Last Check</Th>
              <Th>RTW code</Th>
              <Th>Valid Date</Th>
              <Th>RTW Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {roleLoading ? (
              <tr><Td colSpan={8} style={{ textAlign: 'center' }}>Loading...</Td></tr>
            ) : complianceWorkers.length === 0 ? (
              <tr><Td colSpan={8} style={{ textAlign: 'center' }}>No compliance issues found</Td></tr>
            ) : (
              complianceWorkers.map((worker: any, index: number) => (
                <tr key={index}>
                  <Td><Checkbox size="small" /></Td>
                  <Td>
                    <WorkerCell>
                      <Avatar style={{ backgroundImage: worker.avatar ? `url(${worker.avatar})` : undefined }} />
                      <Box>
                        <div style={{ fontWeight: 500 }}>{worker.name}</div>
                        <div style={{ fontSize: '12px', color: colors.text.secondary }}>#{worker.id}</div>
                      </Box>
                    </WorkerCell>
                  </Td>
                  <Td>
                    <RiskBadge level={worker.riskLevel}>
                      {worker.riskLevel.charAt(0).toUpperCase() + worker.riskLevel.slice(1)}
                    </RiskBadge>
                  </Td>
                  <Td>{worker.lastCheck}</Td>
                  <Td>{worker.rtwCode}</Td>
                  <Td>{worker.validDate}</Td>
                  <Td>
                    <StatusBadge status={worker.status}>
                      {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <IconButton size="small" onClick={() => navigate(`/workers/${worker.id}`)}>
                      <MoreVert />
                    </IconButton>
                  </Td>
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
              sx={{ 
                minWidth: 60, 
                fontFamily: "'Outfit', sans-serif",
                '& .MuiSelect-select': { padding: '4px 8px' }
              }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationInfo>Showing {complianceWorkers.length} items</PaginationInfo>
          <PaginationControls>
            <IconButton size="small" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
              <KeyboardArrowDown sx={{ transform: 'rotate(90deg)' }} />
            </IconButton>
            <Box sx={{ 
              width: 28, 
              height: 28, 
              borderRadius: '4px', 
              backgroundColor: colors.primary.navy, 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
            }}>
              {currentPage}
            </Box>
            <IconButton size="small" onClick={() => setCurrentPage(p => p + 1)}>
              <KeyboardArrowDown sx={{ transform: 'rotate(-90deg)' }} />
            </IconButton>
          </PaginationControls>
        </Pagination>
      </ComplianceSection>
    </DashboardContainer>
  );
}

export default ComplianceOfficerDashboard;
