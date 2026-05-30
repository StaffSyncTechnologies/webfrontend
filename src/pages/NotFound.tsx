import { Box, styled } from '@mui/material';
import { useDocumentTitle } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/controls';
import { colors } from '../utilities/colors';

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: colors.secondary.lightGray,
  padding: '24px',
  textAlign: 'center',
});

const ErrorCode = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '8rem',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  lineHeight: 1,
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: '16px 0 8px',
});

const Description = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1rem',
  color: colors.text.secondary,
  margin: '0 0 32px',
  maxWidth: '400px',
});

export function NotFound() {
  useDocumentTitle('Page Not Found');
  const navigate = useNavigate();

  return (
    <Container>
      <ErrorCode>404</ErrorCode>
      <Title>Page Not Found</Title>
      <Description>
        The page you are looking for doesn't exist or has been moved.
      </Description>
      <Box display="flex" gap="16px">
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound;
