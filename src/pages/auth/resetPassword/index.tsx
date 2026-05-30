import { useState } from 'react';
import { Box, styled, TextField, IconButton, InputAdornment } from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff, HelpOutline } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContainer } from '../../../components/layout';
import { colors } from '../../../utilities/colors';

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
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#1a2d4a',
  },
  '&:disabled': {
    backgroundColor: '#9CA3AF',
    cursor: 'not-allowed',
  },
});

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    // TODO: Implement password reset logic
    console.log('Reset password for:', email, formData);
    navigate('/login');
  };

  const isValid = formData.password && 
                  formData.confirmPassword && 
                  formData.password === formData.confirmPassword &&
                  formData.password.length >= 8;

  return (
    <AuthContainer>
      <Container>
        <GoBackButton onClick={() => navigate('/forgot-password')}>
          <ArrowBack sx={{ fontSize: 20 }} />
          Go back
        </GoBackButton>

        <Title>Reset Password</Title>
        <Subtitle>Create a new password for your account</Subtitle>

        <FormGroup>
          <Label>New Password<span>*</span></Label>
          <StyledTextField
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            value={formData.password}
            onChange={handleChange}
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
        </FormGroup>

        <FormGroup>
          <Label>Confirm Password<span>*</span></Label>
          <StyledTextField
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: '#9CA3AF' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormGroup>

        <SubmitButton onClick={handleSubmit} disabled={!isValid}>
          Reset Password
        </SubmitButton>
      </Container>
    </AuthContainer>
  );
};

export default ResetPasswordPage;
