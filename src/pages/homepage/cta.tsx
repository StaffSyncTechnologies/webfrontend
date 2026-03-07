import { Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';
import { colors } from '../../utilities/colors';

const Section = styled(Box)({
  position: 'relative',
  padding: '100px 48px',
  backgroundImage: 'url("https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
  '@media (max-width: 768px)': {
    padding: '80px 16px',
  },
});

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 53, 0.75)',
  zIndex: 1,
});

const Content = styled(Box)({
  position: 'relative',
  zIndex: 2,
  maxWidth: '800px',
  margin: '0 auto',
  textAlign: 'center',
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '30px',
  fontWeight: 700,
  fontStyle: 'bold',
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '20px',
  lineHeight: 1.3,
  '@media (max-width: 768px)': {
    fontSize: '28px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.8)',
  margin: 0,
  marginBottom: '40px',
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const ButtonsContainer = styled(Box)({
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
  '@media (max-width: 576px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

const PrimaryButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '14px 32px',
  backgroundColor: colors.secondary.white,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  '&:hover': {
    backgroundColor: '#F3F4F6',
    transform: 'translateY(-2px)',
  },
  '@media (max-width: 576px)': {
    width: '100%',
    justifyContent: 'center',
  },
});

const WatchDemoButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '14px 32px',
  backgroundColor: 'transparent',
  border: '2px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.secondary.white,
  '& .play-icon': {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.white,
    borderRadius: '50%',
    '& svg': {
      fontSize: '14px',
      color: colors.primary.navy,
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: colors.secondary.white,
  },
  '@media (max-width: 576px)': {
    width: '100%',
    justifyContent: 'center',
  },
});

const CTA = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <Overlay />
      <Content>
        <Title>Ready to run your staffing agency smarter?</Title>
        <Subtitle>
          Join UK agencies already saving hours every week with StaffSync
        </Subtitle>
        <ButtonsContainer>
          <PrimaryButton onClick={() => navigate('/get-started')}>
            Start Free Plan
            <span>→</span>
          </PrimaryButton>
          <WatchDemoButton>
            <div className="play-icon">
              <PlayArrow />
            </div>
            Book Demo
          </WatchDemoButton>
        </ButtonsContainer>
      </Content>
    </Section>
  );
};

export default CTA;
