/**
 * Payslip History Component
 * 
 * Displays historical payslip records for a worker
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  History,
  Download,
  Visibility,
  CalendarToday,
  AccountBalanceWallet,
  TrendingDown,
} from '@mui/icons-material';
import type { PayslipRecord } from '../../types/payslip.types';

interface PayslipHistoryProps {
  workerId: string;
  limit?: number;
  onView?: (payslip: PayslipRecord) => void;
  onDownload?: (payslip: PayslipRecord) => void;
}

export const PayslipHistory: React.FC<PayslipHistoryProps> = ({
  workerId,
  limit = 12,
  onView,
  onDownload,
}) => {
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayslipHistory();
  }, [workerId, limit]);

  const fetchPayslipHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual API
      const mockPayslips: PayslipRecord[] = [
        {
          id: '1',
          workerId,
          organizationId: 'org-1',
          payPeriod: '2024-04',
          annualGross: 30000,
          monthlyGross: 2500,
          incomeTax: 290.50,
          nationalInsurance: 116.20,
          employeePension: 99.00,
          studentLoan: 20.29,
          totalDeductions: 525.99,
          netPay: 1974.01,
          employerNI: 245.60,
          employerPension: 59.40,
          pensionOptedOut: false,
          effectiveTaxRate: 21.04,
          taxCode: '1257L',
          studentLoanPlan: 'PLAN2',
          pensionEmployeeRate: 0.05,
          pensionEmployerRate: 0.03,
          blindPersonsAllowance: false,
          marriageAllowance: false,
          payDate: '2024-04-30T00:00:00Z',
          createdAt: '2024-04-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z',
        },
        {
          id: '2',
          workerId,
          organizationId: 'org-1',
          payPeriod: '2024-03',
          annualGross: 30000,
          monthlyGross: 2500,
          incomeTax: 290.50,
          nationalInsurance: 116.20,
          employeePension: 99.00,
          studentLoan: 20.29,
          totalDeductions: 525.99,
          netPay: 1974.01,
          employerNI: 245.60,
          employerPension: 59.40,
          pensionOptedOut: false,
          effectiveTaxRate: 21.04,
          taxCode: '1257L',
          studentLoanPlan: 'PLAN2',
          pensionEmployeeRate: 0.05,
          pensionEmployerRate: 0.03,
          blindPersonsAllowance: false,
          marriageAllowance: false,
          payDate: '2024-03-31T00:00:00Z',
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z',
        },
      ];

      setPayslips(mockPayslips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payslip history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatPayPeriod = (payPeriod: string) => {
    const [year, month] = payPeriod.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  const handleViewDetails = (payslip: PayslipRecord) => {
    setSelectedPayslip(payslip);
    setDetailDialogOpen(true);
    onView?.(payslip);
  };

  const handleDownload = (payslip: PayslipRecord) => {
    onDownload?.(payslip);
  };

  const getStatusChip = (payslip: PayslipRecord) => {
    const daysSincePayDate = Math.floor(
      (new Date().getTime() - new Date(payslip.payDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePayDate <= 7) {
      return <Chip label="Recent" color="success" size="small" />;
    } else if (daysSincePayDate <= 30) {
      return <Chip label="This Month" color="primary" size="small" />;
    } else {
      return <Chip label="Archive" color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <History sx={{ mr: 2 }} />
        <Typography variant="h5">Payslip History</Typography>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pay Period</TableCell>
                  <TableCell align="right">Gross Pay</TableCell>
                  <TableCell align="right">Net Pay</TableCell>
                  <TableCell align="right">Deductions</TableCell>
                  <TableCell align="right">Tax Rate</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">
                            {formatPayPeriod(payslip.payPeriod)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Paid: {new Date(payslip.payDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(payslip.monthlyGross)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {formatCurrency(payslip.netPay)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error">
                        {formatCurrency(payslip.totalDeductions)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {payslip.effectiveTaxRate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(payslip)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(payslip)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(payslip)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {payslips.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="textSecondary">
                No payslip records found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payslip Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWallet sx={{ mr: 2 }} />
            Payslip Details - {selectedPayslip && formatPayPeriod(selectedPayslip.payPeriod)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPayslip && (
            <Box>
              {/* Summary */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(selectedPayslip.netPay)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Net Monthly Pay
                </Typography>
                <Chip
                  label={`${selectedPayslip.effectiveTaxRate}% effective tax rate`}
                  size="small"
                  color="secondary"
                  sx={{ mt: 1 }}
                />
              </Box>

              {/* Detailed Breakdown */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Monthly Gross
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(selectedPayslip.monthlyGross)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Income Tax
                </Typography>
                <Typography variant="body1" color="error">
                  -{formatCurrency(selectedPayslip.incomeTax)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  National Insurance
                </Typography>
                <Typography variant="body1" color="error">
                  -{formatCurrency(selectedPayslip.nationalInsurance)}
                </Typography>
              </Box>

              {!selectedPayslip.pensionOptedOut && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Employee Pension
                  </Typography>
                  <Typography variant="body1" color="error">
                    -{formatCurrency(selectedPayslip.employeePension)}
                  </Typography>
                </Box>
              )}

              {selectedPayslip.studentLoan > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Student Loan
                  </Typography>
                  <Typography variant="body1" color="error">
                    -{formatCurrency(selectedPayslip.studentLoan)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  <TrendingDown sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Total Deductions
                </Typography>
                <Typography variant="h6" color="error">
                  -{formatCurrency(selectedPayslip.totalDeductions)}
                </Typography>
              </Box>

              {/* Employer Costs */}
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Employer Costs
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Employer NI
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(selectedPayslip.employerNI)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Employer Pension
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(selectedPayslip.employerPension)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Cost to Employer
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(
                      selectedPayslip.monthlyGross + selectedPayslip.employerNI + selectedPayslip.employerPension
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Settings */}
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Settings Applied
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={`Tax Code: ${selectedPayslip.taxCode}`} size="small" />
                  <Chip label={`Student Loan: ${selectedPayslip.studentLoanPlan}`} size="small" />
                  {selectedPayslip.pensionOptedOut && (
                    <Chip label="Pension Opted Out" size="small" color="warning" />
                  )}
                  {selectedPayslip.blindPersonsAllowance && (
                    <Chip label="Blind Person's Allowance" size="small" />
                  )}
                  {selectedPayslip.marriageAllowance && (
                    <Chip label="Marriage Allowance" size="small" />
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedPayslip && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleDownload(selectedPayslip)}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
