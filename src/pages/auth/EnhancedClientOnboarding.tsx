// ============================================================
// ENHANCED CLIENT ONBOARDING FLOW
// Supports multi-agency client registration
// ============================================================

import { useState, useEffect } from 'react';
import { Box, styled, TextField, Button, Alert, CircularProgress, Typography, Card, CardContent, Chip, Stepper, Step, StepLabel } from '@mui/material';
import { ArrowBack, ArrowForward, Business, AddBusiness, Login, CheckCircle } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContainer } from '../../components/layout';
import { Input } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { useValidateClientCodeMutation, useRegisterClientMutation, useJoinAgencyMutation, useClientLoginMutation } from '../../store/slices/clientSlice';
import { useToast } from '../../hooks';

// ============ STYLED COMPONENTS ============
const Container = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
});

const Header = styled(Box)({
  textAlign: 'center',
  marginBottom: '32px',
});

const Title = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '32px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px 0',
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: '0 0 24px 0',
  lineHeight: 1.5,
});

const AgencyCard = styled(Card)({
  marginBottom: '16px',
  border: `2px solid ${colors.secondary.lightGray}`,
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: colors.primary.blue,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
});

const AgencyCardContent = styled(CardContent)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '20px',
});

const AgencyLogo = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  backgroundColor: colors.secondary.lightGray,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
});

const AgencyInfo = styled(Box)({
  flex: 1,
});

const AgencyName = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '4px',
});

const AgencyStatus = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
});

const FormSection = styled(Box)({
  backgroundColor: colors.secondary.white,
  padding: '24px',
  borderRadius: '12px',
  border: `1px solid ${colors.secondary.lightGray}`,
  marginBottom: '24px',
});

const FormTitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '20px',
});

const ButtonRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
});

// ============ TYPES ============
interface InviteValidation {
  valid: boolean;
  agency: {
    id: string;
    name: string;
    logo?: string;
    primaryColor?: string;
  };
  isNewUser: boolean;
  existingAgencies: Array<{
    id: string;
    name: string;
    clientCompanyId: string;
    isPrimary: boolean;
  }>;
  inviteEmail: string;
}

// ============ COMPONENT ============
export function EnhancedClientOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  
  // Get invite code from URL or state
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '');
  const [step, setStep] = useState<'validate' | 'register' | 'join' | 'success'>('validate');
  const [validation, setValidation] = useState<InviteValidation | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    company: {
      name: '',
      registrationNumber: '',
      industry: '',
      address: '',
      city: '',
      postcode: '',
      contactPhone: '',
      billingEmail: '',
    },
    admin: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      jobTitle: '',
    },
  });
  
  const [joinFormData, setJoinFormData] = useState({
    email: '',
    password: '',
  });

  // API mutations
  const [validateCode, { isLoading: validating }] = useValidateClientCodeMutation();
  const [registerClient, { isLoading: registering }] = useRegisterClientMutation();
  const [joinAgency, { isLoading: joining }] = useJoinAgencyMutation();
  const [login, { isLoading: loggingIn }] = useClientLoginMutation();

  // Validate invite code
  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    try {
      const result = await validateCode({ inviteCode: inviteCode.trim() }).unwrap();
      
      if (result.valid && result.agency) {
        setValidation(result);
        
        // Pre-fill email if available
        if (result.inviteEmail) {
          setFormData(prev => ({
            ...prev,
            admin: { ...prev.admin, email: result.inviteEmail }
          }));
          setJoinFormData(prev => ({ ...prev, email: result.inviteEmail }));
        }
        
        // Determine next step based on user status
        if (result.isNewUser) {
          setStep('register');
        } else {
          setStep('join');
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Invalid invite code');
    }
  };

  // Register new client
  const handleRegister = async () => {
    if (!validation) return;

    try {
      const result = await registerClient({
        inviteCode: inviteCode.trim(),
        company: {
          name: formData.company.name,
          registrationNumber: formData.company.registrationNumber,
          industry: formData.company.industry,
          address: formData.company.address,
          city: formData.company.city,
          postcode: formData.company.postcode,
          contactPhone: formData.company.contactPhone,
          billingEmail: formData.company.billingEmail,
        },
        admin: {
          fullName: formData.admin.fullName,
          email: formData.admin.email,
          password: formData.admin.password,
          phone: formData.admin.phone,
          jobTitle: formData.admin.jobTitle,
        },
      }).unwrap();

      if (result.success && result.data) {
        // Auto-login after registration
        await login({
          email: formData.admin.email,
          password: formData.admin.password,
        }).unwrap();

        setStep('success');
        toast.success('Registration successful! Welcome to StaffSync!');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration failed');
    }
  };

  // Join existing agency
  const handleJoinAgency = async () => {
    if (!validation) return;

    try {
      const result = await joinAgency({
        inviteCode: inviteCode.trim(),
        email: joinFormData.email,
        password: joinFormData.password,
      }).unwrap();

      if (result.success && result.data) {
        // Auto-login after joining
        await login({
          email: joinFormData.email,
          password: joinFormData.password,
        }).unwrap();

        setStep('success');
        toast.success(`Successfully joined ${validation.agency.name}!`);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to join agency');
    }
  };

  // Render validation step
  if (step === 'validate') {
    return (
      <AuthContainer>
        <Container>
          <Header>
            <Title>Join Agency</Title>
            <Subtitle>Enter your invite code to get started with StaffSync</Subtitle>
          </Header>

          <FormSection>
            <FormTitle>Enter Invite Code</FormTitle>
            <Input
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteCode(e.target.value.toUpperCase())}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleValidateCode()}
              disabled={validating}
            />
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleValidateCode}
              disabled={validating || !inviteCode.trim()}
              startIcon={validating ? <CircularProgress size={16} /> : <ArrowForward />}
              sx={{ marginTop: '16px' }}
            >
              {validating ? 'Validating...' : 'Continue'}
            </Button>
          </FormSection>

          <ButtonRow>
            <Button
              variant="outlined"
              onClick={() => navigate('/client-login')}
              startIcon={<ArrowBack />}
            >
              Back to Login
            </Button>
          </ButtonRow>
        </Container>
      </AuthContainer>
    );
  }

  // Render registration step (new users)
  if (step === 'register' && validation) {
    return (
      <AuthContainer>
        <Container>
          <Header>
            <Title>Complete Registration</Title>
            <Subtitle>You've been invited to join {validation.agency.name}</Subtitle>
          </Header>

          <Alert severity="info" sx={{ marginBottom: '24px' }}>
            <strong>New User Registration</strong><br />
            Please complete your company and admin information to get started.
          </Alert>

          <FormSection>
            <FormTitle>Company Information</FormTitle>
            <TextField
              label="Company Name"
              fullWidth
              value={formData.company.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, name: e.target.value }
              }))}
              margin="normal"
            />
            <TextField
              label="Registration Number"
              fullWidth
              value={formData.company.registrationNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, registrationNumber: e.target.value }
              }))}
              margin="normal"
            />
            <TextField
              label="Industry"
              fullWidth
              value={formData.company.industry}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, industry: e.target.value }
              }))}
              margin="normal"
            />
            <TextField
              label="Address"
              fullWidth
              value={formData.company.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, address: e.target.value }
              }))}
              margin="normal"
            />
            <TextField
              label="City"
              fullWidth
              value={formData.company.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, city: e.target.value }
              }))}
              margin="normal"
            />
            <TextField
              label="Postcode"
              fullWidth
              value={formData.company.postcode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                company: { ...prev.company, postcode: e.target.value }
              }))}
              margin="normal"
            />
          </FormSection>

          <FormSection>
            <FormTitle>Admin Information</FormTitle>
            <TextField
              label="Full Name"
              fullWidth
              value={formData.admin.fullName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                admin: { ...prev.admin, fullName: e.target.value }
              }))}
              margin="normal"
              required
            />
            <TextField
              label="Email"
              fullWidth
              value={formData.admin.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                admin: { ...prev.admin, email: e.target.value }
              }))}
              margin="normal"
              type="email"
              required
            />
            <TextField
              label="Password"
              fullWidth
              value={formData.admin.password}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                admin: { ...prev.admin, password: e.target.value }
              }))}
              margin="normal"
              type="password"
              required
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.admin.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                admin: { ...prev.admin, phone: e.target.value }
              }))}
              margin="normal"
            />
            <TextField
              label="Job Title"
              fullWidth
              value={formData.admin.jobTitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                admin: { ...prev.admin, jobTitle: e.target.value }
              }))}
              margin="normal"
            />
          </FormSection>

          <ButtonRow>
            <Button
              variant="outlined"
              onClick={() => setStep('validate')}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={registering || !formData.company.name || !formData.admin.fullName || !formData.admin.email || !formData.admin.password}
              startIcon={registering ? <CircularProgress size={16} /> : <CheckCircle />}
            >
              {registering ? 'Registering...' : 'Complete Registration'}
            </Button>
          </ButtonRow>
        </Container>
      </AuthContainer>
    );
  }

  // Render join agency step (existing users)
  if (step === 'join' && validation) {
    return (
      <AuthContainer>
        <Container>
          <Header>
            <Title>Join Additional Agency</Title>
            <Subtitle>You've been invited to join {validation.agency.name}</Subtitle>
          </Header>

          <Alert severity="success" sx={{ marginBottom: '24px' }}>
            <strong>Welcome Back!</strong><br />
            We found your existing account. Please login to join this agency.
          </Alert>

          {/* Show existing agencies */}
          {validation.existingAgencies.length > 0 && (
            <FormSection>
              <FormTitle>Your Current Agencies</FormTitle>
              {validation.existingAgencies.map((agency) => (
                <AgencyCard key={agency.id}>
                  <AgencyCardContent>
                    <AgencyLogo>
                      <Business />
                    </AgencyLogo>
                    <AgencyInfo>
                      <AgencyName>{agency.name}</AgencyName>
                      <AgencyStatus>
                        {agency.isPrimary ? (
                          <Chip label="Primary" size="small" color="primary" />
                        ) : (
                          'Additional Agency'
                        )}
                      </AgencyStatus>
                    </AgencyInfo>
                  </AgencyCardContent>
                </AgencyCard>
              ))}
            </FormSection>
          )}

          <FormSection>
            <FormTitle>Login to Join {validation.agency.name}</FormTitle>
            <TextField
              label="Email"
              fullWidth
              value={joinFormData.email}
              onChange={(e) => setJoinFormData(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
              type="email"
              required
            />
            <TextField
              label="Password"
              fullWidth
              value={joinFormData.password}
              onChange={(e) => setJoinFormData(prev => ({ ...prev, password: e.target.value }))}
              margin="normal"
              type="password"
              required
            />
          </FormSection>

          <ButtonRow>
            <Button
              variant="outlined"
              onClick={() => setStep('validate')}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleJoinAgency}
              disabled={joining || loggingIn || !joinFormData.email || !joinFormData.password}
              startIcon={joining || loggingIn ? <CircularProgress size={16} /> : <AddBusiness />}
            >
              {joining || loggingIn ? 'Joining...' : `Join ${validation.agency.name}`}
            </Button>
          </ButtonRow>
        </Container>
      </AuthContainer>
    );
  }

  // Render success step
  if (step === 'success') {
    return (
      <AuthContainer>
        <Container>
          <Header>
            <Title>Welcome to StaffSync!</Title>
            <Subtitle>You've successfully joined your agency</Subtitle>
          </Header>

          <Alert severity="success" sx={{ marginBottom: '24px' }}>
            <CheckCircle sx={{ marginRight: '8px' }} />
            <strong>Success!</strong><br />
            You can now access your client dashboard and manage your workforce.
          </Alert>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/client/dashboard')}
            sx={{ marginTop: '24px' }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </AuthContainer>
    );
  }

  return null;
}
