import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetClientInvoicesQuery,
} from '../../store/slices/clientDashboardSlice';
import type { ClientInvoice } from '../../store/slices/clientDashboardSlice';
import {
  Receipt,
  Search,
  FilterList,
  Download,
  Visibility,
  AttachMoney,
  CalendarToday,
  Description,
  TrendingUp,
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

const InvoiceTable = styled('table')({
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
  ...(status === 'PAID' && {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  }),
  ...(status === 'PENDING' && {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  }),
  ...(status === 'OVERDUE' && {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  }),
  ...(status === 'DRAFT' && {
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
export function ClientInvoicesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch invoices from backend
  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError } = useGetClientInvoicesQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Filter invoices based on search, status, and tab
  const filteredInvoices = useMemo(() => {
    if (!invoicesData) return [];
    
    let filtered = invoicesData.filter((invoice: ClientInvoice) => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.periodStart && new Date(invoice.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Filter by tab
    if (activeTab === 0) { // All invoices
      return filtered;
    } else if (activeTab === 1) { // Pending payment
      return filtered.filter(i => i.status === 'PENDING');
    } else if (activeTab === 2) { // Paid
      return filtered.filter(i => i.status === 'PAID');
    } else if (activeTab === 3) { // Overdue
      return filtered.filter(i => i.status === 'OVERDUE');
    }

    return filtered;
  }, [invoicesData, searchTerm, statusFilter, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!invoicesData) return { total: 0, pending: 0, paid: 0, overdue: 0, totalAmount: 0, pendingAmount: 0, overdueAmount: 0 };
    
    const total = invoicesData.length;
    const pending = invoicesData.filter(i => i.status === 'PENDING').length;
    const paid = invoicesData.filter(i => i.status === 'PAID').length;
    const overdue = invoicesData.filter(i => i.status === 'OVERDUE').length;
    const totalAmount = invoicesData.reduce((acc, i) => acc + Number(i.total || 0), 0);
    const pendingAmount = invoicesData.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + Number(i.total || 0), 0);
    const overdueAmount = invoicesData.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + Number(i.total || 0), 0);

    return {
      total,
      pending,
      paid,
      overdue,
      totalAmount,
      pendingAmount,
      overdueAmount,
    };
  }, [invoicesData]);

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement download invoice functionality
    console.log('Download invoice:', invoiceId);
  };

  const handlePayInvoice = (invoiceId: string) => {
    // TODO: Implement pay invoice functionality
    console.log('Pay invoice:', invoiceId);
  };

  // Helper to format period from dates
  const formatPeriod = (invoice: ClientInvoice) => {
    if (invoice.periodStart && invoice.periodEnd) {
      const start = new Date(invoice.periodStart);
      const end = new Date(invoice.periodEnd);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (invoice.periodStart) {
      return new Date(invoice.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <Box>
          <PageTitle>Billing & Invoices</PageTitle>
          <Box sx={{ color: colors.text.secondary, fontSize: '16px', mt: 1 }}>
            View and manage your billing invoices
          </Box>
        </Box>
      </HeaderRow>

      {/* Stats Cards */}
      <StatsContainer>
        <StatCard>
          <StatIcon color={colors.status.warning}>
            <Receipt />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Payment</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.status.success}>
            <TrendingUp />
          </StatIcon>
          <StatContent>
            <StatValue>£{stats.pendingAmount.toLocaleString()}</StatValue>
            <StatLabel>Amount Due</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.status.error}>
            <CalendarToday />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.overdue}</StatValue>
            <StatLabel>Overdue</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={colors.primary.blue}>
            <AttachMoney />
          </StatIcon>
          <StatContent>
            <StatValue>£{stats.totalAmount.toLocaleString()}</StatValue>
            <StatLabel>Total Billed</StatLabel>
          </StatContent>
        </StatCard>
      </StatsContainer>

      {/* Filters */}
      <FilterRow>
        <SearchInput
          placeholder="Search invoices by number, period, or description..."
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
          onClick={() => setStatusFilter(statusFilter === 'all' ? 'PENDING' : statusFilter === 'PENDING' ? 'PAID' : statusFilter === 'PAID' ? 'OVERDUE' : 'all')}
        >
          {statusFilter === 'all' ? 'All Status' : statusFilter}
        </Button>
      </FilterRow>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: '24px' }}>
        <Tab label="All Invoices" />
        <Tab label="Pending Payment" />
        <Tab label="Paid" />
        <Tab label="Overdue" />
      </Tabs>

      {/* Loading State */}
      {invoicesLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: '40px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {invoicesError && !invoicesLoading && (
        <Box sx={{ textAlign: 'center', py: '40px', color: colors.text.secondary }}>
          <Receipt sx={{ fontSize: '48px', mb: '16px', opacity: 0.5 }} />
          <Box sx={{ fontSize: '18px', mb: '8px' }}>Error loading invoices</Box>
          <Box sx={{ fontSize: '14px' }}>Please try again later</Box>
        </Box>
      )}

      {/* Invoices Table */}
      {!invoicesLoading && !invoicesError && (
        <InvoiceTable>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Period</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice: ClientInvoice) => (
              <tr key={invoice.id}>
                <td>
                  <Box>
                    <Box sx={{ fontWeight: 600, color: colors.primary.navy }}>{invoice.invoiceNumber}</Box>
                    <Box sx={{ fontSize: '12px', color: colors.text.secondary, mt: '2px' }}>
                      Created {new Date(invoice.createdAt).toLocaleDateString()}
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box sx={{ fontWeight: 500 }}>{formatPeriod(invoice)}</Box>
                  <Box sx={{ fontSize: '12px', color: colors.text.secondary, mt: '2px' }}>
                    Staffing services
                  </Box>
                </td>
                <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>
                  <Box sx={{ fontWeight: 500 }}>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}</Box>
                  {invoice.status === 'OVERDUE' && invoice.dueDate && (
                    <Box sx={{ fontSize: '12px', color: colors.status.error, mt: '2px' }}>
                      Overdue by {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </Box>
                  )}
                </td>
                <td>
                  <Box sx={{ fontWeight: 600, color: colors.status.success }}>
                    £{Number(invoice.total || 0).toLocaleString()}
                  </Box>
                </td>
                <td>
                  <StatusChip label={invoice.status.replace('_', ' ')} status={invoice.status} />
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: '8px' }}>
                    <ActionButton
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      View
                    </ActionButton>
                    <ActionButton
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      PDF
                    </ActionButton>
                    {invoice.status === 'PENDING' && (
                      <ActionButton
                        variant="contained"
                        color="success"
                        onClick={() => handlePayInvoice(invoice.id)}
                      >
                        Pay Now
                      </ActionButton>
                    )}
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </InvoiceTable>
      )}

      {!invoicesLoading && !invoicesError && filteredInvoices.length === 0 && (
        <Box sx={{ textAlign: 'center', py: '40px', color: colors.text.secondary }}>
          <Receipt sx={{ fontSize: '48px', mb: '16px', opacity: 0.5 }} />
          <Box sx={{ fontSize: '18px', mb: '8px' }}>No invoices found</Box>
          <Box sx={{ fontSize: '14px' }}>Try adjusting your search or filters</Box>
        </Box>
      )}
    </DashboardContainer>
  );
}

export default ClientInvoicesPage;
