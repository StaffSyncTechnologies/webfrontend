import { Box, styled } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../../components/layout';
import { useDocumentTitle } from '../../hooks';
import { colors } from '../../utilities/colors';

const PageContainer = styled(Box)({
  paddingTop: '80px',
});

const Content = styled(Box)({
  maxWidth: '900px',
  margin: '0 auto',
  padding: '48px 24px',
});

const Title = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '32px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '12px',
});

const Description = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '32px',
  maxWidth: '500px',
  lineHeight: 1.6,
});

const VideoContainer = styled(Box)({
  width: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  marginBottom: '64px',
});

const VideoPlayer = styled('video')({
  width: '100%',
  height: 'auto',
  display: 'block',
});


const CTASection = styled(Box)({
  backgroundColor: colors.primary.navy,
  borderRadius: '16px',
  padding: '48px',
  textAlign: 'center',
  marginBottom: '48px',
});

const CTATitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.blue,
  margin: 0,
  marginBottom: '12px',
});

const CTASubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '24px',
});

const CTAButton = styled('button')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '14px 32px',
  backgroundColor: colors.secondary.white,
  color: colors.primary.navy,
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
});

const WatchDemo = () => {
  useDocumentTitle('Watch Demo');
  const navigate = useNavigate();

  return (
    <Box>
      <Header />
      <PageContainer>
        <Content>
          <Title>Watch Demo</Title>
          <Description>
            Discover how our platform automates UK staffing agency operations, from smart scheduling to automated payroll in under 5 minutes.
          </Description>

          <VideoContainer>
            <VideoPlayer
              controls
              poster="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=500&fit=crop"
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </VideoPlayer>
          </VideoContainer>

          <CTASection>
            <CTATitle>Ready to automate?</CTATitle>
            <CTASubtitle>
              Join the UK Agencies and Companies using StaffSync to power their flexible workforce
            </CTASubtitle>
            <CTAButton onClick={() => navigate('/get-started')}>
              Start Free Trial
              <ArrowForward sx={{ fontSize: 18 }} />
            </CTAButton>
          </CTASection>
        </Content>
      </PageContainer>
      <Footer />
    </Box>
  );
};

export default WatchDemo;
