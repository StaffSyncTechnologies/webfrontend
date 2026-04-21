/**
 * Payslip History Component
 * 
 * Displays historical payslip records for a worker
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  History,
  Download,
  Visibility,
  CalendarToday,
} from '@mui/icons-material';
import { API_BASE_URL, PAYSLIPS } from '../../services/endpoints';

interface ApiPayslip {
  id: string;
  worker: { id: string; fullName: string; email: string };
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  grossPay: number;
  netPay: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  fileUrl: string | null;
  source: string;
}

interface PayslipHistoryProps {
  workerId: string;
  limit?: number;
  refreshKey?: number;
  onView?: (payslip: ApiPayslip) => void;
  onDownload?: (payslip: ApiPayslip) => void;
}

export const PayslipHistory: React.FC<PayslipHistoryProps> = ({
  workerId,
  limit = 12,
  refreshKey = 0,
  onView,
  onDownload,
}) => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState<ApiPayslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [periodNumber, setPeriodNumber] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const fetchPayslipHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken') ?? sessionStorage.getItem('authToken');
      
      const params = new URLSearchParams({
        workerId,
        limit: String(limit),
        page: '1',
        periodType,
        periodNumber: String(periodNumber),
        year: String(year),
      });
      
      const res = await fetch(`${API_BASE_URL}${PAYSLIPS.ADMIN_LIST}?${params}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-API-Key': import.meta.env.VITE_API_KEY || '',
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `Failed to load payslips (${res.status})`);
      setPayslips((json.data?.payslips ?? []) as ApiPayslip[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payslip history');
    } finally {
      setLoading(false);
    }
  }, [workerId, limit, periodType, periodNumber, year]);

  useEffect(() => {
    fetchPayslipHistory();
  }, [fetchPayslipHistory, refreshKey]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatPeriod = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${s} – ${e}`;
  };

  const handleViewDetails = (payslip: ApiPayslip) => {
    navigate(`/payroll/${payslip.id}`);
    onView?.(payslip);
  };

  const handleDownload = (payslip: ApiPayslip) => {
    if (payslip.fileUrl) {
      window.open(payslip.fileUrl, '_blank');
    } else {
      window.open(`${API_BASE_URL}${PAYSLIPS.DETAIL(payslip.id)}/html`, '_blank');
    }
    onDownload?.(payslip);
  };

  const getStatusChip = (status: ApiPayslip['status']) => {
    if (status === 'PAID') return <Chip label="Paid" color="success" size="small" sx={{ fontFamily: "'Outfit', sans-serif" }} />;
    if (status === 'APPROVED') return <Chip label="Approved" color="primary" size="small" sx={{ fontFamily: "'Outfit', sans-serif" }} />;
    return <Chip label="Draft" color="default" size="small" sx={{ fontFamily: "'Outfit', sans-serif" }} />;
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
    <Box sx={{ fontFamily: "'Outfit', sans-serif" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <History sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          Payslip History
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Period Type</InputLabel>
          <Select
            value={periodType}
            label="Period Type"
            onChange={(e) => setPeriodType(e.target.value as 'WEEKLY' | 'MONTHLY')}
          >
            <MenuItem value="MONTHLY">Monthly (1-12)</MenuItem>
            <MenuItem value="WEEKLY">Weekly (Tax Week 1-52)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>
            {periodType === 'WEEKLY' ? 'Tax Week' : 'Month'}
          </InputLabel>
          <Select
            value={periodNumber}
            label={periodType === 'WEEKLY' ? 'Tax Week' : 'Month'}
            onChange={(e) => setPeriodNumber(Number(e.target.value))}
          >
            {Array.from({ length: periodType === 'WEEKLY' ? 52 : 12 }, (_, i) => i + 1).map(num => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          type="number"
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          InputProps={{ inputProps: { min: 2020, max: 2030 } }}
          sx={{ width: 100 }}
        />
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontFamily: "'Outfit', sans-serif", fontWeight: 600 } }}>
                  <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Pay Period</TableCell>
                  <TableCell align="right" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Hours</TableCell>
                  <TableCell align="right" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Gross Pay</TableCell>
                  <TableCell align="right" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Net Pay</TableCell>
                  <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Source</TableCell>
                  <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id} hover>
                    <TableCell sx={{ fontFamily: "'Outfit', sans-serif" }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                          {formatPeriod(payslip.periodStart, payslip.periodEnd)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                        {payslip.totalHours > 0 ? `${payslip.totalHours.toFixed(1)}h` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                        {formatCurrency(payslip.grossPay)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="primary" fontWeight="bold" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                        {formatCurrency(payslip.netPay)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payslip.source === 'UPLOADED' ? 'Uploaded' : 'Generated'}
                        size="small"
                        color={payslip.source === 'UPLOADED' ? 'secondary' : 'default'}
                        sx={{ fontFamily: "'Outfit', sans-serif" }}
                      />
                    </TableCell>
                    <TableCell>
                      {getStatusChip(payslip.status)}
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

    </Box>
  );
};
