import { useState, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { colors } from '../utilities/colors';

const Backdrop = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 9998,
});

const Overlay = styled(Box)({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  padding: '24px',
  '@media (max-width: 768px)': {
    padding: '16px',
  },
});

const Container = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  backgroundColor: colors.primary.navy,
  borderRadius: '16px',
  padding: '24px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    padding: '20px',
    gap: '16px',
  },
});

const Content = styled(Box)({
  flex: 1,
});

const Title = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '8px',
});

const Description = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: 0,
  lineHeight: 1.5,
  '& a': {
    color: colors.primary.blue,
    textDecoration: 'underline',
    '&:hover': {
      opacity: 0.8,
    },
  },
});

const ButtonsContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  flexShrink: 0,
  '@media (max-width: 768px)': {
    width: '100%',
  },
});

const AcceptButton = styled('button')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: colors.primary.blue,
  color: colors.secondary.white,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 0.9,
  },
  '@media (max-width: 768px)': {
    flex: 1,
  },
});

const DeclineButton = styled('button')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '8px',
  border: `1px solid rgba(255, 255, 255, 0.3)`,
  cursor: 'pointer',
  backgroundColor: 'transparent',
  color: colors.secondary.white,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '@media (max-width: 768px)': {
    flex: 1,
  },
});

const COOKIE_CONSENT_KEY = 'staffsync_cookie_consent';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <Backdrop />
      <Overlay>
        <Container>
        <Content>
          <Title>We value your privacy</Title>
          <Description>
            We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. 
            By clicking "Accept All", you consent to our use of cookies. 
            Read our <a href="/privacy-policy">Privacy Policy</a> for more information.
          </Description>
        </Content>
        <ButtonsContainer>
          <DeclineButton onClick={handleDecline}>
            Decline
          </DeclineButton>
          <AcceptButton onClick={handleAccept}>
            Accept All
          </AcceptButton>
        </ButtonsContainer>
      </Container>
      </Overlay>
    </>
  );
};

export default CookieConsent;
