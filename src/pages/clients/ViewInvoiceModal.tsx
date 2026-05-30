import { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  styled,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close, Download, Print, Send } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../utilities/colors';
import api from '../../services/api';

// ============ STYLED COMPONENTS ============
const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  borderBottom: '1px solid #E5E7EB',
  padding: '16px 24px',
});

const StyledDialogContent = styled(DialogContent)({
  padding: '0 !important',
  backgroundColor: '#F3F4F6',
});

const InvoiceContainer = styled(Box)({
  backgroundColor: 'white',
  margin: '24px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  overflow: 'hidden',
});

const InvoiceHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '32px',
  borderBottom: '1px solid #E5E7EB',
});

const CompanyInfo = styled(Box)({
  '& h1': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    color: colors.primary.navy,
    margin: 0,
  },
  '& p': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: colors.text.secondary,
    margin: '4px 0 0',
  },
});

const InvoiceInfo = styled(Box)({
  textAlign: 'right',
  '& h2': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    color: colors.primary.navy,
    margin: 0,
  },
  '& .invoice-number': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.text.secondary,
    marginTop: '8px',
  },
});

const BillTo = styled(Box)({
  padding: '24px 32px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '32px',
  borderBottom: '1px solid #E5E7EB',
});

const BillSection = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.primary.navy,
    fontWeight: 500,
  },
  '& .subvalue': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: colors.text.secondary,
    marginTop: '4px',
  },
});

const InvoiceDetails = styled(Box)({
  padding: '24px 32px',
  display: 'flex',
  gap: '32px',
  borderBottom: '1px solid #E5E7EB',
  backgroundColor: '#F9FAFB',
});

const DetailItem = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.primary.navy,
    fontWeight: 600,
  },
});

const LineItemsTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  '& th': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  '& td': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.primary.navy,
    padding: '12px 16px',
    borderBottom: '1px solid #E5E7EB',
  },
  '& .amount': {
    textAlign: 'right',
    fontWeight: 600,
  },
});

const TotalsSection = styled(Box)({
  padding: '24px 32px',
  display: 'flex',
  justifyContent: 'flex-end',
});

const TotalsTable = styled(Box)({
  width: '280px',
});

const TotalRow = styled(Box)<{ highlight?: boolean }>(({ highlight }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  fontFamily: "'Outfit', sans-serif",
  fontSize: highlight ? '16px' : '14px',
  fontWeight: highlight ? 700 : 400,
  color: highlight ? colors.primary.navy : colors.text.secondary,
  borderTop: highlight ? '2px solid #E5E7EB' : 'none',
  marginTop: highlight ? '8px' : 0,
  paddingTop: highlight ? '16px' : '8px',
}));

const StatusBadge = styled(Box)<{ status: string }>(({ status }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  backgroundColor:
    status === 'PAID' ? '#D1FAE5' :
    status === 'SENT' ? '#DBEAFE' :
    status === 'OVERDUE' ? '#FFE4E6' :
    '#FEF3C7',
  color:
    status === 'PAID' ? '#059669' :
    status === 'SENT' ? '#2563EB' :
    status === 'OVERDUE' ? '#DC2626' :
    '#D97706',
}));

const StyledDialogActions = styled(DialogActions)({
  padding: '16px 24px',
  borderTop: '1px solid #E5E7EB',
  gap: '12px',
  justifyContent: 'space-between',
});

const ActionButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  gap: '8px',
});

// ============ TYPES ============
interface ViewInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: string;
  dueDate: string;
  createdAt: string;
  clientCompany: {
    id: string;
    name: string;
    contactName?: string;
    contactEmail?: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
  organization: {
    name: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    hours: number;
    chargeRate: number;
    amount: number;
  }>;
}

// ============ HELPERS ============
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return '£0.00';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(amount));
};

// ============ COMPONENT ============
export function ViewInvoiceModal({ open, onClose, invoiceId }: ViewInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { data: invoice, isLoading } = useQuery<InvoiceData>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await api.get(`/clients/invoices/${invoiceId}`);
      return response.data.data;
    },
    enabled: !!invoiceId && open,
  });

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            h1 { font-size: 24px; color: #1e3a5f; }
            h2 { font-size: 28px; color: #1e3a5f; }
            .header { display: flex; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
            .bill-to { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
            .section-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
            .details { display: flex; gap: 32px; padding: 16px 0; background: #f9fafb; margin-bottom: 24px; padding: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .amount { text-align: right; }
            .totals { display: flex; justify-content: flex-end; }
            .totals-table { width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.highlight { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 16px; font-weight: bold; font-size: 18px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceId) return;
    
    try {
      const response = await api.get(`/clients/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice?.invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback to print if PDF endpoint not available
      handlePrint();
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        Invoice Preview
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : invoice ? (
          <InvoiceContainer ref={invoiceRef}>
            <InvoiceHeader>
              <CompanyInfo>
                <h1>{invoice.organization?.name || 'StaffSync Agency'}</h1>
                <p>123 Business Street</p>
                <p>London, UK EC1A 1BB</p>
                <p>VAT: GB123456789</p>
              </CompanyInfo>
              <InvoiceInfo>
                <h2>INVOICE</h2>
                <div className="invoice-number">{invoice.invoiceNumber}</div>
                <Box mt={1}>
                  <StatusBadge status={invoice.status}>{invoice.status}</StatusBadge>
                </Box>
              </InvoiceInfo>
            </InvoiceHeader>

            <BillTo>
              <BillSection>
                <div className="label">Bill To</div>
                <div className="value">{invoice.clientCompany?.name}</div>
                {invoice.clientCompany?.contactName && (
                  <div className="subvalue">{invoice.clientCompany.contactName}</div>
                )}
                {invoice.clientCompany?.address && (
                  <div className="subvalue">{invoice.clientCompany.address}</div>
                )}
                {(invoice.clientCompany?.city || invoice.clientCompany?.postcode) && (
                  <div className="subvalue">
                    {invoice.clientCompany.city} {invoice.clientCompany.postcode}
                  </div>
                )}
              </BillSection>
              <BillSection>
                <div className="label">From</div>
                <div className="value">{invoice.organization?.name || 'StaffSync Agency'}</div>
                <div className="subvalue">123 Business Street</div>
                <div className="subvalue">London, UK EC1A 1BB</div>
              </BillSection>
            </BillTo>

            <InvoiceDetails>
              <DetailItem>
                <div className="label">Invoice Date</div>
                <div className="value">{formatDate(invoice.createdAt)}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Due Date</div>
                <div className="value">{formatDate(invoice.dueDate)}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Period</div>
                <div className="value">
                  {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                </div>
              </DetailItem>
            </InvoiceDetails>

            <Box sx={{ padding: '0 16px' }}>
              <LineItemsTable>
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Description</th>
                    <th>Hours</th>
                    <th>Rate</th>
                    <th className="amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{Number(item.hours).toFixed(2)}</td>
                      <td>{formatCurrency(item.chargeRate)}/hr</td>
                      <td className="amount">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </LineItemsTable>
            </Box>

            <TotalsSection>
              <TotalsTable>
                <TotalRow>
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </TotalRow>
                <TotalRow>
                  <span>VAT ({invoice.vatRate}%)</span>
                  <span>{formatCurrency(invoice.vatAmount)}</span>
                </TotalRow>
                <TotalRow highlight>
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </TotalRow>
              </TotalsTable>
            </TotalsSection>

            <Box sx={{ padding: '24px 32px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>
                <strong>Payment Terms:</strong> Payment due within 30 days of invoice date.
                <br />
                <strong>Bank Details:</strong> Sort Code: 12-34-56 | Account: 12345678
              </Box>
            </Box>
          </InvoiceContainer>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" py={8} color={colors.text.secondary}>
            Invoice not found
          </Box>
        )}
      </StyledDialogContent>

      <StyledDialogActions>
        <Box>
          <ActionButton variant="outlined" onClick={onClose} sx={{ color: colors.text.secondary, borderColor: '#E5E7EB' }}>
            Close
          </ActionButton>
        </Box>
        <Box display="flex" gap={1}>
          <ActionButton
            variant="outlined"
            onClick={handlePrint}
            disabled={!invoice}
            sx={{ borderColor: colors.primary.navy, color: colors.primary.navy }}
          >
            <Print fontSize="small" /> Print
          </ActionButton>
          <ActionButton
            variant="contained"
            onClick={handleDownloadPDF}
            disabled={!invoice}
            sx={{ backgroundColor: colors.primary.navy, '&:hover': { backgroundColor: '#1a365d' } }}
          >
            <Download fontSize="small" /> Download PDF
          </ActionButton>
        </Box>
      </StyledDialogActions>
    </StyledDialog>
  );
}

export default ViewInvoiceModal;
