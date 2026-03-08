import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks';
import { 
  Box, 
  styled, 
  IconButton, 
  InputAdornment, 
  CircularProgress, 
  Alert,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Visibility, VisibilityOff, HelpOutline, ArrowForward } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { AuthContainer } from '../../components/layout';
import { Input } from '../../components/controls';
import { useAuthApi } from '../../store/slices/authSlice';
import { useRegisterClientMutation } from '../../store/slices/clientSlice';
import { getApiError } from '../../services';

const Container = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
});

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

const FormGroup = styled(Box)({
  marginBottom: '20px',
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
  },
});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  marginBottom: '8px',
  '& span': {
    color: '#EF4444',
  },
});


const StyledSelect = styled(Select)({
  width: '100%',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.blue,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.blue,
  },
  '& .MuiSelect-select': {
    padding: '14px 16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const PasswordHint = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  marginTop: '8px',
  '& svg': {
    fontSize: '18px',
    color: '#F59E0B',
  },
});

const SubmitButton = styled('button')({
  width: '100%',
  padding: '14px 24px',
  borderRadius: '8px',
  backgroundColor: colors.primary.navy,
  color: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  marginTop: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#1a2d4a',
  },
  '&:disabled': {
    backgroundColor: '#9CA3AF',
    cursor: 'not-allowed',
  },
});

const JOB_TITLES = [
  'Shift Coordinator',
  'Operations Manager',
  'HR Manager',
  'Team Lead',
  'Administrator',
  'Compliance Officer',
  'Other',
];

interface Props {
  type?: 'client' | 'team';
}

export function CompleteRegistration({ type = 'team' }: Props) {
  useDocumentTitle('Create Account');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { inviteCode?: string; agency?: { name: string }; verified?: boolean } | null;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    phone: '',
    address: '',
    postcode: '',
    password: '',
    confirmPassword: '',
  });

  // RTK Query hooks
  const authApi = useAuthApi();
  const [acceptTeamInvite, { isLoading: teamLoading, error: teamError, isSuccess: teamSuccess }] = 
    authApi.useAcceptInviteCodeMutation();
  const [registerClient, { isLoading: clientLoading, error: clientError, isSuccess: clientSuccess }] = 
    useRegisterClientMutation();

  const isLoading = type === 'client' ? clientLoading : teamLoading;
  const error = type === 'client' ? clientError : teamError;
  const isSuccess = type === 'client' ? clientSuccess : teamSuccess;

  // Redirect if not verified
  useEffect(() => {
    if (!state?.verified) {
      const redirectPath = type === 'client' ? '/client/register' : '/accept-invite';
      navigate(redirectPath);
    }
  }, [state, navigate, type]);

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' } 
        });
      }, 2000);
    }
  }, [isSuccess, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({ ...prev, jobTitle: e.target.value }));
  };

  const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    return hasUppercase && hasLowercase && hasNumber && hasSymbol && hasMinLength;
  };

  const handleSubmit = () => {
    if (!isFormValid || !state?.inviteCode) return;

    if (type === 'client') {
      registerClient({
        inviteCode: state.inviteCode,
        company: {
          name: formData.fullName.split(' ')[0] + "'s Company",
        },
        admin: {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
        },
      });
    } else {
      acceptTeamInvite({
        inviteCode: state.inviteCode,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        address: formData.address,
        postcode: formData.postcode,
      });
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const passwordValid = validatePassword(formData.password);
  const isFormValid = 
    formData.fullName && 
    formData.email && 
    formData.jobTitle && 
    formData.phone && 
    formData.password && 
    formData.confirmPassword &&
    passwordsMatch &&
    passwordValid;
  
  const errorMessage = error ? getApiError(error).message : null;

  if (isSuccess) {
    return (
      <AuthContainer>
        <Container>
          <Box sx={{ textAlign: 'center', padding: '40px 0' }}>
            <Box sx={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: '#D1FAE5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Box sx={{ fontSize: '40px' }}>✓</Box>
            </Box>
            <Title>Account Created!</Title>
            <Subtitle>Redirecting you to login...</Subtitle>
            <CircularProgress size={24} sx={{ marginTop: '16px' }} />
          </Box>
        </Container>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer maxWidth={700}>
      <Container>
        <Title>Create Account</Title>
        <Subtitle>
          {type === 'client' 
            ? 'This account will have full access to your client portal'
            : 'This account will have full access to shift management settings'
          }
        </Subtitle>

        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>
            {errorMessage}
          </Alert>
        )}

        <FormGroup>
          <Input
            label="Full Name"
            required
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Email Address"
            required
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>Job Title<span>*</span></Label>
            <FormControl fullWidth>
              <StyledSelect
                value={formData.jobTitle}
                onChange={handleSelectChange}
                displayEmpty
                renderValue={(value) => value ? String(value) : <span style={{ color: '#9CA3AF' }}>Select job title</span>}
              >
                {JOB_TITLES.map((title) => (
                  <MenuItem key={title} value={title}>{title}</MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <Input
              label="Phone Number"
              required
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Input
              label="Address"
              required
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Postal Code"
              required
              name="postcode"
              placeholder="Enter postal code"
              value={formData.postcode}
              onChange={handleChange}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Input
              label="Password"
              required
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              endIcon={
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: '#9CA3AF' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Confirm Password"
              required
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formData.confirmPassword.length > 0 && !passwordsMatch}
              endIcon={
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: '#9CA3AF' }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
            />
          </FormGroup>
        </FormRow>

        <PasswordHint>
          <HelpOutline />
          Password must contain uppercase, lowercase, numbers & symbols
        </PasswordHint>

        <SubmitButton onClick={handleSubmit} disabled={!isFormValid || isLoading}>
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            <>
              Create Account <ArrowForward sx={{ fontSize: 20 }} />
            </>
          )}
        </SubmitButton>
      </Container>
    </AuthContainer>
  );
}

export default CompleteRegistration;
