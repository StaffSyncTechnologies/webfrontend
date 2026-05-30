import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks';
import { Box, styled, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { AuthContainer } from '../../components/layout';
import { Input } from '../../components/controls';
import { useAuthApi } from '../../store/slices/authSlice';
import { useValidateClientCodeMutation } from '../../store/slices/clientSlice';
import { getApiError } from '../../services';

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
  marginTop: '16px',
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

const HelpText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  textAlign: 'center',
  marginTop: '16px',
});

const LoginLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.blue,
  cursor: 'pointer',
  padding: 0,
  marginTop: '24px',
  display: 'block',
  width: '100%',
  textAlign: 'center',
  '&:hover': {
    textDecoration: 'underline',
  },
});

interface Props {
  type?: 'client' | 'team';
}

export function AcceptInvite({ type = 'team' }: Props) {
  useDocumentTitle(type === 'client' ? 'Client Invitation' : 'Team Invitation');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [inviteCode, setInviteCode] = useState(initialCode);
  
  // RTK Query hooks
  const authApi = useAuthApi();
  const [validateTeamCode, { isLoading: teamLoading, error: teamError, isSuccess: teamSuccess, data: teamData }] = 
    authApi.useValidateInviteCodeMutation();
  const [validateClientCode, { isLoading: clientLoading, error: clientError, isSuccess: clientSuccess, data: clientData }] = 
    useValidateClientCodeMutation();

  const isLoading = type === 'client' ? clientLoading : teamLoading;
  const error = type === 'client' ? clientError : teamError;
  const isSuccess = type === 'client' ? clientSuccess : teamSuccess;
  const data = type === 'client' ? clientData : teamData;

  // Navigate on success
  useEffect(() => {
    if (isSuccess && data) {
      const registerPath = type === 'client' ? '/client/register/complete' : '/accept-invite/complete';
      
      // Handle different response structures for client vs team validation
      let agencyData;
      if (type === 'client') {
        // Client validation response type
        const clientResponse = data as { valid: boolean; agency: { id: string; name: string; logo?: string; primaryColor?: string } };
        agencyData = clientResponse.agency;
      } else {
        // Team validation response type
        const teamResponse = data as { success: boolean; message: string; data?: { organizationId: string; organizationName: string; logoUrl?: string; primaryColor?: string } };
        agencyData = teamResponse.data;
      }
      
      navigate(registerPath, { 
        state: { 
          inviteCode: inviteCode.trim(),
          agency: agencyData,
          verified: true,
        } 
      });
    }
  }, [isSuccess, data, navigate, inviteCode, type]);

  const handleVerifyCode = () => {
    if (!inviteCode.trim()) return;
    
    if (type === 'client') {
      validateClientCode({ inviteCode: inviteCode.trim() });
    } else {
      validateTeamCode({ code: inviteCode.trim() });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inviteCode.trim() && !isLoading) {
      handleVerifyCode();
    }
  };

  const isValid = inviteCode.trim().length >= 6;
  const errorMessage = error ? getApiError(error).message : null;

  return (
    <AuthContainer>
      <Container>
        <GoBackButton onClick={() => navigate('/get-started')}>
          <ArrowBack sx={{ fontSize: 20 }} />
          Go back
        </GoBackButton>

        <Title>Enter Invite Code</Title>
        <Subtitle>
          {type === 'client' 
            ? 'Enter the invite code sent to your email to set up your client portal account'
            : 'Enter the invite code sent to your email to join the team'
          }
        </Subtitle>

        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>
            {errorMessage}
          </Alert>
        )}

        <FormGroup>
          <Input
            label="Invite Code"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="ABC123-DEF456"
            autoFocus
            sx={{
              '& .MuiInputBase-input': {
                letterSpacing: '4px',
                textAlign: 'center',
                textTransform: 'uppercase',
              },
            }}
          />
        </FormGroup>

        <SubmitButton onClick={handleVerifyCode} disabled={!isValid || isLoading}>
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            <>
              Verify Code <ArrowForward sx={{ fontSize: 20 }} />
            </>
          )}
        </SubmitButton>

        <HelpText>
          The invite code was sent to your email. Check your spam folder if you can't find it.
        </HelpText>

        <LoginLink onClick={() => navigate('/login')}>
          Already have an account? Login
        </LoginLink>
      </Container>
    </AuthContainer>
  );
}

export default AcceptInvite;
