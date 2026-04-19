/**
 * Payslip Calculator Component
 *
 * Full UK payslip calculator with:
 * - Accurate 2024/25 tax, NI, pension, student loan calculations
 * - Cumulative PAYE basis (UK statutory default) vs W1/M1 (emergency)
 * - Mid-year starter support — correctly applies unused personal allowance
 * - Pension opt-out with statutory process guidance
 * - Annual / Monthly view toggle
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Switch,
  Button,
  Grid,
  Divider,
  Chip,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  Tooltip,
  Paper,
  Stack,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Calculate,
  Save,
  InfoOutlined,
  TrendingUp,
  AccountBalance,
  School,
  HealthAndSafety,
  WarningAmber,
  CheckCircleOutline,
  HelpOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import type { PayslipOptions, StudentLoanPlan, PayslipResult, TaxBasis } from '../../types/payslip.types';
import {
  calculateMonthlyPayslip,
  calculateWeeklyPayslip,
  calculateFullBreakdown,
  currentTaxMonth,
  taxMonthLabel,
  validateTaxCode,
} from '../../utils/payslipCalculator';

interface PayslipCalculatorProps {
  workerId?: string;
  onSave?: (result: PayslipResult, payPeriod: string) => void;
  initialOptions?: Partial<PayslipOptions>;
  initialSalary?: number;
  payPeriodType?: 'WEEKLY' | 'MONTHLY';
}

const GBP = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

const PCT = (n: number) => `${n.toFixed(2)}%`;

const TAX_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Month ${i + 1} — ${taxMonthLabel(i + 1)}`,
}));

const STUDENT_LOAN_PLANS: { value: StudentLoanPlan; label: string; desc: string; threshold: string }[] = [
  { value: 'NONE',    label: 'None',          desc: 'No student loan',                        threshold: '—' },
  { value: 'PLAN1',   label: 'Plan 1',         desc: 'English/Welsh students before 2012',    threshold: '£24,990/yr' },
  { value: 'PLAN2',   label: 'Plan 2',         desc: 'English/Welsh students from 2012',      threshold: '£27,295/yr' },
  { value: 'PLAN4',   label: 'Plan 4',         desc: 'Scottish students',                     threshold: '£31,395/yr' },
  { value: 'POSTGRAD', label: 'Postgraduate',  desc: 'Postgraduate loans (6%)',               threshold: '£21,000/yr' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const DeductionRow = ({ label, amount, tooltip }: { label: string; amount: number; tooltip?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      {tooltip && (
        <Tooltip title={tooltip} arrow>
          <HelpOutline sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
        </Tooltip>
      )}
    </Box>
    <Typography variant="body2" color={amount > 0 ? 'error.main' : 'text.primary'} fontWeight={500}>
      {amount > 0 ? `-${GBP(amount)}` : GBP(0)}
    </Typography>
  </Box>
);

const EarningRow = ({ label, amount }: { label: string; amount: number }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={500}>{GBP(amount)}</Typography>
  </Box>
);

// ─── Pension Opt-Out Panel ────────────────────────────────────────────────────

const PensionOptOutPanel = () => (
  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'warning.50', borderColor: 'warning.300' }}>
    <Typography variant="subtitle2" color="warning.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
      <WarningAmber fontSize="small" /> Pension Opt-Out — Statutory Process (UK)
    </Typography>
    <Stack spacing={0.75}>
      {[
        { icon: '1.', text: 'Worker submits a written opt-out notice to the employer (use The Pensions Regulator opt-out form or employer equivalent).' },
        { icon: '2.', text: 'Opt-out must be submitted within 1 month of being auto-enrolled to receive a full refund of any deductions taken.' },
        { icon: '3.', text: 'Employer processes opt-out within 1 calendar month of receiving it.' },
        { icon: '4.', text: 'Both employee AND employer contributions stop immediately after opt-out.' },
        { icon: '5.', text: 'Employer must re-enrol all eligible workers every 3 years — worker can opt out again each time.' },
        { icon: '6.', text: 'Worker loses employer contributions (free money) and pension tax relief by opting out.' },
        { icon: '7.', text: 'Worker can opt back in at any time by writing to the employer.' },
      ].map(({ icon, text }) => (
        <Typography key={icon} variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 1 }}>
          <span style={{ fontWeight: 600, minWidth: 16 }}>{icon}</span> {text}
        </Typography>
      ))}
    </Stack>
    <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
      <Typography variant="caption">
        <strong>Tax impact:</strong> Pension contributions are deducted from gross pay (before tax). Opting out increases taxable income — the worker pays more income tax and NI as a result.
      </Typography>
    </Alert>
  </Paper>
);

// ─── Mid-Year Starter Info Panel ─────────────────────────────────────────────

const MidYearStarterPanel = ({ result, annualGross }: { result: PayslipResult; annualGross: number }) => {
  if (result.taxBasis !== 'CUMULATIVE' || result.taxMonth <= 1) return null;
  const unusedAllowance = Math.max(0, (result.taxMonth - 1) * (12570 / 12));
  const taxSavedVsFullYear = Math.round(unusedAllowance * 0.20 * 100) / 100;
  const monthLabel = taxMonthLabel(result.taxMonth);

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'info.50', borderColor: 'info.200' }}>
      <Typography variant="subtitle2" color="info.dark" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <InfoOutlined fontSize="small" /> Mid-Year Starter — Cumulative PAYE Benefit
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Starting in tax month {result.taxMonth} ({monthLabel}) means{' '}
        <strong>{result.taxMonth - 1} months of unused personal allowance</strong> carry forward:
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Accumulated carry-forward allowance</Typography>
          <Typography variant="caption" fontWeight={600}>{GBP(unusedAllowance)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Estimated initial tax saving (vs full year)</Typography>
          <Typography variant="caption" fontWeight={600} color="success.main">{GBP(taxSavedVsFullYear)}</Typography>
        </Box>
        {result.firstTaxPayingMonth && result.firstTaxPayingMonth > result.taxMonth && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">Estimated first month paying tax</Typography>
            <Typography variant="caption" fontWeight={600}>
              Month {result.firstTaxPayingMonth} ({taxMonthLabel(result.firstTaxPayingMonth)})
            </Typography>
          </Box>
        )}
        {result.incomeTax === 0 && (
          <Alert severity="success" sx={{ py: 0.25, mt: 0.5 }}>
            <Typography variant="caption">
              <strong>£0 income tax this month</strong> — personal allowance absorbs all taxable pay.
            </Typography>
          </Alert>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        <strong>How it works (UK PAYE cumulative basis):</strong> Each month, tax is calculated on <em>total earnings since 6 April</em> minus <em>total allowance accumulated to date</em>. Starting mid-year means prior months' unused allowance reduces your initial tax liability.
        This is the statutory HMRC default — it stops when cumulative earnings exceed cumulative allowance.
      </Typography>
    </Paper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const PayslipCalculator: React.FC<PayslipCalculatorProps> = ({
  workerId,
  onSave,
  initialOptions = {},
  initialSalary = 30000,
  payPeriodType = 'MONTHLY',
}) => {
  const [salary, setSalary] = useState(String(initialSalary));
  const [taxCodeInput, setTaxCodeInput] = useState(initialOptions.taxCode ?? '1257L');
  const [taxCodeError, setTaxCodeError] = useState('');
  const [taxBasis, setTaxBasis] = useState<TaxBasis>(initialOptions.taxBasis ?? 'CUMULATIVE');
  const [taxMonth, setTaxMonth] = useState(initialOptions.taxMonth ?? currentTaxMonth());
  const [priorGross, setPriorGross] = useState(initialOptions.cumulativeGross ?? 0);
  const [priorTaxPaid, setPriorTaxPaid] = useState(initialOptions.cumulativeTaxPaid ?? 0);
  const [pensionOptOut, setPensionOptOut] = useState(initialOptions.pensionOptOut ?? false);
  const [employeeRate, setEmployeeRate] = useState((initialOptions.pensionEmployeeRate ?? 0.05) * 100);
  const [employerRate, setEmployerRate] = useState((initialOptions.pensionEmployerRate ?? 0.03) * 100);
  const [studentLoan, setStudentLoan] = useState<StudentLoanPlan>(initialOptions.studentLoan ?? 'NONE');
  const [blindAllowance, setBlindAllowance] = useState(initialOptions.blindPersonsAllowance ?? false);
  const [marriageAllowance, setMarriageAllowance] = useState(initialOptions.marriageAllowance ?? false);
  const [resultTab, setResultTab] = useState(0);
  const [showPensionInfo, setShowPensionInfo] = useState(false);
  const [showCumulativeInfo, setShowCumulativeInfo] = useState(false);
  const [payPeriodType, setPayPeriodType] = useState<'WEEKLY' | 'MONTHLY'>(payPeriodType);

  // ── Real-time calculation (no API call needed) ──────────────────────────────
  const result = useMemo<PayslipResult | null>(() => {
    const annualGross = parseFloat(salary);
    if (isNaN(annualGross) || annualGross <= 0) return null;

    const opts: PayslipOptions = {
      taxCode: taxCodeInput,
      taxBasis,
      taxMonth,
      cumulativeGross: priorGross,
      cumulativeTaxPaid: priorTaxPaid,
      pensionOptOut,
      pensionEmployeeRate: employeeRate / 100,
      pensionEmployerRate: employerRate / 100,
      studentLoan,
      blindPersonsAllowance: blindAllowance,
      marriageAllowance,
    };

    try {
      return payPeriodType === 'WEEKLY' 
        ? calculateWeeklyPayslip(annualGross, opts)
        : calculateMonthlyPayslip(annualGross, opts);
    } catch {
      return null;
    }
  }, [salary, taxCodeInput, taxBasis, taxMonth, priorGross, priorTaxPaid, pensionOptOut, employeeRate, employerRate, studentLoan, blindAllowance, marriageAllowance, payPeriodType]);

  const annual = useMemo(() => {
    const annualGross = parseFloat(salary);
    if (isNaN(annualGross) || annualGross <= 0 || !result) return null;
    return calculateFullBreakdown(annualGross, {
      taxCode: taxCodeInput,
      taxBasis: 'W1M1', // annual view always uses full-year basis
      pensionOptOut,
      pensionEmployeeRate: employeeRate / 100,
      pensionEmployerRate: employerRate / 100,
      studentLoan,
      blindPersonsAllowance: blindAllowance,
      marriageAllowance,
    });
  }, [salary, taxCodeInput, pensionOptOut, employeeRate, employerRate, studentLoan, blindAllowance, marriageAllowance, result]);

  const handleTaxCodeChange = (v: string) => {
    setTaxCodeInput(v);
    setTaxCodeError(v && !validateTaxCode(v) ? 'Invalid tax code (e.g. 1257L, BR, 0T, D0)' : '');
  };

  const handleSave = () => {
    if (!result || !onSave) return;
    const now = new Date();
    const payPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onSave(result, payPeriod);
  };

  const annualGross = parseFloat(salary) || 0;

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <Calculate color="primary" sx={{ fontSize: 30 }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>Payslip Calculator</Typography>
          <Typography variant="caption" color="text.secondary">2024/25 UK tax year — real-time calculations</Typography>
        </Box>
        <Chip label="Accurate" color="success" size="small" icon={<CheckCircleOutline />} sx={{ ml: 'auto' }} />
      </Box>

      <Grid container spacing={3}>
        {/* ── LEFT: Inputs ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>

            {/* Salary */}
            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ fontFamily: "'Outfit', sans-serif" }}>
                  Salary
                </Typography>
                <TextField
                  fullWidth
                  label="Annual Gross Salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                    sx: { fontFamily: "'Outfit', sans-serif" }
                  }}
                  size="small"
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: "'Outfit', sans-serif" },
                    '& .MuiInputBase-input': { fontFamily: "'Outfit', sans-serif" }
                  }}
                  helperText={result ? `= ${GBP(payPeriodType === 'WEEKLY' ? result.netPay * 52 / 12 : result.monthlyGross)} / month` : ''}
                />
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: "'Outfit', sans-serif" }}>Pay Period Type</InputLabel>
                  <Select
                    value={payPeriodType}
                    onChange={(e) => setPayPeriodType(e.target.value as 'WEEKLY' | 'MONTHLY')}
                    label="Pay Period Type"
                    sx={{ 
                      '& .MuiSelect-select': { fontFamily: "'Outfit', sans-serif" },
                      '& .MuiMenuItem-root': { fontFamily: "'Outfit', sans-serif" }
                    }}
                  >
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Tax Basis */}
            <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                    PAYE Tax Basis
                  </Typography>
                  <Tooltip title="Toggle details" arrow>
                    <IconButton size="small" onClick={() => setShowCumulativeInfo(p => !p)}>
                      {showCumulativeInfo ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <RadioGroup 
                    row 
                    value={taxBasis} 
                    onChange={(e) => setTaxBasis(e.target.value as TaxBasis)}
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '14px'
                      }
                    }}
                  >
                    <FormControlLabel
                      value="CUMULATIVE"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Cumulative</Typography>
                          <Typography variant="caption" color="text.secondary">Normal / statutory default</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="W1M1"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>W1/M1</Typography>
                          <Typography variant="caption" color="text.secondary">Emergency / no P45</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {taxBasis === 'CUMULATIVE' && (
                  <Stack spacing={1.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Current Tax Month</InputLabel>
                      <Select
                        value={taxMonth}
                        label="Current Tax Month"
                        onChange={(e) => setTaxMonth(Number(e.target.value))}
                      >
                        {TAX_MONTH_OPTIONS.map(o => (
                          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth size="small"
                      label="Cumulative Gross (prior months)"
                      type="number"
                      value={priorGross}
                      onChange={(e) => setPriorGross(parseFloat(e.target.value) || 0)}
                      InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                      helperText="Total gross earned Apr–last month (0 if new starter)"
                    />
                    <TextField
                      fullWidth size="small"
                      label="Cumulative Tax Paid (prior months)"
                      type="number"
                      value={priorTaxPaid}
                      onChange={(e) => setPriorTaxPaid(parseFloat(e.target.value) || 0)}
                      InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                      helperText="Total income tax paid Apr–last month (0 if new starter)"
                    />
                  </Stack>
                )}

                <Collapse in={showCumulativeInfo}>
                  <Alert severity="info" sx={{ mt: 1.5 }} icon={<InfoOutlined fontSize="small" />}>
                    <Typography variant="caption">
                      <strong>Cumulative:</strong> Tax is calculated on total earnings since 6 April, minus total personal allowance to date. Mid-year starters benefit from unused prior-month allowance — they may pay NO tax initially.<br />
                      <strong>W1/M1:</strong> Emergency basis — only this month's allowance (£1,047.50) is used. No carry-forward. Worker pays the same tax every month regardless of start date.
                    </Typography>
                  </Alert>
                </Collapse>
              </CardContent>
            </Card>

            {/* Tax Code */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Tax Code</Typography>
                <TextField
                  fullWidth size="small"
                  label="Tax Code"
                  value={taxCodeInput}
                  onChange={(e) => handleTaxCodeChange(e.target.value.toUpperCase())}
                  error={!!taxCodeError}
                  helperText={taxCodeError || 'Standard: 1257L  |  No allowance: BR or 0T  |  No tax: NT'}
                />
              </CardContent>
            </Card>

            {/* Student Loan */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Student Loan</Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={studentLoan}
                    onChange={(e) => setStudentLoan(e.target.value as StudentLoanPlan)}
                  >
                    {STUDENT_LOAN_PLANS.map(plan => (
                      <FormControlLabel
                        key={plan.value}
                        value={plan.value}
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                            <Typography variant="body2">{plan.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{plan.desc} — {plan.threshold} threshold</Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>

            {/* Pension */}
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Pension (Auto-Enrolment)</Typography>
                  <IconButton size="small" onClick={() => setShowPensionInfo(p => !p)}>
                    {showPensionInfo ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                  </IconButton>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={pensionOptOut}
                      onChange={(e) => setPensionOptOut(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {pensionOptOut ? '⚠ Opted out of pension' : '✓ Enrolled in pension'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pensionOptOut
                          ? 'No deductions — worker loses employer contributions'
                          : `Employee ${employeeRate}% + Employer ${employerRate}% on qualifying earnings`}
                      </Typography>
                    </Box>
                  }
                />

                {!pensionOptOut && (
                  <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                    <TextField
                      fullWidth size="small"
                      label="Employee Contribution Rate"
                      type="number"
                      value={employeeRate}
                      onChange={(e) => setEmployeeRate(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, max: 100, step: 0.5 }
                      }}
                      helperText="Statutory minimum: 5%"
                    />
                    <TextField
                      fullWidth size="small"
                      label="Employer Contribution Rate"
                      type="number"
                      value={employerRate}
                      onChange={(e) => setEmployerRate(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        inputProps: { min: 0, max: 100, step: 0.5 }
                      }}
                      helperText="Statutory minimum: 3%"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Applied on qualifying earnings £6,240–£50,270/yr
                    </Typography>
                  </Stack>
                )}

                <Collapse in={showPensionInfo || pensionOptOut}>
                  <PensionOptOutPanel />
                </Collapse>
              </CardContent>
            </Card>

            {/* Allowances */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Additional Allowances</Typography>
                <Stack>
                  <FormControlLabel
                    control={<Switch size="small" checked={blindAllowance} onChange={(e) => setBlindAllowance(e.target.checked)} />}
                    label={
                      <Box>
                        <Typography variant="body2">Blind Person's Allowance</Typography>
                        <Typography variant="caption" color="text.secondary">+£2,870 — total allowance £15,440</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={<Switch size="small" checked={marriageAllowance} onChange={(e) => setMarriageAllowance(e.target.checked)} />}
                    label={
                      <Box>
                        <Typography variant="body2">Marriage Allowance (receiving partner)</Typography>
                        <Typography variant="caption" color="text.secondary">+£1,260 transferred from spouse — total allowance £13,830</Typography>
                      </Box>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {onSave && result && (
              <Button variant="outlined" startIcon={<Save />} onClick={handleSave} fullWidth>
                Save Payslip Record
              </Button>
            )}
          </Stack>
        </Grid>

        {/* ── RIGHT: Results ───────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 7 }}>
          {!result ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
              <Calculate sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography variant="body1">Enter an annual salary to see the payslip breakdown</Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {/* Net pay hero */}
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Grid container alignItems="center">
                    <Grid size="grow">
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {taxBasis === 'CUMULATIVE'
                          ? `Tax Month ${taxMonth} (${taxMonthLabel(taxMonth)}) — Cumulative PAYE`
                          : 'W1/M1 Basis — Emergency Tax'}
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>{GBP(result.netPay)}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        Net {payPeriodType === 'WEEKLY' ? 'Weekly' : 'Monthly'} Pay
                      </Typography>
                    </Grid>
                    <Grid size="auto">
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Chip label={`${PCT(result.effectiveTaxRate)} effective rate`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }} />
                        {result.incomeTax === 0 && (
                          <Chip label="£0 income tax" size="small" color="success" />
                        )}
                        {result.pensionOptedOut && (
                          <Chip label="Pension opted out" size="small" sx={{ bgcolor: 'warning.light', color: 'warning.dark' }} />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabs: Monthly / Annual / Employer */}
              <Card variant="outlined">
                <Tabs value={resultTab} onChange={(_, v) => setResultTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                  <Tab label={payPeriodType === 'WEEKLY' ? 'Weekly' : 'Monthly'} />
                  <Tab label="Annual" />
                  <Tab label="Employer Costs" />
                </Tabs>

                <CardContent>
                  {/* Weekly/Monthly tab */}
                  {resultTab === 0 && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>EARNINGS</Typography>
                      <EarningRow label={`Gross Pay (${payPeriodType === 'WEEKLY' ? 'Week' : 'Month'})`} amount={payPeriodType === 'WEEKLY' ? result.netPay + result.totalDeductions : result.monthlyGross} />
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>DEDUCTIONS</Typography>
                      <DeductionRow
                        label="Income Tax (PAYE)"
                        amount={result.incomeTax}
                        tooltip={taxBasis === 'CUMULATIVE'
                          ? `Cumulative tax owed to date: ${GBP(result.cumulativeTaxOwed)}. Tax-free carry-forward this month: ${GBP(result.taxFreeThisMonth)}`
                          : 'W1/M1: calculated on this month\'s earnings only, no carry-forward'}
                      />
                      <DeductionRow
                        label="National Insurance (8%)"
                        amount={result.nationalInsurance}
                        tooltip="NI is always calculated on current month's earnings only — NI does not use cumulative basis"
                      />
                      {!result.pensionOptedOut && (
                        <DeductionRow
                          label={`Employee Pension (${employeeRate}%)`}
                          amount={result.employeePension}
                          tooltip={`${employeeRate}% on qualifying earnings (£520–£4,189/month). Tax-efficient: reduces taxable income.`}
                        />
                      )}
                      {result.studentLoan > 0 && (
                        <DeductionRow label={`Student Loan (${studentLoan})`} amount={result.studentLoan} />
                      )}
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="subtitle2">Total Deductions</Typography>
                        <Typography variant="subtitle2" color="error.main">-{GBP(result.totalDeductions)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, bgcolor: 'action.hover', px: 1.5, borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Net Pay</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="primary">{GBP(result.netPay)}</Typography>
                      </Box>
                    </>
                  )}

                  {/* Annual tab */}
                  {resultTab === 1 && annual && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>FULL YEAR (W1/M1 ANNUAL BASIS)</Typography>
                      <EarningRow label="Annual Gross" amount={annual.annual.gross} />
                      <Divider sx={{ my: 1.5 }} />
                      <DeductionRow label="Income Tax" amount={annual.annual.tax} />
                      <DeductionRow label="National Insurance" amount={annual.annual.ni} />
                      {!pensionOptOut && <DeductionRow label={`Employee Pension (${employeeRate}%)`} amount={annual.annual.pension} />}
                      {annual.annual.studentLoan > 0 && <DeductionRow label="Student Loan" amount={annual.annual.studentLoan} />}
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, bgcolor: 'action.hover', px: 1.5, borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Annual Net Pay</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="primary">{GBP(annual.annual.netPay)}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Annual view uses W1/M1 basis (full-year allowance). Actual take-home may differ with cumulative PAYE for mid-year starters.
                      </Typography>
                    </>
                  )}

                  {/* Employer costs tab */}
                  {resultTab === 2 && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {payPeriodType === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY'} EMPLOYER COSTS
                      </Typography>
                      <EarningRow label="Gross Salary" amount={payPeriodType === 'WEEKLY' ? result.netPay + result.totalDeductions : result.monthlyGross} />
                      <EarningRow label="Employer NI (13.8%)" amount={result.employerNI} />
                      {!result.pensionOptedOut && (
                        <EarningRow label={`Employer Pension (${employerRate}%)`} amount={result.employerPension} />
                      )}
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, bgcolor: 'action.hover', px: 1.5, borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Total {payPeriodType === 'WEEKLY' ? 'Weekly' : 'Monthly'} Cost
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {GBP((payPeriodType === 'WEEKLY' ? result.netPay + result.totalDeductions : result.monthlyGross) + result.employerNI + result.employerPension)}
                        </Typography>
                      </Box>
                      {annual && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>ANNUAL EMPLOYER COSTS</Typography>
                          <EarningRow label="Annual Salary" amount={annual.annual.gross} />
                          <EarningRow label="Annual Employer NI" amount={annual.monthly.employerNI * 12} />
                          {!pensionOptOut && <EarningRow label="Annual Employer Pension" amount={annual.monthly.employerPension * 12} />}
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={700}>Total Annual Cost</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {GBP(annual.annual.gross + annual.monthly.employerNI * 12 + annual.monthly.employerPension * 12)}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Mid-year starter info */}
              {result && <MidYearStarterPanel result={result} annualGross={annualGross} />}

              {/* Tax summary chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={`Tax code: ${taxCodeInput}`} variant="outlined" />
                <Chip size="small" label={taxBasis === 'CUMULATIVE' ? `Month ${taxMonth} cumulative` : 'W1/M1 emergency'} variant="outlined" color={taxBasis === 'CUMULATIVE' ? 'default' : 'warning'} />
                <Chip size="small" label={pensionOptOut ? 'No pension' : `Pension ${employeeRate}%+${employerRate}%`} variant="outlined" color={pensionOptOut ? 'warning' : 'success'} />
                {studentLoan !== 'NONE' && <Chip size="small" label={`Student loan: ${studentLoan}`} variant="outlined" />}
                {blindAllowance && <Chip size="small" label="Blind allowance" variant="outlined" />}
                {marriageAllowance && <Chip size="small" label="Marriage allowance" variant="outlined" />}
              </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
