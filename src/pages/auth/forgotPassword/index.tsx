import { useState, useEffect } from 'react';
import { Box, styled, TextField } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContainer } from '../../../components/layout';
import OTPInput from '../../../components/controls/OTPInput';
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

const Timer = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  display: 'block',
  textAlign: 'right',
  marginTop: '12px',
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

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = () => {
    // TODO: Send OTP to email
    console.log('Sending OTP to:', email);
    setStep('otp');
    setTimer(59);
  };

  const handleVerifyOTP = () => {
    // TODO: Verify OTP
    console.log('Verifying OTP:', otp.join(''));
    navigate('/reset-password', { state: { email } });
  };

  const handleResend = () => {
    setTimer(59);
    setOtp(['', '', '', '', '', '']);
    // TODO: Resend OTP
  };

  const isOtpValid = otp.every(digit => digit !== '');

  return (
    <AuthContainer>
      <Container>
        <GoBackButton onClick={() => step === 'otp' ? setStep('email') : navigate('/login')}>
          <ArrowBack sx={{ fontSize: 20 }} />
          Go back
        </GoBackButton>

        {step === 'email' ? (
          <>
            <Title>Forget Password</Title>
            <Subtitle>Enter your email address to receive a verification code</Subtitle>

            <FormGroup>
              <Label>Email Address<span>*</span></Label>
              <StyledTextField
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>

            <SubmitButton onClick={handleSendOTP} disabled={!email}>
              Send Code
            </SubmitButton>
          </>
        ) : (
          <>
            <Title>Forget Password</Title>
            <Subtitle>Enter the OTP code sent to your email address {email || 'abc123@gmail.com'}.</Subtitle>

            <FormGroup sx={{ marginBottom: '32px' }}>
              <Label>OTP Code<span>*</span></Label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleVerifyOTP}
              />
              <Timer>00:{timer.toString().padStart(2, '0')}s</Timer>
            </FormGroup>

            <ResendLink>
              Didn't receive code?
              <button onClick={handleResend} disabled={timer > 0}>Resend</button>
            </ResendLink>

            <SubmitButton onClick={handleVerifyOTP} disabled={!isOtpValid}>
              Verify Code
            </SubmitButton>
          </>
        )}
      </Container>
    </AuthContainer>
  );
};

export default ForgotPasswordPage;
