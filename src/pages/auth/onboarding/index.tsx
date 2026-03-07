import { useState, useEffect, useRef } from 'react';
import { Box, styled, TextField, Select, MenuItem, IconButton, InputAdornment, Alert, CircularProgress } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ArrowBack, ArrowForward, KeyboardArrowDown, Visibility, VisibilityOff, HelpOutline, Business, Groups, Person, Storefront } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContainer } from '../../../components/layout';
import PricingPlans from '../../../components/shared/PricingPlans';
import OTPInput from '../../../components/controls/OTPInput';
import { colors } from '../../../utilities/colors';
import { useRegister, useVerifyOtp, useSendOtp } from '../../../hooks/api/useAuthApi';
import { useAppDispatch } from '../../../store';
import { setAuth } from '../../../store/slices/authPersistSlice';
import type { AuthResponse } from '../../../types/api';

// ============ SHARED STYLED COMPONENTS ============
const Container = styled(Box)({
  width: '100%',
  maxWidth: '700px',
  margin: '0 auto',
});

const GoBackButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  padding: 0,
  marginBottom: '24px',
  '&:hover': {
    color: colors.primary.navy,
  },
});

const StepIndicator = styled(Box)({
  marginBottom: '32px',
});

const StepText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '12px',
});

const ProgressBar = styled(Box)({
  display: 'flex',
  gap: '8px',
});

const ProgressStep = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  flex: 1,
  height: '4px',
  borderRadius: '2px',
  backgroundColor: active ? colors.primary.blue : '#E5E7EB',
}));

const Title = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '8px',
  textAlign: 'center',
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '32px',
  textAlign: 'center',
});

const FormGrid = styled(Box)({
  display: 'grid',
  gap: '20px',
  marginBottom: '32px',
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
  },
});

const FormGroup = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const Label = styled('label')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.text.primary,
  '& span': {
    color: '#EF4444',
  },
});

const StyledInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: colors.secondary.white,
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: colors.primary.blue,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.blue,
      borderWidth: '1px',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
  },
});

const StyledSelect = styled(Select)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  borderRadius: '8px',
  backgroundColor: colors.secondary.white,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.blue,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.blue,
    borderWidth: '1px',
  },
  '& .MuiSelect-select': {
    padding: '14px 16px',
  },
});

const ContinueButton = styled('button')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px 32px',
  backgroundColor: colors.primary.navy,
  color: colors.secondary.white,
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#1a1a4e',
  },
  '&:disabled': {
    backgroundColor: '#9CA3AF',
    cursor: 'not-allowed',
  },
});

const LoginLink = styled(Box)({
  textAlign: 'center',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  marginTop: '24px',
  '& a': {
    color: colors.primary.navy,
    fontWeight: 600,
    textDecoration: 'none',
    marginLeft: '4px',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

// ============ STEP 1: ACCOUNT TYPE COMPONENTS ============
const CardsContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginBottom: '32px',
  '@media (max-width: 500px)': {
    gridTemplateColumns: '1fr',
  },
});

const AccountCard = styled(Box)<{ selected?: boolean }>(({ selected }) => ({
  padding: '24px',
  borderRadius: '12px',
  border: `2px solid ${selected ? colors.primary.blue : '#E5E7EB'}`,
  backgroundColor: selected ? 'rgba(0, 163, 255, 0.05)' : colors.secondary.white,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    borderColor: colors.primary.blue,
  },
}));

const RadioIndicator = styled(Box)<{ selected?: boolean }>(({ selected }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  border: `2px solid ${selected ? colors.primary.blue : '#E5E7EB'}`,
  backgroundColor: selected ? colors.primary.blue : 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::after': {
    content: '""',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: selected ? colors.secondary.white : 'transparent',
  },
}));

const IconWrapper = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: colors.primary.blue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': {
    color: colors.secondary.white,
    fontSize: '24px',
  },
});

const CardTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const CardSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '12px',
});

const FeatureList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

const FeatureItem = styled('li')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  marginBottom: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&::before': {
    content: '"•"',
    color: colors.text.secondary,
  },
});

// ============ STEP 3: PASSWORD HINT ============
const PasswordHint = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  marginBottom: '24px',
  marginTop: '-16px',
  '& svg': {
    fontSize: '18px',
    color: '#9CA3AF',
  },
});



const Timer = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  float: 'right',
});

const ResendLink = styled(Box)({
  textAlign: 'center',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  marginBottom: '32px',
  '& button': {
    background: 'none',
    border: 'none',
    color: colors.primary.navy,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    marginLeft: '4px',
    '&:hover': {
      textDecoration: 'underline',
    },
    '&:disabled': {
      color: '#9CA3AF',
      cursor: 'not-allowed',
    },
  },
});

// ============ DATA ============
const industries = [
  'Healthcare & Medical', 'Hospitality & Catering', 'Warehouse & Logistics',
  'Construction', 'Retail', 'Security', 'Cleaning Services', 'Events & Entertainment',
  'Manufacturing', 'Other',
];

const workerCounts = ['1-10', '11-50', '51-100', '101-500', '500+'];

const jobTitles = [
  'CEO / Founder', 'Managing Director', 'Operations Manager', 'HR Manager',
  'Recruitment Manager', 'Branch Manager', 'Administrator', 'Other',
];

const stepLabels = [
  'Onboarding', 'Organizational Details', 'Admin Account Setup', 'Admin Account Setup', 'Choose Plan'
];

// ============ MAIN COMPONENT ============
const OnboardingFlow = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Store auth data from verify-otp for use after plan selection
  const authDataRef = useRef<AuthResponse | null>(null);
  
  // API hooks
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();
  
  // Step 1 state
  const [accountType, setAccountType] = useState<string | null>(null);
  
  // Step 2 state
  const [orgData, setOrgData] = useState({
    organizationName: '', organizationEmail: '', tradingName: '', companyNumber: '',
    industry: '', numberOfWorkers: '', location: '', website: '',
  });
  
  // Step 3 state
  const [adminData, setAdminData] = useState({
    fullName: '', email: '', jobTitle: '', phoneNumber: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 3b state (OTP)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Handlers
  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleOrgSelectChange = (name: string) => (e: SelectChangeEvent<unknown>) => {
    setOrgData(prev => ({ ...prev, [name]: e.target.value as string }));
  };
  
  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAdminSelectChange = (name: string) => (e: SelectChangeEvent<unknown>) => {
    setAdminData(prev => ({ ...prev, [name]: e.target.value as string }));
  };
  
  
  // Start OTP timer
  const startOtpTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setTimer(59);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const handleBack = () => {
    setError(null);
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleContinue = async () => {
    setError(null);
    
    // Step 1: Redirect team/client to invite code flow, company/agency continue
    if (currentStep === 1) {
      if (accountType === 'team') {
        navigate('/accept-invite');
        return;
      }
      if (accountType === 'client') {
        navigate('/client/register');
        return;
      }
      // Company/Agency continues to Step 2
      setCurrentStep(2);
      return;
    }
    
    // Step 3 → Step 4: Call register API
    if (currentStep === 3) {
      try {
        await registerMutation.mutateAsync({
          // Organization fields
          organizationName: orgData.organizationName,
          organizationEmail: orgData.organizationEmail || undefined,
          tradingName: orgData.tradingName || undefined,
          companyNumber: orgData.companyNumber || undefined,
          industry: orgData.industry || undefined,
          numberOfWorkers: orgData.numberOfWorkers || undefined,
          location: orgData.location || undefined,
          website: orgData.website || undefined,
          deploymentMode: accountType === 'agency' ? 'AGENCY' : 'DIRECT_COMPANY',
          // Admin fields
          fullName: adminData.fullName,
          email: adminData.email,
          password: adminData.password,
          phone: adminData.phoneNumber || undefined,
          jobTitle: adminData.jobTitle || undefined,
        });
        // On success, move to OTP step
        setCurrentStep(4);
        startOtpTimer();
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
      }
      return;
    }
    
    // Step 4 → Step 5: Call verify-otp API
    if (currentStep === 4) {
      const otpCode = otp.join('');
      try {
        const authResponse = await verifyOtpMutation.mutateAsync({
          email: adminData.email,
          code: otpCode,
        });
        // Store auth data for use after plan selection
        authDataRef.current = authResponse;
        // On success, move to pricing step
        setCurrentStep(5);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Invalid verification code. Please try again.');
      }
      return;
    }
    
    // Other steps: just advance
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleResendOtp = async () => {
    setError(null);
    try {
      await sendOtpMutation.mutateAsync({ email: adminData.email });
      setOtp(['', '', '', '', '', '']);
      startOtpTimer();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to resend code.');
    }
  };
  
  const handleSelectPlan = (planId: string) => {
    if (planId === 'enterprise') {
      navigate('/contact-us');
    } else {
      // Login user with stored auth data, then navigate to dashboard
      if (authDataRef.current) {
        dispatch(setAuth({
          user: authDataRef.current.user,
          token: authDataRef.current.token,
          refreshToken: authDataRef.current.refreshToken,
          expiresIn: authDataRef.current.expiresIn,
        }));
      }
      navigate('/dashboard');
    }
  };
  
  const isLoading = registerMutation.isPending || verifyOtpMutation.isPending || sendOtpMutation.isPending;

  const getMaxWidth = () => {
    if (currentStep === 5) return 900;
    if (currentStep === 1 || currentStep === 4) return 600;
    return 700;
  };

  const isStep1Valid = accountType !== null;
  const isStep2Valid = orgData.organizationName && orgData.organizationEmail && orgData.industry && orgData.numberOfWorkers;
  const isStep3Valid = adminData.fullName && adminData.email && adminData.jobTitle && adminData.phoneNumber && 
                       adminData.password && adminData.confirmPassword && adminData.password === adminData.confirmPassword;
  const isOtpValid = otp.every(d => d !== '');

  return (
    <AuthContainer maxWidth={getMaxWidth()}>
      <Container sx={{ maxWidth: getMaxWidth() }}>
        {currentStep > 1 && (
          <GoBackButton onClick={handleBack}>
            <ArrowBack sx={{ fontSize: 18 }} />
            Go back
          </GoBackButton>
        )}

        <StepIndicator>
          <StepText>Step {currentStep > 4 ? 4 : currentStep} of 4: {stepLabels[currentStep - 1]}</StepText>
          <ProgressBar>
            <ProgressStep active={currentStep >= 1} />
            <ProgressStep active={currentStep >= 2} />
            <ProgressStep active={currentStep >= 3} />
            <ProgressStep active={currentStep >= 5} />
          </ProgressBar>
        </StepIndicator>

        {/* STEP 1: Account Type */}
        {currentStep === 1 && (
          <>
            <Title>Join STAFFSYNC</Title>
            <Subtitle>Choose your account type to get started</Subtitle>
            <CardsContainer>
              <AccountCard selected={accountType === 'company'} onClick={() => setAccountType('company')}>
                <RadioIndicator selected={accountType === 'company'} />
                <IconWrapper><Business /></IconWrapper>
                <CardTitle>COMPANY</CardTitle>
                <CardSubtitle>I hire workers</CardSubtitle>
                <FeatureList>
                  <FeatureItem>Direct hiring</FeatureItem>
                  <FeatureItem>Internal staff</FeatureItem>
                  <FeatureItem>Single location</FeatureItem>
                </FeatureList>
              </AccountCard>
              <AccountCard selected={accountType === 'agency'} onClick={() => setAccountType('agency')}>
                <RadioIndicator selected={accountType === 'agency'} />
                <IconWrapper><Business /></IconWrapper>
                <CardTitle>AGENCY</CardTitle>
                <CardSubtitle>I supply workers</CardSubtitle>
                <FeatureList>
                  <FeatureItem>Multiple clients</FeatureItem>
                  <FeatureItem>Worker pool</FeatureItem>
                  <FeatureItem>Multi-location</FeatureItem>
                </FeatureList>
              </AccountCard>
              <AccountCard selected={accountType === 'team'} onClick={() => setAccountType('team')}>
                <RadioIndicator selected={accountType === 'team'} />
                <IconWrapper><Groups /></IconWrapper>
                <CardTitle>TEAM MEMBER</CardTitle>
                <CardSubtitle>Join with invite code</CardSubtitle>
                <FeatureList>
                  <FeatureItem>Join existing team</FeatureItem>
                  <FeatureItem>Manage shifts</FeatureItem>
                  <FeatureItem>Staff dashboard</FeatureItem>
                </FeatureList>
              </AccountCard>
              <AccountCard selected={accountType === 'client'} onClick={() => setAccountType('client')}>
                <RadioIndicator selected={accountType === 'client'} />
                <IconWrapper><Storefront /></IconWrapper>
                <CardTitle>CLIENT</CardTitle>
                <CardSubtitle>Client portal access</CardSubtitle>
                <FeatureList>
                  <FeatureItem>Request workers</FeatureItem>
                  <FeatureItem>View timesheets</FeatureItem>
                  <FeatureItem>Manage invoices</FeatureItem>
                </FeatureList>
              </AccountCard>
            </CardsContainer>
            <ContinueButton onClick={handleContinue} disabled={!isStep1Valid}>
              Continue <ArrowForward sx={{ fontSize: 18 }} />
            </ContinueButton>
            <LoginLink>Already have an account?<a onClick={() => navigate('/login')}>Login</a></LoginLink>
          </>
        )}

        {/* STEP 2: Organization Details */}
        {currentStep === 2 && (
          <>
            <Title>Join STAFFSYNC</Title>
            <Subtitle>Help us customize your experience by providing your business details</Subtitle>
            <FormGrid>
              <FormGroup>
                <Label>Organization Name<span>*</span></Label>
                <StyledInput name="organizationName" placeholder="Enter organization name" value={orgData.organizationName} onChange={handleOrgChange} variant="outlined" fullWidth />
              </FormGroup>
              <FormGroup>
                <Label>Organization Email address<span>*</span></Label>
                <StyledInput name="organizationEmail" placeholder="Enter email address" value={orgData.organizationEmail} onChange={handleOrgChange} variant="outlined" fullWidth type="email" />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label>Trading Name (optional)</Label>
                  <StyledInput name="tradingName" placeholder="Enter trading name" value={orgData.tradingName} onChange={handleOrgChange} variant="outlined" fullWidth />
                </FormGroup>
                <FormGroup>
                  <Label>Company Number (optional)</Label>
                  <StyledInput name="companyNumber" placeholder="Enter company number" value={orgData.companyNumber} onChange={handleOrgChange} variant="outlined" fullWidth />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Industry<span>*</span></Label>
                  <StyledSelect value={orgData.industry} onChange={handleOrgSelectChange('industry')} displayEmpty IconComponent={KeyboardArrowDown}>
                    <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select industry type</span></MenuItem>
                    {industries.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label>Number of workers<span>*</span></Label>
                  <StyledSelect value={orgData.numberOfWorkers} onChange={handleOrgSelectChange('numberOfWorkers')} displayEmpty IconComponent={KeyboardArrowDown}>
                    <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select number</span></MenuItem>
                    {workerCounts.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </StyledSelect>
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Location</Label>
                  <StyledInput name="location" placeholder="Enter company address" value={orgData.location} onChange={handleOrgChange} variant="outlined" fullWidth />
                </FormGroup>
                <FormGroup>
                  <Label>Website (optional)</Label>
                  <StyledInput name="website" placeholder="https://" value={orgData.website} onChange={handleOrgChange} variant="outlined" fullWidth />
                </FormGroup>
              </FormRow>
            </FormGrid>
            <ContinueButton onClick={handleContinue} disabled={!isStep2Valid}>
              Continue <ArrowForward sx={{ fontSize: 18 }} />
            </ContinueButton>
          </>
        )}

        {/* STEP 3: Admin Account */}
        {currentStep === 3 && (
          <>
            <Title>Create Admin Account</Title>
            <Subtitle>This account will have full access to manage the organizational settings</Subtitle>
            <FormGrid>
              <FormGroup>
                <Label>Full Name<span>*</span></Label>
                <StyledInput name="fullName" placeholder="Enter your full name" value={adminData.fullName} onChange={handleAdminChange} variant="outlined" fullWidth />
              </FormGroup>
              <FormGroup>
                <Label>Email Address<span>*</span></Label>
                <StyledInput name="email" placeholder="Enter your email" value={adminData.email} onChange={handleAdminChange} variant="outlined" fullWidth type="email" />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label>Job Title<span>*</span></Label>
                  <StyledSelect value={adminData.jobTitle} onChange={handleAdminSelectChange('jobTitle')} displayEmpty IconComponent={KeyboardArrowDown}>
                    <MenuItem value="" disabled><span style={{ color: '#9CA3AF' }}>Select job title</span></MenuItem>
                    {jobTitles.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label>Phone Number<span>*</span></Label>
                  <StyledInput name="phoneNumber" placeholder="Enter phone number" value={adminData.phoneNumber} onChange={handleAdminChange} variant="outlined" fullWidth />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Password<span>*</span></Label>
                  <StyledInput name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={adminData.password} onChange={handleAdminChange} variant="outlined" fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9CA3AF' }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Confirm password<span>*</span></Label>
                  <StyledInput name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={adminData.confirmPassword} onChange={handleAdminChange} variant="outlined" fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#9CA3AF' }}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                  />
                </FormGroup>
              </FormRow>
            </FormGrid>
            <PasswordHint><HelpOutline />Password must contain uppercase, lowercase, numbers & symbols</PasswordHint>
            <ContinueButton onClick={handleContinue} disabled={!isStep3Valid || isLoading}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : <>Continue <ArrowForward sx={{ fontSize: 18 }} /></>}
            </ContinueButton>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </>
        )}

        {/* STEP 3B: OTP Verification */}
        {currentStep === 4 && (
          <>
            <Title>Verify Admin Account</Title>
            <Subtitle>Enter the OTP code sent to your email address {adminData.email}.</Subtitle>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <FormGroup sx={{ marginBottom: '32px' }}>
              <Label>OTP Code<span>*</span></Label>
              <OTPInput 
                value={otp} 
                onChange={setOtp}
                onComplete={() => handleContinue()}
              />
              <Timer sx={{ marginTop: '12px' }}>00:{timer.toString().padStart(2, '0')}s</Timer>
            </FormGroup>
            <ResendLink>Didn't receive code?<button onClick={handleResendOtp} disabled={timer > 0 || sendOtpMutation.isPending}>{sendOtpMutation.isPending ? 'Sending...' : 'Resend'}</button></ResendLink>
            <ContinueButton onClick={handleContinue} disabled={!isOtpValid || isLoading}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Verify Code'}
            </ContinueButton>
          </>
        )}

        {/* STEP 4: Choose Plan */}
        {currentStep === 5 && (
          <PricingPlans onSelectPlan={handleSelectPlan} />
        )}
      </Container>
    </AuthContainer>
  );
};

export default OnboardingFlow;
