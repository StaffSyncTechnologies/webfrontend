import { useState } from 'react';
import {
  Receipt,
  AccessTime,
  People,
  AttachMoney,
  ChevronRight,
  ExpandMore,
  Download,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import {
  Box,
  styled,
  CircularProgress,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import api from '../../services/api';

// ============ TYPES ============
interface WeekData {
  weekNumber: number;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalShifts: number;
  totalWorkers: number;
  totalAmount: number;
  status: 'UNINVOICED' | 'INVOICED' | 'PARTIAL';
  invoiceId?: string;
}

interface WeeklyTimesheetResponse {
  weeks: WeekData[];
  summary: {
    totalHours: number;
    totalAmount: number;
    uninvoicedWeeks: number;
  };
}

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
});

const TitleSection = styled(Box)({});

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

const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  overflow: 'hidden',
  marginTop: '24px',
});

const CardHeader = styled(Box)({
  padding: '20px 24px',
  borderBottom: '1px solid #E5E7EB',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '& h3': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: colors.text.primary,
    margin: 0,
  },
});

const WeekRow = styled(Box)<{ expanded?: boolean }>(({ expanded }) => ({
  display: 'grid',
  gridTemplateColumns: '40px 1fr 120px 100px 100px 140px 140px 100px',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid #F3F4F6',
  backgroundColor: expanded ? '#F9FAFB' : 'transparent',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#F9FAFB',
  },
}));

const WeekRowHeader = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '40px 1fr 120px 100px 100px 140px 140px 100px',
  alignItems: 'center',
  padding: '12px 24px',
  backgroundColor: '#F9FAFB',
  borderBottom: '1px solid #E5E7EB',
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
});

const WeekLabel = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.text.primary,
});

const WeekDates = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const StatValue = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.text.primary,
});

const StatusBadge = styled('span')<{ status: string }>(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 12px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  backgroundColor: status === 'INVOICED' ? '#D1FAE5' : status === 'UNINVOICED' ? '#FEF3C7' : '#E5E7EB',
  color: status === 'INVOICED' ? '#059669' : status === 'UNINVOICED' ? '#D97706' : '#6B7280',
}));

const GenerateButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  textTransform: 'none',
  padding: '6px 16px',
  borderRadius: '6px',
});

const ExpandedContent = styled(Box)({
  padding: '16px 24px 24px 64px',
  backgroundColor: '#FAFAFA',
  borderBottom: '1px solid #E5E7EB',
});

const DetailGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  marginBottom: '16px',
});

const DetailCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid #E5E7EB',
});

const DetailLabel = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
  display: 'block',
  marginBottom: '4px',
});

const DetailValue = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.text.primary,
});

// ============ HELPERS ============
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
};

// ============ COMPONENT ============
export function ClientTimesheetPage() {
  useDocumentTitle('Client Timesheet');
  const queryClient = useQueryClient();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch weekly timesheet data
  const { data, isLoading } = useQuery({
    queryKey: ['client-timesheet-weekly'],
    queryFn: async () => {
      const response = await api.get<{ data: WeeklyTimesheetResponse }>('/client/timesheets/weekly?weeks=8');
      return response.data.data;
    },
  });

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (week: WeekData) => {
      const response = await api.post('/client/invoices/generate', {
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-timesheet-weekly'] });
      setGenerateDialogOpen(false);
      setSelectedWeek(null);
      setToast({ open: true, message: 'Invoice generated successfully', severity: 'success' });
    },
    onError: (error: any) => {
      setToast({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to generate invoice', 
        severity: 'error' 
      });
    },
  });

  const handleGenerateClick = (week: WeekData) => {
    setSelectedWeek(week);
    setGenerateDialogOpen(true);
  };

  const handleConfirmGenerate = () => {
    if (selectedWeek) {
      generateInvoiceMutation.mutate(selectedWeek);
    }
  };

  const toggleExpand = (weekNumber: number) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
  };

  const weeks = data?.weeks ?? [];
  const summary = data?.summary;

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Client Timesheet</PageTitle>
          <PageSubtitle>View weekly hours and generate invoices</PageSubtitle>
        </TitleSection>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Hours"
          value={isLoading ? 0 : (summary?.totalHours ?? 0)}
          icon={<AccessTime />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
        />
        <StatsCard
          title="Total Amount"
          value={isLoading ? '£0' : formatCurrency(summary?.totalAmount ?? 0)}
          icon={<AttachMoney />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
        />
        <StatsCard
          title="Uninvoiced Weeks"
          value={isLoading ? 0 : (summary?.uninvoicedWeeks ?? 0)}
          icon={<Schedule />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
        />
        <StatsCard
          title="Weeks Shown"
          value={weeks.length}
          icon={<Receipt />}
          iconBgColor="#E5E7EB"
          iconColor="#6B7280"
        />
      </GridCols4>

      <TableCard>
        <CardHeader>
          <h3>Weekly Breakdown</h3>
        </CardHeader>

        <WeekRowHeader>
          <span></span>
          <span>Period</span>
          <span>Hours</span>
          <span>Shifts</span>
          <span>Workers</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </WeekRowHeader>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress size={32} />
          </Box>
        ) : weeks.length === 0 ? (
          <Box textAlign="center" py={4} color={colors.text.secondary}>
            No timesheet data available
          </Box>
        ) : (
          weeks.map((week) => (
            <Box key={week.weekNumber}>
              <WeekRow expanded={expandedWeek === week.weekNumber} onClick={() => toggleExpand(week.weekNumber)}>
                <IconButton size="small">
                  {expandedWeek === week.weekNumber ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
                <Box>
                  <WeekLabel>{week.weekLabel}</WeekLabel>
                  <WeekDates>
                    {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                  </WeekDates>
                </Box>
                <StatValue>{week.totalHours} hrs</StatValue>
                <StatValue>{week.totalShifts}</StatValue>
                <StatValue>{week.totalWorkers}</StatValue>
                <StatValue>{formatCurrency(week.totalAmount)}</StatValue>
                <StatusBadge status={week.status}>
                  {week.status === 'INVOICED' && <CheckCircle sx={{ fontSize: 14 }} />}
                  {week.status}
                </StatusBadge>
                <Box onClick={(e) => e.stopPropagation()}>
                  {week.status === 'UNINVOICED' && week.totalShifts > 0 ? (
                    <GenerateButton
                      variant="contained"
                      size="small"
                      onClick={() => handleGenerateClick(week)}
                      sx={{ bgcolor: colors.primary.navy }}
                    >
                      Generate Invoice
                    </GenerateButton>
                  ) : week.invoiceId ? (
                    <IconButton size="small" title="Download Invoice">
                      <Download />
                    </IconButton>
                  ) : (
                    <span style={{ color: colors.text.secondary, fontSize: '12px' }}>-</span>
                  )}
                </Box>
              </WeekRow>

              <Collapse in={expandedWeek === week.weekNumber}>
                <ExpandedContent>
                  <DetailGrid>
                    <DetailCard>
                      <DetailLabel>Total Hours</DetailLabel>
                      <DetailValue>{week.totalHours} hrs</DetailValue>
                    </DetailCard>
                    <DetailCard>
                      <DetailLabel>Total Shifts</DetailLabel>
                      <DetailValue>{week.totalShifts}</DetailValue>
                    </DetailCard>
                    <DetailCard>
                      <DetailLabel>Unique Workers</DetailLabel>
                      <DetailValue>{week.totalWorkers}</DetailValue>
                    </DetailCard>
                    <DetailCard>
                      <DetailLabel>Billable Amount</DetailLabel>
                      <DetailValue>{formatCurrency(week.totalAmount)}</DetailValue>
                    </DetailCard>
                  </DetailGrid>
                  <Box display="flex" gap={2}>
                    {week.status === 'INVOICED' && week.invoiceId && (
                      <Button variant="outlined" size="small" startIcon={<Download />}>
                        Download Invoice
                      </Button>
                    )}
                  </Box>
                </ExpandedContent>
              </Collapse>
            </Box>
          ))
        )}
      </TableCard>

      {/* Generate Invoice Confirmation Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          {selectedWeek && (
            <Box>
              <p>Generate invoice for <strong>{selectedWeek.weekLabel}</strong>?</p>
              <p>
                Period: {formatDate(selectedWeek.weekStart)} - {formatDate(selectedWeek.weekEnd)}
              </p>
              <Box mt={2} p={2} bgcolor="#F9FAFB" borderRadius={1}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span>Hours:</span>
                  <strong>{selectedWeek.totalHours} hrs</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(selectedWeek.totalAmount)}</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <span>VAT (20%):</span>
                  <strong>{formatCurrency(selectedWeek.totalAmount * 0.2)}</strong>
                </Box>
                <Box display="flex" justifyContent="space-between" borderTop="1px solid #E5E7EB" pt={1}>
                  <span>Total:</span>
                  <strong>{formatCurrency(selectedWeek.totalAmount * 1.2)}</strong>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmGenerate}
            disabled={generateInvoiceMutation.isPending}
            sx={{ bgcolor: colors.primary.navy }}
          >
            {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
}

export default ClientTimesheetPage;
