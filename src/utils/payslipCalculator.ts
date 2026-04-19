/**
 * UK Payslip Calculator — Frontend Utility (2024/25)
 *
 * Mirrors backend logic and adds cumulative PAYE basis support.
 *
 * UK PAYE operates on a CUMULATIVE basis by default:
 * Each pay period, tax is calculated on TOTAL earnings since 6 April,
 * minus TOTAL personal allowance accumulated so far. This means a worker
 * starting mid-year (e.g. August) benefits from unused personal allowance
 * from earlier months — they may pay NO tax for several months.
 *
 * W1/M1 (Week 1 / Month 1) basis is non-cumulative (emergency tax):
 * Only the CURRENT period's allowance is used — no carry-forward.
 * Used when the employer has no P45 or HMRC instructs it.
 */

import type {
  PayslipOptions,
  PayslipResult,
  PayslipBreakdown,
  StudentLoanPlan,
  TaxBasis,
} from '../types/payslip.types';

// ─── 2024/25 Constants ───────────────────────────────────────────────────────

const TAX = {
  PERSONAL_ALLOWANCE: 12_570,
  BASIC_RATE_LIMIT: 50_270,
  HIGHER_RATE_LIMIT: 125_140,
  BASIC_RATE_BAND: 37_700,        // 50270 - 12570
  HIGHER_RATE_BAND: 74_870,       // 125140 - 50270
  BASIC_RATE: 0.20,
  HIGHER_RATE: 0.40,
  ADDITIONAL_RATE: 0.45,
  BLIND_PERSONS_ALLOWANCE: 2_870,
  MARRIAGE_ALLOWANCE_TRANSFER: 1_260,
} as const;

const NI = {
  PRIMARY_THRESHOLD: 12_570,      // employee starts paying NI
  UPPER_LIMIT: 50_270,            // upper earnings limit
  BASIC_RATE: 0.08,               // 8% (reduced Jan 2024)
  HIGHER_RATE: 0.02,              // 2% above UEL
  EMPLOYER_THRESHOLD: 9_100,
  EMPLOYER_RATE: 0.138,
} as const;

const PENSION = {
  LOWER_LIMIT: 6_240,             // qualifying earnings lower limit
  UPPER_LIMIT: 50_270,            // qualifying earnings upper limit
  DEFAULT_EMPLOYEE_RATE: 0.05,    // statutory minimum 5%
  DEFAULT_EMPLOYER_RATE: 0.03,    // statutory minimum 3%
} as const;

const STUDENT_LOAN = {
  PLAN1:    { threshold: 24_990, rate: 0.09 },
  PLAN2:    { threshold: 27_295, rate: 0.09 },
  PLAN4:    { threshold: 31_395, rate: 0.09 },
  POSTGRAD: { threshold: 21_000, rate: 0.06 },
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const round2 = (v: number) => Math.round(v * 100) / 100;

/** Convert tax code to annual personal allowance amount */
export const annualAllowanceFromCode = (
  taxCode: string,
  options: PayslipOptions = {}
): number => {
  let base = TAX.PERSONAL_ALLOWANCE;
  if (options.blindPersonsAllowance) base += TAX.BLIND_PERSONS_ALLOWANCE;
  if (options.marriageAllowance)     base += TAX.MARRIAGE_ALLOWANCE_TRANSFER;

  const code = (taxCode ?? '1257L').toUpperCase().trim();
  if (code === 'NT') return Infinity;
  if (['BR', '0T', 'D0', 'D1'].includes(code)) return 0;

  const m = code.match(/^(\d+)[A-Z]$/);
  return m ? parseInt(m[1]) * 10 : base;
};

/** Apply UK income-tax bands to a taxable amount */
const taxOnAmount = (taxable: number, code: string, annualGross: number): number => {
  if (taxable <= 0) return 0;
  const c = code.toUpperCase().trim();
  if (c === 'NT') return 0;
  if (c === 'BR') return round2(annualGross * TAX.BASIC_RATE);
  if (c === 'D0') return round2(annualGross * TAX.HIGHER_RATE);
  if (c === 'D1') return round2(annualGross * TAX.ADDITIONAL_RATE);

  let tax = 0;
  if (taxable <= TAX.BASIC_RATE_BAND) {
    tax = taxable * TAX.BASIC_RATE;
  } else if (taxable <= TAX.BASIC_RATE_BAND + TAX.HIGHER_RATE_BAND) {
    tax = TAX.BASIC_RATE_BAND * TAX.BASIC_RATE +
          (taxable - TAX.BASIC_RATE_BAND) * TAX.HIGHER_RATE;
  } else {
    tax = TAX.BASIC_RATE_BAND * TAX.BASIC_RATE +
          TAX.HIGHER_RATE_BAND * TAX.HIGHER_RATE +
          (taxable - TAX.BASIC_RATE_BAND - TAX.HIGHER_RATE_BAND) * TAX.ADDITIONAL_RATE;
  }
  return round2(tax);
};

// ─── Annual helpers (for standard W1M1 / annual basis) ───────────────────────

export const calcAnnualTax = (annualGross: number, options: PayslipOptions = {}): number => {
  const code    = options.taxCode ?? '1257L';
  const c       = code.toUpperCase().trim();
  const allow   = annualAllowanceFromCode(code, options);
  if (allow === Infinity) return 0;
  if (c === 'BR') return round2(annualGross * TAX.BASIC_RATE);
  if (c === 'D0') return round2(annualGross * TAX.HIGHER_RATE);
  if (c === 'D1') return round2(annualGross * TAX.ADDITIONAL_RATE);
  if (annualGross <= allow) return 0;
  return taxOnAmount(annualGross - allow, c, annualGross);
};

export const calcAnnualEmployeeNI = (annualGross: number): number => {
  if (annualGross <= NI.PRIMARY_THRESHOLD) return 0;
  if (annualGross <= NI.UPPER_LIMIT)
    return round2((annualGross - NI.PRIMARY_THRESHOLD) * NI.BASIC_RATE);
  return round2(
    (NI.UPPER_LIMIT - NI.PRIMARY_THRESHOLD) * NI.BASIC_RATE +
    (annualGross - NI.UPPER_LIMIT) * NI.HIGHER_RATE
  );
};

export const calcAnnualEmployerNI = (annualGross: number): number => {
  if (annualGross <= NI.EMPLOYER_THRESHOLD) return 0;
  return round2((annualGross - NI.EMPLOYER_THRESHOLD) * NI.EMPLOYER_RATE);
};

export const calcAnnualEmployeePension = (annualGross: number, options: PayslipOptions = {}): number => {
  if (options.pensionOptOut || annualGross <= PENSION.LOWER_LIMIT) return 0;
  const rate = options.pensionEmployeeRate ?? PENSION.DEFAULT_EMPLOYEE_RATE;
  return round2((Math.min(annualGross, PENSION.UPPER_LIMIT) - PENSION.LOWER_LIMIT) * rate);
};

export const calcAnnualEmployerPension = (annualGross: number, options: PayslipOptions = {}): number => {
  if (options.pensionOptOut || annualGross <= PENSION.LOWER_LIMIT) return 0;
  const rate = options.pensionEmployerRate ?? PENSION.DEFAULT_EMPLOYER_RATE;
  return round2((Math.min(annualGross, PENSION.UPPER_LIMIT) - PENSION.LOWER_LIMIT) * rate);
};

export const calcAnnualStudentLoan = (annualGross: number, plan: StudentLoanPlan = 'NONE'): number => {
  if (plan === 'NONE') return 0;
  const { threshold, rate } = STUDENT_LOAN[plan];
  return annualGross <= threshold ? 0 : round2((annualGross - threshold) * rate);
};

// Weekly helpers
export const calcWeeklyEmployeeNI = (annualGross: number): number => {
  const weeklyGross = annualGross / 52;
  const weeklyThreshold = NI.PRIMARY_THRESHOLD / 52;
  const weeklyUpperLimit = NI.UPPER_LIMIT / 52;
  
  if (weeklyGross <= weeklyThreshold) return 0;
  
  if (weeklyGross <= weeklyUpperLimit) {
    return round2((weeklyGross - weeklyThreshold) * NI.BASIC_RATE);
  }
  
  return round2(
    (weeklyUpperLimit - weeklyThreshold) * NI.BASIC_RATE +
    (weeklyGross - weeklyUpperLimit) * NI.HIGHER_RATE
  );
};

export const calcWeeklyEmployerNI = (annualGross: number): number => {
  const weeklyGross = annualGross / 52;
  const weeklyThreshold = NI.EMPLOYER_THRESHOLD / 52;
  const weeklyUpperLimit = NI.UPPER_LIMIT / 52;
  
  if (weeklyGross <= weeklyThreshold) return 0;
  
  if (weeklyGross <= weeklyUpperLimit) {
    return round2((weeklyGross - weeklyThreshold) * NI.EMPLOYER_RATE);
  }
  
  return round2(
    (weeklyUpperLimit - weeklyThreshold) * NI.EMPLOYER_RATE +
    (weeklyGross - weeklyUpperLimit) * NI.EMPLOYER_RATE
  );
};

export const calcWeeklyTax = (annualGross: number, options: PayslipOptions): number => {
  const weeklyGross = annualGross / 52;
  const weeklyAllowance = TAX.PERSONAL_ALLOWANCE / 52;
  const weeklyBasicLimit = TAX.BASIC_RATE_LIMIT / 52;
  const weeklyHigherLimit = TAX.HIGHER_RATE_LIMIT / 52;
  
  let taxableWeekly = weeklyGross - weeklyAllowance;
  if (taxableWeekly <= 0) return 0;
  
  let tax = 0;
  if (taxableWeekly <= weeklyBasicLimit) {
    tax = taxableWeekly * TAX.BASIC_RATE;
  } else {
    tax = weeklyBasicLimit * TAX.BASIC_RATE;
    const higherIncome = taxableWeekly - weeklyBasicLimit;
    if (higherIncome <= (weeklyHigherLimit - weeklyBasicLimit)) {
      tax += higherIncome * TAX.HIGHER_RATE;
    } else {
      tax += (weeklyHigherLimit - weeklyBasicLimit) * TAX.HIGHER_RATE;
      const additionalIncome = higherIncome - (weeklyHigherLimit - weeklyBasicLimit);
      tax += additionalIncome * TAX.ADDITIONAL_RATE;
    }
  }
  
  return round2(tax);
};

export const calcWeeklyEmployeePension = (annualGross: number, options: PayslipOptions): number => {
  if (options.pensionOptOut) return 0;
  const weeklyGross = annualGross / 52;
  const weeklyLowerLimit = PENSION.LOWER_LIMIT / 52;
  const qualifyingEarnings = Math.max(0, weeklyGross - weeklyLowerLimit);
  const rate = options.pensionEmployeeRate ?? PENSION.DEFAULT_EMPLOYEE_RATE;
  return round2(qualifyingEarnings * rate);
};

export const calcWeeklyEmployerPension = (annualGross: number, options: PayslipOptions): number => {
  if (options.pensionOptOut) return 0;
  const weeklyGross = annualGross / 52;
  const weeklyLowerLimit = PENSION.LOWER_LIMIT / 52;
  const qualifyingEarnings = Math.max(0, weeklyGross - weeklyLowerLimit);
  const rate = options.pensionEmployerRate ?? PENSION.DEFAULT_EMPLOYER_RATE;
  return round2(qualifyingEarnings * rate);
};

export const calcWeeklyStudentLoan = (annualGross: number, plan: StudentLoanPlan): number => {
  const weeklyGross = annualGross / 52;
  const weeklyThreshold = STUDENT_LOAN[plan].threshold / 52;
  if (weeklyGross <= weeklyThreshold) return 0;
  return round2((weeklyGross - weeklyThreshold) * STUDENT_LOAN[plan].rate);
};

// ─── W1/M1 (non-cumulative) monthly calculation ──────────────────────────────

/**
 * Standard W1/M1 (emergency) basis or simple monthly split.
 * Each month is calculated independently — no carry-forward of unused allowance.
 * Equivalent to (annual deduction / 12).
 */
export const calculateW1M1Monthly = (
  annualGross: number,
  options: PayslipOptions = {}
): PayslipResult => {
  const taxMonth   = options.taxMonth ?? currentTaxMonth();
  const monthlyGross = round2(annualGross / 12);

  const incomeTax      = round2(calcAnnualTax(annualGross, options) / 12);
  const nationalInsurance = round2(calcAnnualEmployeeNI(annualGross) / 12);
  const employeePension   = round2(calcAnnualEmployeePension(annualGross, options) / 12);
  const studentLoan       = round2(calcAnnualStudentLoan(annualGross, options.studentLoan ?? 'NONE') / 12);
  const employerNI        = round2(calcAnnualEmployerNI(annualGross) / 12);
  const employerPension   = round2(calcAnnualEmployerPension(annualGross, options) / 12);

  const totalDeductions = round2(incomeTax + nationalInsurance + employeePension + studentLoan);
  const netPay          = round2(monthlyGross - totalDeductions);
  const effectiveTaxRate = round2((totalDeductions / monthlyGross) * 100);

  return {
    annualGross,
    monthlyGross,
    incomeTax,
    nationalInsurance,
    employeePension,
    studentLoan,
    totalDeductions,
    netPay,
    employerNI,
    employerPension,
    pensionOptedOut: options.pensionOptOut ?? false,
    effectiveTaxRate,
    taxBasis: 'W1M1',
    taxMonth,
    cumulativeGross: monthlyGross,
    cumulativeTaxOwed: incomeTax,
    taxFreeThisMonth: round2(TAX.PERSONAL_ALLOWANCE / 12),
  };
};

// ─── Cumulative PAYE calculation (UK statutory default) ──────────────────────

/**
 * Cumulative PAYE basis — the UK statutory default.
 *
 * Each month, tax is computed on TOTAL gross earnings since 6 April,
 * minus TOTAL personal allowance accumulated to this month.
 * Tax already paid in prior months is subtracted from the result.
 *
 * Key benefit for mid-year starters:
 *   - A worker starting in August (tax month 5) has 4 months of
 *     unused allowance (≈ £4,190) that carries forward. They pay
 *     significantly less tax — possibly ZERO — for several months.
 *
 * NI is always calculated on the CURRENT month's earnings only
 * (NI does NOT use the cumulative basis).
 */
export const calculateCumulativeMonthly = (
  currentMonthGross: number,
  options: PayslipOptions = {}
): PayslipResult => {
  const taxMonth          = options.taxMonth ?? currentTaxMonth();
  const priorGross        = options.cumulativeGross   ?? 0;
  const priorTaxPaid      = options.cumulativeTaxPaid ?? 0;
  const code              = (options.taxCode ?? '1257L').toUpperCase().trim();

  const cumulativeGross   = round2(priorGross + currentMonthGross);
  const annualAllowance   = annualAllowanceFromCode(code, options);

  // Cumulative personal allowance proportional to months elapsed
  const cumulativeAllowance = annualAllowance === Infinity
    ? Infinity
    : round2((annualAllowance / 12) * taxMonth);

  // How much of this month's allowance is "extra" (carry-forward from months with no earnings)
  // e.g. starting in month 5 means 4 months of allowance arrives all at once
  const monthlyAllowance = annualAllowance === Infinity ? Infinity : round2(annualAllowance / 12);
  const taxFreeThisMonth = cumulativeAllowance === Infinity
    ? Infinity
    : round2(Math.max(0, cumulativeAllowance - priorGross));  // carry-forward + this month's share

  // Cumulative taxable pay
  const cumulativeTaxable = cumulativeAllowance === Infinity
    ? 0
    : Math.max(0, cumulativeGross - cumulativeAllowance);

  // Cumulative tax bands (scaled to months elapsed)
  const cumBasicBand   = round2((TAX.BASIC_RATE_BAND  / 12) * taxMonth);
  const cumHigherBand  = round2((TAX.HIGHER_RATE_BAND / 12) * taxMonth);

  // Total cumulative tax owed
  let cumulativeTaxOwed = 0;
  if (code === 'NT') {
    cumulativeTaxOwed = 0;
  } else if (code === 'BR') {
    cumulativeTaxOwed = round2(cumulativeGross * TAX.BASIC_RATE);
  } else if (code === 'D0') {
    cumulativeTaxOwed = round2(cumulativeGross * TAX.HIGHER_RATE);
  } else if (code === 'D1') {
    cumulativeTaxOwed = round2(cumulativeGross * TAX.ADDITIONAL_RATE);
  } else if (cumulativeTaxable <= cumBasicBand) {
    cumulativeTaxOwed = round2(cumulativeTaxable * TAX.BASIC_RATE);
  } else if (cumulativeTaxable <= cumBasicBand + cumHigherBand) {
    cumulativeTaxOwed = round2(
      cumBasicBand * TAX.BASIC_RATE +
      (cumulativeTaxable - cumBasicBand) * TAX.HIGHER_RATE
    );
  } else {
    cumulativeTaxOwed = round2(
      cumBasicBand * TAX.BASIC_RATE +
      cumHigherBand * TAX.HIGHER_RATE +
      (cumulativeTaxable - cumBasicBand - cumHigherBand) * TAX.ADDITIONAL_RATE
    );
  }

  // Tax for THIS month = cumulative owed - already paid (never negative)
  const incomeTax = Math.max(0, round2(cumulativeTaxOwed - priorTaxPaid));

  // NI: always on CURRENT month's gross (never cumulative)
  const niMonthlyPT  = round2(NI.PRIMARY_THRESHOLD / 12);  // £1,047.50
  const niMonthlyUEL = round2(NI.UPPER_LIMIT / 12);        // £4,189.17
  let nationalInsurance = 0;
  if (currentMonthGross > niMonthlyPT) {
    if (currentMonthGross <= niMonthlyUEL) {
      nationalInsurance = round2((currentMonthGross - niMonthlyPT) * NI.BASIC_RATE);
    } else {
      nationalInsurance = round2(
        (niMonthlyUEL - niMonthlyPT) * NI.BASIC_RATE +
        (currentMonthGross - niMonthlyUEL) * NI.HIGHER_RATE
      );
    }
  }

  // Employer NI: on current month
  const erNIMonthlyThreshold = round2(NI.EMPLOYER_THRESHOLD / 12);
  const employerNI = currentMonthGross > erNIMonthlyThreshold
    ? round2((currentMonthGross - erNIMonthlyThreshold) * NI.EMPLOYER_RATE)
    : 0;

  // Pension: on current month's qualifying earnings
  let employeePension = 0;
  let employerPension = 0;
  if (!options.pensionOptOut) {
    const monthlyPensionLower = round2(PENSION.LOWER_LIMIT / 12);   // £520/month
    const monthlyPensionUpper = round2(PENSION.UPPER_LIMIT / 12);   // £4,189/month
    if (currentMonthGross > monthlyPensionLower) {
      const qualifying = Math.min(currentMonthGross, monthlyPensionUpper) - monthlyPensionLower;
      employeePension = round2(qualifying * (options.pensionEmployeeRate ?? PENSION.DEFAULT_EMPLOYEE_RATE));
      employerPension = round2(qualifying * (options.pensionEmployerRate ?? PENSION.DEFAULT_EMPLOYER_RATE));
    }
  }

  // Student loan: on current month
  let studentLoan = 0;
  const plan = options.studentLoan ?? 'NONE';
  if (plan !== 'NONE') {
    const { threshold, rate } = STUDENT_LOAN[plan];
    const monthlyThreshold = threshold / 12;
    if (currentMonthGross > monthlyThreshold) {
      studentLoan = round2((currentMonthGross - monthlyThreshold) * rate);
    }
  }

  const totalDeductions  = round2(incomeTax + nationalInsurance + employeePension + studentLoan);
  const netPay           = round2(currentMonthGross - totalDeductions);
  const effectiveTaxRate = currentMonthGross > 0
    ? round2((totalDeductions / currentMonthGross) * 100) : 0;

  // Estimate the first month this worker starts paying tax (useful for mid-year starters)
  const firstTaxPayingMonth = estimateFirstTaxMonth(
    currentMonthGross, taxMonth, priorGross, annualAllowance
  );

  return {
    annualGross:      round2(currentMonthGross * 12),
    monthlyGross:     currentMonthGross,
    incomeTax,
    nationalInsurance,
    employeePension,
    studentLoan,
    totalDeductions,
    netPay,
    employerNI,
    employerPension,
    pensionOptedOut:  options.pensionOptOut ?? false,
    effectiveTaxRate,
    taxBasis:         'CUMULATIVE',
    taxMonth,
    cumulativeGross,
    cumulativeTaxOwed,
    taxFreeThisMonth: taxFreeThisMonth === Infinity ? 0 : taxFreeThisMonth,
    firstTaxPayingMonth,
  };
};

/**
 * Estimate the first tax month when a mid-year starter begins paying income tax.
 * Returns undefined if they're already paying or have prior earnings.
 */
const estimateFirstTaxMonth = (
  monthlyGross: number,
  startTaxMonth: number,
  priorGross: number,
  annualAllowance: number
): number | undefined => {
  if (priorGross > 0 || annualAllowance <= 0 || annualAllowance === Infinity) return undefined;
  const monthlyAllowance = annualAllowance / 12;
  // Each month: cumulative gross = monthlyGross × monthsWorked, cumulative allowance = monthlyAllowance × month
  // Tax starts when: monthlyGross × worked > monthlyAllowance × month
  // i.e. when worked / month > monthlyAllowance / monthlyGross
  // Since worked = month - startTaxMonth + 1:
  // month - startTaxMonth + 1 > monthlyAllowance / monthlyGross × month
  // month(1 - ma/mg) > startTaxMonth - 1
  const ratio = monthlyAllowance / monthlyGross;
  if (ratio >= 1) return undefined; // they'd never pay tax all year
  const month = Math.ceil((startTaxMonth - 1) / (1 - ratio));
  return month > 12 ? undefined : Math.max(startTaxMonth, month);
};

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Main weekly payslip calculator (2024/25 rates)
 */
export const calculateWeeklyPayslip = (
  annualGross: number,
  options: PayslipOptions = {}
): PayslipResult => {
  const weeklyGross = annualGross / 52;
  const weeklyNI = calcWeeklyEmployeeNI(annualGross);
  const weeklyTax = calcWeeklyTax(annualGross, options);
  const weeklyPension = calcWeeklyEmployeePension(annualGross, options);
  const weeklyStudentLoan = calcWeeklyStudentLoan(annualGross, options.studentLoan ?? 'NONE');
  const weeklyDeductions = weeklyNI + weeklyTax + weeklyPension + weeklyStudentLoan;
  const weeklyNetPay = weeklyGross - weeklyDeductions;
  const weeklyEmployerNI = calcWeeklyEmployerNI(annualGross);
  const weeklyEmployerPension = calcWeeklyEmployerPension(annualGross, options);

  // Calculate effective tax rate
  const effectiveTaxRate = weeklyGross > 0 ? (weeklyTax / weeklyGross) * 100 : 0;

  // Cumulative PAYE support (simplified for weekly)
  const taxBasis = options.taxBasis ?? 'CUMULATIVE';
  const taxMonth = options.taxMonth ?? currentTaxMonth();
  const cumulativeGross = options.cumulativeGross ?? 0;
  const cumulativeTaxPaid = options.cumulativeTaxPaid ?? 0;

  return {
    annualGross,
    monthlyGross: annualGross / 12, // Keep monthly for compatibility
    incomeTax: weeklyTax,
    nationalInsurance: weeklyNI,
    employeePension: weeklyPension,
    studentLoan: weeklyStudentLoan,
    totalDeductions: weeklyDeductions,
    netPay: weeklyNetPay,
    employerNI: weeklyEmployerNI,
    employerPension: weeklyEmployerPension,
    pensionOptedOut: options.pensionOptOut ?? false,
    effectiveTaxRate,
    taxBasis,
    taxMonth,
    cumulativeGross,
    cumulativeTaxOwed: weeklyTax * 52, // Annual estimate
    taxFreeThisMonth: 0, // Simplified for weekly
    firstTaxPayingMonth: undefined, // Simplified for weekly
  };
};

/**
 * Main monthly payslip calculator (2024/25 rates)
 */
export const calculateMonthlyPayslip = (
  annualGross: number,
  options: PayslipOptions = {}
): PayslipResult => {
  const basis = options.taxBasis ?? 'CUMULATIVE';
  if (basis === 'W1M1') {
    return calculateW1M1Monthly(annualGross, options);
  }
  const monthlyGross = round2(annualGross / 12);
  return calculateCumulativeMonthly(monthlyGross, options);
};

export const calculateFullBreakdown = (
  annualGross: number,
  options: PayslipOptions = {}
): PayslipBreakdown => {
  const monthly = calculateMonthlyPayslip(annualGross, options);
  const annualStudentLoan = calcAnnualStudentLoan(annualGross, options.studentLoan ?? 'NONE');
  return {
    annual: {
      gross:       annualGross,
      tax:         calcAnnualTax(annualGross, options),
      ni:          calcAnnualEmployeeNI(annualGross),
      pension:     calcAnnualEmployeePension(annualGross, options),
      studentLoan: annualStudentLoan,
      netPay:      round2(annualGross - calcAnnualTax(annualGross, options) - calcAnnualEmployeeNI(annualGross) - calcAnnualEmployeePension(annualGross, options) - annualStudentLoan),
    },
    monthly,
    options,
  };
};

// ─── Utility: current UK tax month ───────────────────────────────────────────

/**
 * Returns the current UK tax month (1 = April, 2 = May, … 12 = March).
 * The UK tax year runs from 6 April to 5 April.
 */
export const currentTaxMonth = (): number => {
  const now   = new Date();
  const month = now.getMonth(); // 0=Jan
  // April = month 3, so tax month 1 = calendar month 3
  const taxMonth = ((month - 3 + 12) % 12) + 1;
  return taxMonth;
};

/** Convert a calendar month (0-11, Jan=0) to a tax month label */
export const taxMonthLabel = (taxMonth: number): string => {
  const names = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return names[(taxMonth - 1) % 12];
};

export const validateTaxCode = (code: string): boolean => {
  const c = code.toUpperCase().trim();
  if (['BR', '0T', 'NT', 'D0', 'D1'].includes(c)) return true;
  const m = c.match(/^(\d+)[A-Z]$/);
  return !!m && parseInt(m[1]) <= 9999;
};

export const validatePensionRate = (rate: number): boolean => rate >= 0 && rate <= 1;
