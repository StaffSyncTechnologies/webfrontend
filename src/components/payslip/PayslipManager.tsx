/**
 * Payslip Manager Component
 * 
 * Complete payslip management with calculator, history, and settings
 */

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Calculate,
  History,
  Settings,
  Assessment,
  UploadFile,
} from '@mui/icons-material';
import { PayslipCalculator } from './PayslipCalculator';
import { PayslipHistory } from './PayslipHistory';
import { PayslipUpload } from './PayslipUpload';
import type { PayslipResult, WorkerPayslipSettings } from '../../types/payslip.types';

interface PayslipManagerProps {
  workerId: string;
  workerName?: string;
  initialSalary?: number;
  payPeriodType?: 'WEEKLY' | 'MONTHLY';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payslip-tabpanel-${index}`}
      aria-labelledby={`payslip-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const PayslipManager: React.FC<PayslipManagerProps> = ({
  workerId,
  workerName,
  initialSalary,
  payPeriodType = 'MONTHLY',
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleSavePayslip = async (result: PayslipResult, payPeriod: string) => {
    try {
      // Mock API call - replace with actual API
      console.log('Saving payslip:', { workerId, payPeriod, result });
      
      showNotification(
        `Payslip for ${payPeriod} saved successfully!`,
        'success'
      );
      
      // Switch to history tab to show the saved payslip
      setTabValue(1);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Failed to save payslip',
        'error'
      );
    }
  };

  const handleDownloadPayslip = async (payslipId: string) => {
    try {
      // Mock PDF generation - replace with actual API
      console.log('Downloading payslip:', payslipId);
      
      showNotification(
        'Payslip PDF downloaded successfully!',
        'success'
      );
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Failed to download payslip',
        'error'
      );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Assessment sx={{ mr: 2, verticalAlign: 'middle' }} />
          Payslip Management
        </Typography>
        {workerName && (
          <Typography variant="body1" color="textSecondary">
            Employee: {workerName}
          </Typography>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Payslip management tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Calculate />}
            label="Calculator"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<History />}
            label="History"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<Settings />}
            label="Settings"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<UploadFile />}
            label="Upload PDF"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <PayslipCalculator
            workerId={workerId}
            onSave={handleSavePayslip}
            initialSalary={initialSalary}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PayslipHistory
            workerId={workerId}
            onView={(payslip) => {
              console.log('View payslip:', payslip);
            }}
            onDownload={(payslip) => handleDownloadPayslip(payslip.id)}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Payslip Settings
            </Typography>
            <Alert severity="info">
              Payslip settings management will be implemented here. This will allow you to configure
              default tax codes, pension rates, and other payroll settings for this employee.
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <PayslipUpload
            workerId={workerId}
            workerName={workerName}
            payPeriodType={payPeriodType}
            onSuccess={(_payslipId, periodLabel) => {
              showNotification(`Payslip for ${periodLabel} uploaded — worker will see PDF in app`, 'success');
              setTabValue(1);
            }}
          />
        </TabPanel>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
