/**
 * PayslipUpload Component
 *
 * Allows admin/ops to upload a PDF payslip for a worker.
 * When uploaded, the system-generated payslip is replaced — workers
 * will see the uploaded PDF instead of the auto-generated breakdown.
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  UploadFile,
  PictureAsPdf,
  CheckCircle,
  Close,
  CloudUpload,
  InfoOutlined,
} from '@mui/icons-material';
import { API_BASE_URL, PAYSLIPS } from '../../services/endpoints';

interface PayslipUploadProps {
  workerId: string;
  workerName?: string;
  payPeriodType?: 'WEEKLY' | 'MONTHLY';
  onSuccess?: (payslipId: string, periodLabel: string) => void;
}

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

const todayISO = () => toISODate(new Date());

/** Compute period boundaries from a reference date */
function computePeriod(dateStr: string, type: 'WEEKLY' | 'MONTHLY') {
  const [y, m, d] = dateStr.split('-').map(Number);
  const ref = new Date(y, m - 1, d);
  if (type === 'WEEKLY') {
    const day = ref.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(ref);
    start.setDate(ref.getDate() + diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start,
      end,
      label: `Week ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    };
  } else {
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return {
      start,
      end,
      label: start.toLocaleString('en-GB', { month: 'long', year: 'numeric' }),
    };
  }
}

export const PayslipUpload: React.FC<PayslipUploadProps> = ({
  workerId,
  workerName,
  payPeriodType = 'MONTHLY',
  onSuccess,
}) => {
  const [payPeriodDate, setPayPeriodDate] = useState<string>(todayISO);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<{ payslipId: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const period = payPeriodDate ? computePeriod(payPeriodDate, payPeriodType) : null;

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setFile(selected);
    setError(null);
    setSuccess(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped ?? null);
  };

  const handleUpload = async () => {
    if (!file || !payPeriodDate) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workerId', workerId);
    formData.append('payPeriodDate', payPeriodDate);

    try {
      const authToken = localStorage.getItem('authToken') ?? sessionStorage.getItem('authToken');
      const legacyToken = localStorage.getItem('token') ?? sessionStorage.getItem('token');
      const token = authToken ?? legacyToken;
      
      console.log('=== Payslip Upload Auth Debug ===');
      console.log('Auth Token (localStorage):', localStorage.getItem('authToken'));
      console.log('Legacy Token (localStorage):', localStorage.getItem('token'));
      console.log('Auth Token (sessionStorage):', sessionStorage.getItem('authToken'));
      console.log('Legacy Token (sessionStorage):', sessionStorage.getItem('token'));
      console.log('Selected Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
      console.log('API Key:', import.meta.env.VITE_API_KEY ? `${import.meta.env.VITE_API_KEY.substring(0, 20)}...` : 'NONE');
      console.log('================================');
      
      const headers: Record<string, string> = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Add API key header for backend validation
      headers['X-API-Key'] = import.meta.env.VITE_API_KEY || '';
      
      const res = await fetch(`${API_BASE_URL}${PAYSLIPS.UPLOAD}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      // Check if response has content before trying to parse JSON
      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        json = {};
      }
      
      if (!res.ok) throw new Error(json.message ?? `Upload failed (${res.status})`);

      console.log('=== Upload Response Debug ===');
      console.log('Response status:', res.status);
      console.log('Response JSON:', json);
      console.log('Response data:', json.data);
      console.log('============================');

      // Safely extract values with proper null checks
      const responseData = json.data || {};
      const payslipId = responseData.payslipId;
      const label = responseData.periodLabel ?? period?.label ?? payPeriodDate;
      
      if (!payslipId) {
        throw new Error('Upload succeeded but no payslip ID returned from server');
      }
      
      setSuccess({ payslipId, label });
      setFile(null);
      onSuccess?.(payslipId, label);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ fontFamily: "'Outfit', sans-serif" }}>
      <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
        Upload PDF Payslip
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: "'Outfit', sans-serif" }}>
        Upload a PDF payslip for this employee. The file will be stored and linked to the employee's payslip record.
      </Typography>
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
            Upload a payslip PDF generated by your payroll software. Workers will see this
            instead of the system-generated breakdown.
          </Typography>
          {workerName && (
            <Chip label={workerName} size="small" sx={{ mt: 1 }} />
          )}
        </Box>

        {/* Info banner */}
        <Alert 
          severity="info" 
          icon={<InfoOutlined fontSize="small" />}
          sx={{ 
            fontFamily: "'Outfit', sans-serif",
            '& .MuiAlert-message': {
              fontFamily: "'Outfit', sans-serif"
            }
          }}
        >
          <Typography variant="body2" sx={{ fontFamily: "'Outfit', sans-serif" }}>
            Accepted formats: PDF only. Maximum file size: 10 MB.
          </Typography>
        </Alert>

        {/* Pay period selector */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
            Pay Period
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={payPeriodDate}
            onChange={(e) => setPayPeriodDate(e.target.value)}
            label={payPeriodType === 'WEEKLY' ? 'Week Start Date' : 'Month'}
            size="small"
            sx={{ 
              '& .MuiInputLabel-root': { fontFamily: "'Outfit', sans-serif" },
              '& .MuiInputBase-input': { fontFamily: "'Outfit', sans-serif" }
            }}
            helperText={period ? `Period: ${period.label}` : ''}
          />
          {period && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                Pay Period Dates:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                Start: {toISODate(period.start)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                End: {toISODate(period.end)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* File drop zone */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Payslip PDF</Typography>
            <Paper
              variant="outlined"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              sx={{
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                borderStyle: 'dashed',
                borderColor: dragOver ? 'primary.main' : file ? 'success.main' : 'divider',
                bgcolor: dragOver ? 'primary.50' : file ? 'success.50' : 'background.default',
                transition: 'all 0.15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <Stack alignItems="center" spacing={1}>
                  <PictureAsPdf sx={{ fontSize: 40, color: 'error.main' }} />
                  <Typography variant="body2" fontWeight={600}>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<Close />}
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    Remove
                  </Button>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <CloudUpload sx={{ fontSize: 40, color: 'text.disabled' }} />
                  <Typography variant="body2" fontWeight={500}>
                    Drop PDF here or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF only · max 10 MB
                  </Typography>
                </Stack>
              )}
            </Paper>
          </CardContent>
        </Card>

        {/* Progress */}
        {uploading && <LinearProgress />}

        {/* Success */}
        {success && (
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="body2">
              <strong>Payslip uploaded successfully</strong> for {success.label}.
              Workers will now see this PDF in the app.
            </Typography>
          </Alert>
        )}

        {/* Error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Upload button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadFile />}
          onClick={handleUpload}
          disabled={!file || !payPeriodDate || uploading}
          fullWidth
        >
          {uploading ? 'Uploading…' : 'Upload Payslip'}
        </Button>
      </Stack>
    </Box>
  );
};
