import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Add,
  MoreVert,
  AccountBalanceWallet,
  AccountBalance,
  Receipt,
  RemoveCircle,
  PendingActions,
  Close,
  CheckCircle,
  Refresh,
  Warning,
} from '@mui/icons-material';
import {
  Box,
  styled,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Menu as MuiMenu,
  Avatar,
  Modal,
  CircularProgress,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useGetPayslipListQuery,
  useBulkApprovePayslipsMutation,
  useApprovePayslipMutation,
  useMarkPayslipPaidMutation,
  useGeneratePayslipsMutation,
  type PayslipListItem,
} from '../../store/slices/payrollSlice';
import {
  useGetPaymentSheetSummaryQuery,
} from '../../store/slices/bankAccountSlice';
import { BANK_ACCOUNT } from '../../utilities/endpoint';
import { API_BASE_URL, PAYSLIPS } from '../../services/endpoints';
import { PayslipManager } from '../../components/payslip/PayslipManager';
import { Button, Typography, Tabs, Tab } from '@mui/material';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
});

const TitleSection = styled(Box)({});

const PageTitle = styled('h1')({
  fontFamily: "Outfit, sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PageSubtitle = styled('p')({
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const ApproveAllButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  marginTop: '24px',
});

const CardHeader = styled(Box)({
  padding: '20px 24px',
  borderBottom: '1px solid #E5E7EB',
  '& h3': {
    fontFamily: "Outfit, sans-serif",
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
    fontFamily: "Outfit, sans-serif",
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
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const DropdownButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "Outfit, sans-serif",
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
  backgroundColor: colors.primary.navy,
  fontFamily: "Outfit, sans-serif",
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
  fontFamily: "Outfit, sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '1px solid #E5E7EB',
});

const Td = styled('td')({
  fontFamily: "Outfit, sans-serif",
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
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  cursor: 'pointer',
  textDecoration: 'none',
  '&:hover': {
    color: '#3B82F6',
    textDecoration: 'underline',
  },
});

const StatusBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = {
    processing: '#FEF3C7',
    paid: '#D1FAE5',
    pending: '#FEF3C7',
  };
  const colorMap: Record<string, string> = {
    processing: '#D97706',
    paid: '#059669',
    pending: '#D97706',
  };
  return {
    padding: '4px 12px',
    borderRadius: '16px',
    fontFamily: "Outfit, sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: bgMap[status.toLowerCase()] ?? '#F3F4F6',
    color: colorMap[status.toLowerCase()] ?? '#6B7280',
  };
});

const ActionMenuItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'danger',
})<{ danger?: boolean }>(({ danger }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  color: danger ? colors.status.error : colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '& svg': { fontSize: '18px' },
}));

const Pagination = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '24px',
  padding: '16px 24px',
});

const PaginationText = styled('span')({
  fontFamily: "Outfit, sans-serif",
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
  fontFamily: "Outfit, sans-serif",
  fontSize: '13px',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

// Modal Styles
const ModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '32px',
  width: '520px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const ModalTitle = styled('h2')({
  fontFamily: "Outfit, sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px',
  textAlign: 'center',
});

const ModalSubtitle = styled('p')({
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
  lineHeight: 1.6,
});

const SummaryRow = styled(Box)({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  overflow: 'hidden',
});

const SummaryItem = styled(Box)({
  flex: 1,
  padding: '16px',
  borderRight: '1px solid #E5E7EB',
  '&:last-child': { borderRight: 'none' },
  '& .label': {
    fontFamily: "Outfit, sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '4px',
  },
  '& .value': {
    fontFamily: "Outfit, sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: colors.primary.navy,
  },
  '& .value-red': {
    fontFamily: "Outfit, sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: colors.status.error,
  },
});

const ApproveButton = styled('button')({
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const SuccessIcon = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': {
    fontSize: '48px',
    color: colors.status.success,
  },
});

const DoneButton = styled('button')({
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "Outfit, sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

// ============ HELPERS ============
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'DRAFT': return 'Pending';
    case 'APPROVED': return 'Processing';
    case 'PAID': return 'Paid';
    default: return status;
  }
};

// ============ COMPONENT ============
export function PayrollPage() {
  useDocumentTitle('Payroll');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'DRAFT' | 'APPROVED' | 'PAID' | ''>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipListItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [approveOpen, setApproveOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [payslipManagerOpen, setPayslipManagerOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; skipped: number; errors: string[] } | null>(null);
  const [importPeriodType, setImportPeriodType] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [payPeriodFilter, setPayPeriodFilter] = useState('');

  // API Hooks
  const { data: payslipData, isLoading, refetch } = useGetPayslipListQuery({
    page: currentPage,
    limit: rowsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(payPeriodFilter && { payPeriodStart: payPeriodFilter }),
  });
  const [bulkApprove, { isLoading: bulkApproving }] = useBulkApprovePayslipsMutation();
  const [approvePayslip] = useApprovePayslipMutation();
  const [markPaid] = useMarkPayslipPaidMutation();
  const [generatePayslips, { isLoading: generating }] = useGeneratePayslipsMutation();
  const { data: paymentSheetSummary } = useGetPaymentSheetSummaryQuery();

  const payslips = payslipData?.payslips ?? [];
  const pagination = payslipData?.pagination ?? { page: 1, limit: 8, total: 0, totalPages: 1 };
  const counts = payslipData?.counts ?? { draft: 0, approved: 0, paid: 0 };

  // Calculate stats
  const stats = useMemo(() => {
    const totalGross = payslips.reduce((sum, p) => sum + p.grossPay, 0);
    const totalNet = payslips.reduce((sum, p) => sum + p.netPay, 0);
    const totalDeductions = totalGross - totalNet;
    const outstanding = payslips.filter(p => p.status === 'DRAFT').reduce((sum, p) => sum + p.netPay, 0);
    return { totalGross, totalNet, totalDeductions, outstanding };
  }, [payslips]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payslip: PayslipListItem) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPayslip(payslip);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPayslip(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(payslips.filter(p => p.status === 'DRAFT').map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleApprovePayment = async () => {
    if (selectedIds.length === 0) return;
    try {
      const draftPayslips = payslips.filter(p => selectedIds.includes(p.id) && p.status === 'DRAFT');
      const amount = draftPayslips.reduce((sum, p) => sum + p.netPay, 0);
      await bulkApprove(selectedIds).unwrap();
      setApprovedAmount(amount);
      setApproveOpen(false);
      setSuccessOpen(true);
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to approve payslips:', error);
    }
  };

  const handleApproveSingle = async () => {
    if (!selectedPayslip) return;
    try {
      await approvePayslip(selectedPayslip.id).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to approve payslip:', error);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedPayslip) return;
    try {
      await markPaid(selectedPayslip.id).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to mark payslip as paid:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      await generatePayslips({}).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to generate payslips:', error);
    }
  };

  const handleDownloadPaymentSheet = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(BANK_ACCOUNT.PAYMENT_SHEET, {
        headers: { Authorization: `Bearer ${token}`, 'X-API-Key': import.meta.env.VITE_API_KEY || '' },
      });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'payment-sheet.csv';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setPaymentSheetOpen(false);
    } catch (error) {
      console.error('Failed to download payment sheet:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportTemplate = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = `${API_BASE_URL}${PAYSLIPS.EXPORT_TEMPLATE}`;
      console.log('Fetching template from:', url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'X-API-Key': import.meta.env.VITE_API_KEY || '' },
      });
      console.log('Response status:', response.status, response.statusText);
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`Failed to download template (${response.status}): ${text}`);
      }
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const disposition = response.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'payslip-template.xlsx';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      console.log('Download triggered for:', filename);
    } catch (error) {
      console.error('Failed to download template:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('periodType', importPeriodType);

      const response = await fetch(`${API_BASE_URL}${PAYSLIPS.BULK_IMPORT}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'X-API-Key': import.meta.env.VITE_API_KEY || '' },
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? 'Import failed');
      setImportResult(json.data);
      setImportFile(null);
      refetch();
    } catch (error) {
      console.error('Failed to import:', error);
      setImportResult({ created: 0, updated: 0, skipped: 0, errors: [error instanceof Error ? error.message : 'Import failed'] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Payroll</PageTitle>
          <PageSubtitle>Access your payment records and financial statements</PageSubtitle>
        </TitleSection>
        <Box sx={{ display: 'flex', gap: '12px' }}>
          <ApproveAllButton onClick={() => setPaymentSheetOpen(true)} style={{ backgroundColor: '#3B82F6' }}>
            <AccountBalance sx={{ fontSize: 18 }} />
            Payment Sheet
          </ApproveAllButton>
          <ApproveAllButton onClick={handleGenerate} disabled={generating} style={{ backgroundColor: '#10B981' }}>
            {generating ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Refresh sx={{ fontSize: 18 }} />}
            Generate Payslips
          </ApproveAllButton>
          <ApproveAllButton 
            onClick={() => {
              // Select all draft payslips for approval
              const draftIds = payslips.filter(p => p.status === 'DRAFT').map(p => p.id);
              setSelectedIds(draftIds);
              setApproveOpen(true);
            }} 
            disabled={counts.draft === 0}
          >
            <Add sx={{ fontSize: 18 }} />
            Approve all outstanding ({counts.draft})
          </ApproveAllButton>
        </Box>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Gross Pay"
          value={isLoading ? '-' : formatCurrency(stats.totalGross)}
          icon={<AccountBalanceWallet />}
          iconBgColor="#E0F2FE"
          iconColor="#3B82F6"
          trend={{ value: `${counts.paid}`, label: 'paid', direction: 'up' }}
        />
        <StatsCard
          title="Total Net Pay"
          value={isLoading ? '-' : formatCurrency(stats.totalNet)}
          icon={<Receipt />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ value: `${counts.approved}`, label: 'processing', direction: 'up' }}
        />
        <StatsCard
          title="Total Deductions"
          value={isLoading ? '-' : formatCurrency(stats.totalDeductions)}
          icon={<RemoveCircle />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
          trend={{ value: '0%', label: 'this period', direction: 'down' }}
        />
        <StatsCard
          title="Outstanding Payroll"
          value={isLoading ? '-' : formatCurrency(stats.outstanding)}
          icon={<PendingActions />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ value: `${counts.draft}`, label: 'pending', direction: 'up' }}
        />
      </GridCols4>

      {/* Payslip Management Section */}
      <TableCard sx={{ mt: 3 }}>
        <CardHeader>
          <h3>Payslip Management</h3>
        </CardHeader>
        
        <Box sx={{ px: 3, pt: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Bulk" />
            <Tab label="Individual" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export a pre-filled Excel template with all workers, fill in payslip data, then import to create/update payslip records.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExportTemplate}
                  disabled={downloading}
                  sx={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {downloading ? 'Downloading...' : 'Download Template'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontFamily: "Outfit, sans-serif", minWidth: '100px' }}>
                  Period Type:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150, fontFamily: "Outfit, sans-serif" }}>
                  <InputLabel>Pay Period</InputLabel>
                  <Select
                    value={importPeriodType}
                    label="Pay Period"
                    onChange={(e) => setImportPeriodType(e.target.value as 'WEEKLY' | 'MONTHLY')}
                  >
                    <MenuItem value="MONTHLY">Monthly (1-12)</MenuItem>
                    <MenuItem value="WEEKLY">Weekly (Tax Week 1-52)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Outfit, sans-serif" }}>
                  {importPeriodType === 'WEEKLY' ? 'Enter Tax Week (1-52) in Excel' : 'Enter Month (1-12) in Excel'}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 3,
                  border: '2px dashed #E5E7EB',
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#3B82F6', bgcolor: '#F9FAFB' },
                }}
                onClick={() => document.getElementById('excel-upload-input')?.click()}
              >
                <input
                  id="excel-upload-input"
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImportFile(file);
                  }}
                />
                {importFile ? (
                  <Box>
                    <Typography variant="body1" sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 500 }}>
                      {importFile.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {(importFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" color="textSecondary" sx={{ fontFamily: "Outfit, sans-serif" }}>
                      Click or drag to upload filled Excel file
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      .xlsx or .xls files only, max 5MB
                    </Typography>
                  </Box>
                )}
              </Box>

              {importFile && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleBulkImport}
                    disabled={importing}
                    sx={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {importing ? <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : null}
                    Import Payslips
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setImportFile(null);
                      setImportResult(null);
                    }}
                    sx={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {importResult && (
                <Box sx={{ mt: 3, p: 2, bgcolor: importResult.errors.length > 0 ? '#FEF3C7' : '#D1FAE5', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, mb: 1 }}>
                    Import Results:
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Outfit, sans-serif" }}>
                    Created: {importResult.created} | Updated: {importResult.updated} | Skipped: {importResult.skipped}
                  </Typography>
                  {importResult.errors.length > 0 && (
                    <Box sx={{ mt: 1, maxHeight: 120, overflowY: 'auto' }}>
                      {importResult.errors.map((err, i) => (
                        <Typography key={i} variant="caption" color="error" sx={{ fontFamily: "Outfit, sans-serif", display: 'block' }}>
                          {err}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click on any worker's name in the payment history table below to open their payslip management tools in a modal.
              </Typography>
              <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed #E5E7EB', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Select a worker from the payment history table
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click on a worker's name in the table to access their payslip management tools
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </TableCard>

      <TableCard>
        <CardHeader><h3>Payment History</h3></CardHeader>

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
            <FilterButton>
              <FilterList sx={{ fontSize: 18 }} />
              Filter
            </FilterButton>
          </FilterLeft>
          <FilterRight>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              displayEmpty
              size="small"
              sx={{ fontFamily: "Outfit, sans-serif", fontSize: '13px', minWidth: 120 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="DRAFT">Pending</MenuItem>
              <MenuItem value="APPROVED">Processing</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
            </Select>
            <TextField
              type="date"
              size="small"
              value={payPeriodFilter}
              onChange={(e) => { setPayPeriodFilter(e.target.value); setCurrentPage(1); }}
              InputLabelProps={{ shrink: true }}
              placeholder="Filter by pay period start"
              sx={{ fontFamily: "Outfit, sans-serif", fontSize: '13px', width: 160 }}
            />
            <ExportButton onClick={handleExportTemplate} disabled={downloading}>
              {downloading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <FileDownload sx={{ fontSize: 18 }} />}
              Export as XLS
            </ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}>
                  <Checkbox 
                    size="small" 
                    checked={selectedIds.length > 0 && selectedIds.length === payslips.filter(p => p.status === 'DRAFT').length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </Th>
                <Th>Worker</Th>
                <Th>Pay Period</Th>
                <Th>Hours</Th>
                <Th>Gross Pay</Th>
                <Th>Deductions</Th>
                <Th>Net Pay</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <Td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <CircularProgress size={24} />
                  </Td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <Td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                    No payslips found. Click "Generate Payslips" to create payslips for the current period.
                  </Td>
                </tr>
              ) : (
                <>
                  {payslips.map((row) => (
                    <tr key={row.id}>
                      <Td>
                        <Checkbox 
                          size="small" 
                          checked={selectedIds.includes(row.id)}
                          onChange={(e) => handleSelectOne(row.id, e.target.checked)}
                          disabled={row.status !== 'DRAFT'}
                        />
                      </Td>
                      <Td>
                        <WorkerCell onClick={() => {
                          setSelectedWorkerId(row.worker.id);
                          setPayslipManagerOpen(true); // Open modal
                        }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#E5E7EB', fontSize: 13 }}>
                            {row.worker.fullName.charAt(0)}
                          </Avatar>
                          {row.worker.fullName}
                        </WorkerCell>
                      </Td>
                      <Td>{formatDate(row.periodStart)} - {formatDate(row.periodEnd)}</Td>
                      <Td>{row.totalHours.toFixed(1)}h</Td>
                      <Td>{formatCurrency(row.grossPay)}</Td>
                      <Td>{formatCurrency(row.grossPay - row.netPay)}</Td>
                      <Td>{formatCurrency(row.netPay)}</Td>
                      <Td>
                        <StatusBadge status={getStatusLabel(row.status)}>{getStatusLabel(row.status)}</StatusBadge>
                      </Td>
                      <Td>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVert sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </Table>
        </Box>

        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '160px' },
          }}
        >
          {selectedPayslip?.status === 'DRAFT' && (
            <ActionMenuItem onClick={handleApproveSingle}>
              <CheckCircle /> Approve
            </ActionMenuItem>
          )}
          {selectedPayslip?.status === 'APPROVED' && (
            <ActionMenuItem onClick={handleMarkPaid}>
              <Receipt /> Mark as Paid
            </ActionMenuItem>
          )}
          <ActionMenuItem onClick={() => { 
            if (selectedPayslip) {
              navigate(`/payroll/${selectedPayslip.id}`);
            }
            handleMenuClose(); 
          }}>
            <Receipt /> View Details
          </ActionMenuItem>
        </MuiMenu>

        <Pagination>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              size="small"
              sx={{ fontFamily: "Outfit, sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>Showing {payslips.length} out of {pagination.total} items</PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>
              {currentPage}
            </PageButton>
            <PageButton 
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>

      {/* Approve Outstanding Payroll Modal */}
      <Modal open={approveOpen} onClose={() => setApproveOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setApproveOpen(false)}><Close /></ModalClose>
            <ModalTitle>Approve outstanding payroll</ModalTitle>
            <ModalSubtitle>
              Do you want to approve the outstanding payroll? Once approved, payment will be processed and cannot be reversed.
            </ModalSubtitle>
            <SummaryRow>
              <SummaryItem>
                <div className="label">Total Net Pay</div>
                <div className="value">{formatCurrency(payslips.filter(p => p.status === 'DRAFT').reduce((sum, p) => sum + p.netPay, 0))}</div>
              </SummaryItem>
              <SummaryItem>
                <div className="label">Deductions</div>
                <div className="value-red">{formatCurrency(payslips.filter(p => p.status === 'DRAFT').reduce((sum, p) => sum + (p.grossPay - p.netPay), 0))}</div>
              </SummaryItem>
              <SummaryItem>
                <div className="label">Total Workers</div>
                <div className="value">{counts.draft}</div>
              </SummaryItem>
            </SummaryRow>
            <ApproveButton onClick={handleApprovePayment} disabled={bulkApproving || counts.draft === 0}>
              {bulkApproving ? <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : null}
              Approve Payment
            </ApproveButton>
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Payroll Approved Successfully Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setSuccessOpen(false)}><Close /></ModalClose>
            <SuccessIcon><CheckCircle /></SuccessIcon>
            <ModalTitle>Payroll approved successfully</ModalTitle>
            <ModalSubtitle>
              A total of <strong>{formatCurrency(approvedAmount)}</strong> has been approved and payment has been sent successfully to respective workers account.
            </ModalSubtitle>
            <DoneButton onClick={() => setSuccessOpen(false)}>Done</DoneButton>
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Payment Sheet Modal */}
      <Modal open={paymentSheetOpen} onClose={() => setPaymentSheetOpen(false)}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={() => setPaymentSheetOpen(false)}><Close /></ModalClose>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <AccountBalance sx={{ fontSize: 48, color: '#3B82F6' }} />
            </Box>
            <ModalTitle>Download Payment Sheet</ModalTitle>
            <ModalSubtitle>
              Generate a CSV payment sheet for bank BACS transfer with all approved payslips and worker bank details.
            </ModalSubtitle>

            {paymentSheetSummary ? (
              <Box>
                <SummaryRow>
                  <SummaryItem>
                    <div className="label">Workers</div>
                    <div className="value">{paymentSheetSummary.workerCount}</div>
                  </SummaryItem>
                  <SummaryItem>
                    <div className="label">Total Net Pay</div>
                    <div className="value">{formatCurrency(paymentSheetSummary.totalNetPay)}</div>
                  </SummaryItem>
                  <SummaryItem>
                    <div className="label">Period</div>
                    <div className="value" style={{ fontSize: '14px' }}>
                      {formatDate(paymentSheetSummary.payPeriod.startDate)} - {formatDate(paymentSheetSummary.payPeriod.endDate)}
                    </div>
                  </SummaryItem>
                </SummaryRow>

                {paymentSheetSummary.missingBankDetails > 0 && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF3C7',
                    marginBottom: '16px',
                  }}>
                    <Warning sx={{ fontSize: 20, color: '#D97706' }} />
                    <Box sx={{ fontFamily: "Outfit, sans-serif", fontSize: '13px', color: '#92400E' }}>
                      <strong>{paymentSheetSummary.missingBankDetails}</strong> worker(s) are missing bank account details. They will be flagged in the payment sheet.
                    </Box>
                  </Box>
                )}

                <ApproveButton onClick={handleDownloadPaymentSheet} disabled={downloading}>
                  {downloading ? <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : <FileDownload sx={{ fontSize: 18, mr: 1 }} />}
                  Download Payment Sheet (CSV)
                </ApproveButton>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2, fontFamily: "Outfit, sans-serif", fontSize: '14px', color: colors.text.secondary }}>
                No approved payslips found. Generate and approve payslips first.
              </Box>
            )}
          </ModalCard>
        </ModalOverlay>
      </Modal>

      {/* Payslip Manager Modal */}
      <Modal open={payslipManagerOpen} onClose={() => setPayslipManagerOpen(false)}>
        <ModalOverlay onClick={() => setPayslipManagerOpen(false)}>
          <ModalCard 
            sx={{ width: '85vw', maxWidth: '1000px', maxHeight: '85vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalClose onClick={() => setPayslipManagerOpen(false)}>
              <Close />
            </ModalClose>
            <ModalTitle>
              <AccountBalanceWallet sx={{ mr: 2, verticalAlign: 'middle' }} />
              Payslip Management
              {selectedWorkerId && (
                <Typography variant="body2" sx={{ mt: 1, color: colors.text.secondary }}>
                  {payslips.find(p => p.worker.id === selectedWorkerId)?.worker.fullName}
                </Typography>
              )}
            </ModalTitle>
            <ModalSubtitle>
              Manage individual worker payslips, calculate custom payslips, or upload PDF payslips.
            </ModalSubtitle>
            
            {selectedWorkerId ? (
              <PayslipManager 
                workerId={selectedWorkerId} 
                workerName={payslips.find(p => p.worker.id === selectedWorkerId)?.worker.fullName}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No worker selected
                </Typography>
              </Box>
            )}
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default PayrollPage;
