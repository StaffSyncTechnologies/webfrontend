/**
 * Payslip Types for StaffSync Frontend
 */

export type TaxBasis = 'CUMULATIVE' | 'W1M1';

export interface PayslipOptions {
  pensionOptOut?: boolean;
  pensionEmployeeRate?: number;
  pensionEmployerRate?: number;
  studentLoan?: StudentLoanPlan;
  blindPersonsAllowance?: boolean;
  marriageAllowance?: boolean;
  taxCode?: string;
  // Cumulative PAYE fields (UK statutory requirement)
  taxBasis?: TaxBasis;           // CUMULATIVE (normal) or W1M1 (emergency/non-cumulative)
  taxMonth?: number;             // 1=April ... 12=March — the current pay month
  cumulativeGross?: number;      // gross pay earned in ALL prior months this tax year
  cumulativeTaxPaid?: number;    // income tax paid in ALL prior months this tax year
  cumulativeNIPaid?: number;     // employee NI paid in ALL prior months this tax year
}

export type StudentLoanPlan = 'NONE' | 'PLAN1' | 'PLAN2' | 'PLAN4' | 'POSTGRAD';

export interface PayslipResult {
  annualGross: number;
  monthlyGross: number;
  incomeTax: number;
  nationalInsurance: number;
  employeePension: number;
  studentLoan: number;
  totalDeductions: number;
  netPay: number;
  employerNI: number;
  employerPension: number;
  pensionOptedOut: boolean;
  effectiveTaxRate: number;
  // Cumulative PAYE fields (populated when taxBasis = 'CUMULATIVE')
  taxBasis: TaxBasis;
  taxMonth: number;
  cumulativeGross: number;
  cumulativeTaxOwed: number;
  taxFreeThisMonth: number;       // unused allowance carried from prior months (£0 for W1M1)
  firstTaxPayingMonth?: number;   // estimated month when tax starts (mid-year starters)
}

export interface PayslipBreakdown {
  annual: {
    gross: number;
    tax: number;
    ni: number;
    pension: number;
    studentLoan: number;
    netPay: number;
  };
  monthly: PayslipResult;
  options: PayslipOptions;
}

export interface WorkerPayslipSettings {
  id: string;
  workerId: string;
  organizationId: string;
  taxCode: string;
  studentLoanPlan: StudentLoanPlan;
  pensionOptOut: boolean;
  pensionEmployeeRate: number;
  pensionEmployerRate: number;
  blindPersonsAllowance: boolean;
  marriageAllowance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayslipRecord {
  id: string;
  workerId: string;
  organizationId: string;
  payPeriod: string;
  annualGross: number;
  monthlyGross: number;
  incomeTax: number;
  nationalInsurance: number;
  employeePension: number;
  studentLoan: number;
  totalDeductions: number;
  netPay: number;
  employerNI: number;
  employerPension: number;
  pensionOptedOut: boolean;
  effectiveTaxRate: number;
  taxCode: string;
  studentLoanPlan: StudentLoanPlan;
  pensionEmployeeRate: number;
  pensionEmployerRate: number;
  blindPersonsAllowance: boolean;
  marriageAllowance: boolean;
  payDate: string;
  createdAt: string;
  updatedAt: string;
}
