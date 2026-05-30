import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Download, Print } from '@mui/icons-material';
import { Box, styled, CircularProgress } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useGetPayslipDetailQuery } from '../../store/slices/payrollSlice';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const BackButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '12px',
});

const ActionButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const PayslipCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '32px',
});

const PayslipHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid #E5E7EB',
});

const CompanyInfo = styled(Box)({
  '& h2': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    color: colors.primary.navy,
    margin: '0 0 8px',
  },
  '& p': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.text.secondary,
    margin: '4px 0',
  },
});

const PayslipTitle = styled(Box)({
  textAlign: 'right',
  '& h3': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: colors.primary.navy,
    margin: '0 0 4px',
  },
  '& p': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.text.secondary,
    margin: 0,
  },
});

const EmployeeSection = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '32px',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid #E5E7EB',
});

const InfoGroup = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text.secondary,
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    color: colors.primary.navy,
  },
});

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '24px',
});

const Th = styled('th')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '12px 16px',
  backgroundColor: '#F9FAFB',
  borderBottom: '1px solid #E5E7EB',
  textTransform: 'uppercase',
});

const Td = styled('td')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  padding: '12px 16px',
  borderBottom: '1px solid #E5E7EB',
});

const SummarySection = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '32px',
  marginTop: '32px',
});

const SummaryBox = styled(Box)({
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
});

const SummaryTitle = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: '0 0 16px',
});

const SummaryRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  '& .label': {
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

const TotalRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: '12px',
  borderTop: '1px solid #E5E7EB',
  marginTop: '8px',
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    color: colors.primary.navy,
  },
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '100px',
});

// ============ HELPERS ============
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusBadge = (status: string): { bg: string; color: string; label: string } => {
  switch (status) {
    case 'DRAFT': return { bg: '#FEF3C7', color: '#D97706', label: 'Pending' };
    case 'APPROVED': return { bg: '#DBEAFE', color: '#2563EB', label: 'Approved' };
    case 'PAID': return { bg: '#D1FAE5', color: '#059669', label: 'Paid' };
    default: return { bg: '#F3F4F6', color: '#6B7280', label: status };
  }
};

// ============ COMPONENT ============
export function PayslipDetail() {
  useDocumentTitle('Payslip Details');
  const { payslipId } = useParams<{ payslipId: string }>();
  const navigate = useNavigate();

  const { data: payslip, isLoading, error } = useGetPayslipDetailQuery(payslipId || '');

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error || !payslip) {
    return (
      <DashboardContainer>
        <HeaderRow>
          <BackButton onClick={() => navigate('/payroll')}>
            <ArrowBack sx={{ fontSize: 18 }} /> Back to Payroll
          </BackButton>
        </HeaderRow>
        <PayslipCard>
          <Box sx={{ textAlign: 'center', padding: '48px', color: colors.text.secondary }}>
            Payslip not found or an error occurred.
          </Box>
        </PayslipCard>
      </DashboardContainer>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Use browser's print functionality with PDF option
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }
    
    const periodStart = payslip.period?.startDate ? new Date(payslip.period.startDate).toLocaleDateString('en-GB') : '';
    const periodEnd = payslip.period?.endDate ? new Date(payslip.period.endDate).toLocaleDateString('en-GB') : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${payslip.employee?.name || 'Employee'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e3a5f; margin-bottom: 5px; }
          h2 { color: #1e3a5f; font-size: 18px; margin: 20px 0 10px; border-bottom: 2px solid #1e3a5f; padding-bottom: 5px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company { }
          .company h1 { font-size: 24px; }
          .company p { margin: 2px 0; color: #666; font-size: 12px; }
          .payslip-title { text-align: right; }
          .payslip-title h3 { font-size: 20px; color: #1e3a5f; margin: 0; }
          .payslip-title p { margin: 2px 0; color: #666; font-size: 12px; }
          .employee-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .info-group { margin-bottom: 8px; }
          .info-group .label { font-size: 11px; color: #666; text-transform: uppercase; }
          .info-group .value { font-size: 14px; font-weight: 600; color: #1e3a5f; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1e3a5f; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          .amount { text-align: right; }
          .deduction { color: #dc2626; }
          .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .summary-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .summary-box h3 { font-size: 14px; color: #1e3a5f; margin: 0 0 10px; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
          .summary-row.total { border-top: 2px solid #1e3a5f; margin-top: 10px; padding-top: 10px; font-weight: bold; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .status.DRAFT { background: #fef3c7; color: #d97706; }
          .status.APPROVED { background: #dbeafe; color: #2563eb; }
          .status.PAID { background: #d1fae5; color: #059669; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">
            <h1>StaffSync</h1>
            <p>Workforce Management Solutions</p>
            <p>123 Business Park, London, UK</p>
          </div>
          <div class="payslip-title">
            <h3>PAYSLIP</h3>
            <p>${periodStart} - ${periodEnd}</p>
            <p>Period ${payslip.period?.number || '-'}</p>
            <span class="status ${payslip.status}">${payslip.status}</span>
          </div>
        </div>
        
        <div class="employee-section">
          <div>
            <div class="info-group"><div class="label">Employee Name</div><div class="value">${payslip.employee?.name || 'N/A'}</div></div>
            <div class="info-group"><div class="label">Email</div><div class="value">${payslip.employee?.email || 'N/A'}</div></div>
            <div class="info-group"><div class="label">Employee Code</div><div class="value">${payslip.employee?.empCode || 'N/A'}</div></div>
            <div class="info-group"><div class="label">Payroll Number</div><div class="value">${payslip.employee?.payrollNumber || 'N/A'}</div></div>
          </div>
          <div>
            <div class="info-group"><div class="label">Tax Code</div><div class="value">${payslip.employee?.taxCode || '1257L'}</div></div>
            <div class="info-group"><div class="label">NI Number</div><div class="value">${payslip.employee?.niNumber || 'N/A'}</div></div>
            <div class="info-group"><div class="label">NI Category</div><div class="value">${payslip.employee?.niCode || 'A'}</div></div>
            <div class="info-group"><div class="label">Pay Method</div><div class="value">${payslip.period?.payMethod || 'BACS'}</div></div>
          </div>
        </div>
        
        <h2>Payments</h2>
        <table>
          <thead><tr><th>Description</th><th class="amount">Hours</th><th class="amount">Rate</th><th class="amount">Amount</th></tr></thead>
          <tbody>
            ${payslip.payments.map(p => `<tr><td>Standard Pay</td><td class="amount">${p.time.toFixed(2)}</td><td class="amount">${formatCurrency(p.rate)}</td><td class="amount">${formatCurrency(p.amount)}</td></tr>`).join('')}
            ${payslip.benefits.map(b => `<tr><td>${b.name}</td><td class="amount">-</td><td class="amount">-</td><td class="amount">${formatCurrency(b.amount)}</td></tr>`).join('')}
          </tbody>
        </table>
        
        <h2>Deductions</h2>
        <table>
          <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
          <tbody>
            ${payslip.deductions.map(d => `<tr><td>${d.name}</td><td class="amount deduction">-${formatCurrency(d.amount)}</td></tr>`).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-box">
            <h3>This Period</h3>
            <div class="summary-row"><span>Basic Pay</span><span>${formatCurrency(payslip.summary.basicPay)}</span></div>
            <div class="summary-row"><span>Gross Pay</span><span>${formatCurrency(payslip.summary.grossPay)}</span></div>
            <div class="summary-row"><span>Deductions</span><span class="deduction">-${formatCurrency(payslip.summary.deductions)}</span></div>
            <div class="summary-row total"><span>Net Pay</span><span>${formatCurrency(payslip.summary.netPay)}</span></div>
          </div>
          <div class="summary-box">
            <h3>Year to Date</h3>
            <div class="summary-row"><span>Gross Pay</span><span>${formatCurrency(payslip.yearToDate.grossPay)}</span></div>
            <div class="summary-row"><span>Taxable Pay</span><span>${formatCurrency(payslip.yearToDate.taxablePay)}</span></div>
            <div class="summary-row"><span>Tax Paid</span><span>${formatCurrency(payslip.yearToDate.tax)}</span></div>
            <div class="summary-row"><span>Employee NI</span><span>${formatCurrency(payslip.yearToDate.employeeNI)}</span></div>
            <div class="summary-row"><span>Employee Pension</span><span>${formatCurrency(payslip.yearToDate.employeePension)}</span></div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <BackButton onClick={() => navigate('/payroll')}>
          <ArrowBack sx={{ fontSize: 18 }} /> Back to Payroll
        </BackButton>
        <ActionButtons>
          <ActionButton onClick={handlePrint} style={{ backgroundColor: '#6B7280' }}>
            <Print sx={{ fontSize: 18 }} /> Print
          </ActionButton>
          <ActionButton onClick={handleDownloadPDF}>
            <Download sx={{ fontSize: 18 }} /> Download PDF
          </ActionButton>
        </ActionButtons>
      </HeaderRow>

      <PayslipCard>
        <PayslipHeader>
          <CompanyInfo>
            <h2>StaffSync</h2>
            <p>Workforce Management Solutions</p>
            <p>123 Business Park, London, UK</p>
          </CompanyInfo>
          <PayslipTitle>
            <h3>PAYSLIP</h3>
            <p>{formatDate(payslip.period?.startDate)} - {formatDate(payslip.period?.endDate)}</p>
            <p>Period {payslip.period?.number || '-'}</p>
            <Box sx={{ 
              display: 'inline-block', 
              mt: 1, 
              px: 2, 
              py: 0.5, 
              borderRadius: '12px',
              backgroundColor: getStatusBadge(payslip.status).bg,
              color: getStatusBadge(payslip.status).color,
              fontSize: '12px',
              fontWeight: 600
            }}>
              {getStatusBadge(payslip.status).label}
            </Box>
          </PayslipTitle>
        </PayslipHeader>

        <EmployeeSection>
          <Box>
            <InfoGroup>
              <div className="label">Employee Name</div>
              <div className="value">{payslip.employee?.name || 'N/A'}</div>
            </InfoGroup>
            <Box sx={{ mt: 2 }}>
              <InfoGroup>
                <div className="label">Email</div>
                <div className="value">{payslip.employee?.email || 'N/A'}</div>
              </InfoGroup>
            </Box>
            <Box sx={{ mt: 2 }}>
              <InfoGroup>
                <div className="label">Employee Code</div>
                <div className="value">{payslip.employee?.empCode || 'N/A'}</div>
              </InfoGroup>
            </Box>
            <Box sx={{ mt: 2 }}>
              <InfoGroup>
                <div className="label">Payroll Number</div>
                <div className="value">{payslip.employee?.payrollNumber || 'N/A'}</div>
              </InfoGroup>
            </Box>
          </Box>
          <Box>
            <InfoGroup>
              <div className="label">Tax Code</div>
              <div className="value">{payslip.employee?.taxCode || '1257L'}</div>
            </InfoGroup>
            <Box sx={{ mt: 2 }}>
              <InfoGroup>
                <div className="label">NI Number</div>
                <div className="value">{payslip.employee?.niNumber || 'Not provided'}</div>
              </InfoGroup>
            </Box>
            <Box sx={{ mt: 2 }}>
              <InfoGroup>
                <div className="label">NI Category</div>
                <div className="value">{payslip.employee?.niCode || 'A'}</div>
              </InfoGroup>
            </Box>
            <Box sx={{ mt: 2 }}>
              <InfoGroup>
                <div className="label">Pay Method</div>
                <div className="value">{payslip.period?.payMethod || 'BACS'}</div>
              </InfoGroup>
            </Box>
          </Box>
        </EmployeeSection>

        {/* Payments Table */}
        <Table>
          <thead>
            <tr>
              <Th>Description</Th>
              <Th style={{ textAlign: 'right' }}>Hours</Th>
              <Th style={{ textAlign: 'right' }}>Rate</Th>
              <Th style={{ textAlign: 'right' }}>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {payslip.payments.map((p, idx) => (
              <tr key={idx}>
                <Td>Standard Pay</Td>
                <Td style={{ textAlign: 'right' }}>{p.time.toFixed(2)}</Td>
                <Td style={{ textAlign: 'right' }}>{formatCurrency(p.rate)}</Td>
                <Td style={{ textAlign: 'right' }}>{formatCurrency(p.amount)}</Td>
              </tr>
            ))}
            {payslip.benefits.map((b, idx) => (
              <tr key={`benefit-${idx}`}>
                <Td>{b.name}</Td>
                <Td style={{ textAlign: 'right' }}>-</Td>
                <Td style={{ textAlign: 'right' }}>-</Td>
                <Td style={{ textAlign: 'right' }}>{formatCurrency(b.amount)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Deductions Table */}
        {payslip.deductions.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Deductions</Th>
                <Th style={{ textAlign: 'right' }}>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {payslip.deductions.map((d, idx) => (
                <tr key={idx}>
                  <Td>{d.name}</Td>
                  <Td style={{ textAlign: 'right', color: colors.status.error }}>
                    -{formatCurrency(d.amount)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <SummarySection>
          {/* This Period Summary */}
          <SummaryBox>
            <SummaryTitle>This Period</SummaryTitle>
            <SummaryRow>
              <span className="label">Basic Pay</span>
              <span className="value">{formatCurrency(payslip.summary.basicPay)}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label">Gross Pay</span>
              <span className="value">{formatCurrency(payslip.summary.grossPay)}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label">Deductions</span>
              <span className="value" style={{ color: colors.status.error }}>
                -{formatCurrency(payslip.summary.deductions)}
              </span>
            </SummaryRow>
            <TotalRow>
              <span className="label">Net Pay</span>
              <span className="value">{formatCurrency(payslip.summary.netPay)}</span>
            </TotalRow>
          </SummaryBox>

          {/* Year to Date Summary */}
          <SummaryBox>
            <SummaryTitle>Year to Date</SummaryTitle>
            <SummaryRow>
              <span className="label">Gross Pay</span>
              <span className="value">{formatCurrency(payslip.yearToDate.grossPay)}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label">Taxable Pay</span>
              <span className="value">{formatCurrency(payslip.yearToDate.taxablePay)}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label">Tax Paid</span>
              <span className="value">{formatCurrency(payslip.yearToDate.tax)}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label">Employee NI</span>
              <span className="value">{formatCurrency(payslip.yearToDate.employeeNI)}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label">Employee Pension</span>
              <span className="value">{formatCurrency(payslip.yearToDate.employeePension)}</span>
            </SummaryRow>
          </SummaryBox>
        </SummarySection>
      </PayslipCard>
    </DashboardContainer>
  );
}

export default PayslipDetail;
