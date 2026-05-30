import { useState, useEffect } from 'react';
import { useDocumentTitle, useLogin, useToast, useAuth } from '../../hooks';
import { Box, styled, TextField, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Visibility, VisibilityOff, HelpOutline } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { AuthContainer } from '../../components/layout';
import { useAppDispatch } from '../../store';
import { setError } from '../../store/slices/authPersistSlice';
import type { UserRole } from '../../utilities/roles';

// Get dashboard redirect path based on user role
const getDashboardPath = (role: UserRole | undefined): string => {
  // All roles go to /dashboard - the RoleDashboard component handles rendering the correct dashboard
  return '/dashboard';
};

const Container = styled(Box)({
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
});

const GoBackButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
  padding: 0,
  marginBottom: '32px',
  '&:hover': {
    color: colors.primary.blue,
  },
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
  marginBottom: '24px',
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

const StyledTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontFamily: "'Outfit', sans-serif",
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: colors.primary.blue,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.blue,
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
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

const LinksRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '8px',
});

const ForgotPasswordLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
  cursor: 'pointer',
  padding: 0,
  '&:hover': {
    textDecoration: 'underline',
  },
});

const GetStartedLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.blue,
  cursor: 'pointer',
  padding: 0,
  '&:hover': {
    textDecoration: 'underline',
  },
});

const LoginButton = styled('button')({
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
  marginTop: '16px',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#1a2d4a',
  },
  '&:disabled': {
    backgroundColor: '#9CA3AF',
    cursor: 'not-allowed',
  },
});

export function Login() {
  useDocumentTitle('Login');
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const toast = useToast();
  const { error: authError } = useAuth();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Show error toast when login fails
  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError, toast]);

  // Navigate on successful login based on user role
  useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      const userRole = loginMutation.data.user?.role as UserRole | undefined;
      const redirectPath = from || getDashboardPath(userRole);
      navigate(redirectPath, { replace: true });
    }
  }, [loginMutation.isSuccess, loginMutation.data, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (authError) {
      dispatch(setError(null));
    }
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.email || !formData.password) return;
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !loginMutation.isPending) {
      handleSubmit();
    }
  };

  const isValid = formData.email && formData.password;

  return (
    <AuthContainer>
      <Container>
        <GoBackButton onClick={() => navigate('/')}>
          <ArrowBack sx={{ fontSize: 20 }} />
          Go back
        </GoBackButton>

        <Title>Login to your account</Title>
        <Subtitle>Login to your account to have access to your account</Subtitle>

        <FormGroup>
          <Label>Email Address<span>*</span></Label>
          <StyledTextField
            name="email"
            type="email"
            placeholder="Enter your full name"
            value={formData.email}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Password<span>*</span></Label>
          <StyledTextField
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: '#9CA3AF' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <PasswordHint>
            <HelpOutline />
            Password must contain uppercase, lowercase, numbers & symbols
          </PasswordHint>
          <LinksRow>
            <GetStartedLink onClick={() => navigate('/get-started')}>
              Get Started
            </GetStartedLink>
            <ForgotPasswordLink onClick={() => navigate('/forgot-password')}>
              Forget Password?
            </ForgotPasswordLink>
          </LinksRow>
        </FormGroup>

        <LoginButton onClick={handleSubmit} disabled={!isValid || loginMutation.isPending}>
          {loginMutation.isPending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Login'}
        </LoginButton>
      </Container>
    </AuthContainer>
  );
}

export default Login;
