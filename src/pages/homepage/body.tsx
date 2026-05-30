import { Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';
import { Button } from '../../components/controls';
import { AppDownloadSection, MobileAppFab } from '../../components/AppDownload';
import { colors } from '../../utilities/colors';
import { keyframes } from '@mui/system';



const gradientRotate = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const HeroSection = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '100vh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  padding: '180px 48px 80px 150px',
  backgroundColor: colors.primary.navy,
  zIndex: 0,
  '@media (max-width: 768px)': {
    height: '100vh',
    padding: '100px 16px 40px',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowY: 'auto',
  },
});

const LogoBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url(/logo.png)',
  backgroundRepeat: 'repeat',
  backgroundSize: '120px',
  opacity: 0.04,
  maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)',
  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)',
  pointerEvents: 'none',
  zIndex: 0,
});

const WaveBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 1,
  pointerEvents: 'none',
  '& svg': {
    position: 'absolute',
    width: '200%',
    height: '100%',
    opacity: 0.4,
    
  },
});

const HeroContent = styled(Box)({
  position: 'relative',
  zIndex: 2,
  textAlign: 'left',
  maxWidth: '800px',
  marginTop: '60px',
  '@media (max-width: 768px)': {
    textAlign: 'center',
    marginTop: '40px',
  },
});

const BadgesRow = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginBottom: '32px',
  flexWrap: 'wrap',
  '@media (max-width: 768px)': {
    justifyContent: 'center',
  },
});

const ComplianceBadge = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    color: colors.secondary.white,
  },
});

const Title = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '40px',
  fontWeight: 700,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '24px',
  lineHeight: 1.2,
  '@media (max-width: 768px)': {
    fontSize: '36px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: 'rgba(255, 255, 255, 0.85)',
  margin: 0,
  marginBottom: '40px',
  lineHeight: 1.6,
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const CTAButtons = styled(Box)({
  display: 'flex',
  gap: '16px',
  justifyContent: 'flex-start',
  '@media (max-width: 768px)': {
    justifyContent: 'center',
    alignItems: 'center',
  },
  '@media (max-width: 576px)': {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },
});

const DemoButtonWrapper = styled(Box)({
  padding: '2px',
  borderRadius: '10px',
  background: 'linear-gradient(90deg, #00AFEF, #FF6B35, #00AFEF)',
  backgroundSize: '200% 200%',
  animation: `${gradientRotate} 3s ease infinite`,
  '@media (max-width: 576px)': {
    width: '100%',
  },
});

const WatchDemoButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 32px',
  backgroundColor: colors.primary.navy,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%',
  '& .play-icon': {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.blue,
    borderRadius: '50%',
    '& svg': {
      fontSize: '14px',
      color: colors.secondary.white,
    },
  },
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.secondary.white,
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 53, 0.9)',
  },
});

const TrustedBySection = styled(Box)({
  position: 'absolute',
  bottom: '40px',
  left: 0,
  right: 0,
  padding: '32px 48px',
  textAlign: 'center',
  zIndex: 2,
  '@media (max-width: 768px)': {
    position: 'static',
    marginTop: 'auto',
    padding: '24px 16px',
    width: '100%',
  },
});

const TrustedByTitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.6)',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: 0,
  marginBottom: '24px',
});

const LogosContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '64px',
  flexWrap: 'wrap',
  '@media (max-width: 768px)': {
    gap: '32px',
  },
});

const CompanyLogo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '& .icon': {
    width: '32px',
    height: '32px',
  },
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 600,
    color: colors.secondary.white,
  },
});

const companies = [
  { name: 'Layers', color: '#7C3AED' },
  { name: 'Sisyphus', color: '#22C55E' },
  { name: 'Circooles', color: '#3B82F6' },
  { name: 'Catalog', color: '#1E3A5F' },
  { name: 'Quotient', color: '#EC4899' },
];

const Body = () => {
  const navigate = useNavigate();

  return (
    <main style={{ height: '100vh' }}>
      <HeroSection>
        <LogoBackground />
        <WaveBackground>
          <svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={colors.primary.blue} stopOpacity="1"/>
                <stop offset="100%" stopColor={colors.primary.blue} stopOpacity="0"/>
              </radialGradient>
            </defs>
            
            <path d="M0 150 Q150 100 300 150 T600 150 T900 150 T1200 150" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.5"/>
            <path d="M0 170 Q150 120 300 170 T600 170 T900 170 T1200 170" stroke={colors.secondary.white} strokeWidth="0.5" fill="none" opacity="0.4"/>
            <path d="M0 130 Q150 80 300 130 T600 130 T900 130 T1200 130" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M0 190 Q150 140 300 190 T600 190 T900 190 T1200 190" stroke={colors.secondary.white} strokeWidth="0.5" fill="none" opacity="0.35"/>
            <path d="M0 110 Q150 60 300 110 T600 110 T900 110 T1200 110" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.5"/>
            
            <path d="M0 150 Q150 100 300 150 T600 150 T900 150 T1200 150" stroke={colors.primary.blue} strokeWidth="1" fill="none" filter="url(#blueGlow)" strokeDasharray="100 1100" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" values="0;-1200" dur="8s" repeatCount="indefinite"/>
            </path>
            
            <path d="M0 170 Q150 120 300 170 T600 170 T900 170 T1200 170" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#blueGlow)" strokeDasharray="80 1120" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" values="0;-1200" dur="10s" repeatCount="indefinite" begin="1s"/>
            </path>
            
            <path d="M0 130 Q150 80 300 130 T600 130 T900 130 T1200 130" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#blueGlow)" strokeDasharray="60 1140" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" values="0;-1200" dur="7s" repeatCount="indefinite" begin="2s"/>
            </path>
            
            <path d="M0 190 Q150 140 300 190 T600 190 T900 190 T1200 190" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#blueGlow)" strokeDasharray="90 1110" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" values="0;-1200" dur="9s" repeatCount="indefinite" begin="0.5s"/>
            </path>
            
            <path d="M0 110 Q150 60 300 110 T600 110 T900 110 T1200 110" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#blueGlow)" strokeDasharray="70 1130" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" values="0;-1200" dur="6s" repeatCount="indefinite" begin="1.5s"/>
            </path>
          </svg>
        </WaveBackground>
        <HeroContent>
          <BadgesRow>
            <ComplianceBadge>
              <span>HMRC Ready</span>
            </ComplianceBadge>
            <ComplianceBadge>
              <span>UK Focused</span>
            </ComplianceBadge>
            <ComplianceBadge>
              <span>GDPR Compliant</span>
            </ComplianceBadge>
          </BadgesRow>

          <Title>
            Workforce Management Software<br />
            Built for UK Staffing Agencies
          </Title>

          <Subtitle>
            Create shifts, assign workers, track attendance and stay compliant all in one platform.
          </Subtitle>

          <CTAButtons>
            <Button 
              variant="primary" 
              onClick={() => navigate('/get-started')}
              endIcon={<span></span>}
            >
              Start 180-Day Free Plan
            </Button>
            <DemoButtonWrapper>
              <WatchDemoButton onClick={() => navigate('/watch-demo')}>
                <div className="play-icon">
                  <PlayArrow />
                </div>
                <span>Watch Demo</span>
              </WatchDemoButton>
            </DemoButtonWrapper>
          </CTAButtons>
          
          {/* Learn More About App Button */}
          <Box sx={{ mt: 3, width: '100%', maxWidth: '400px' }}>
            <Button 
              variant="outline"
              onClick={() => {
                // Open app download modal
                const event = new CustomEvent('openAppDownload');
                window.dispatchEvent(event);
              }}
              sx={{
                width: '100%',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.9)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
                fontSize: '14px',
                fontWeight: 500,
                py: 1.5,
              }}
            >
              Learn More About the Mobile App
            </Button>
          </Box>
        </HeroContent>
        <TrustedBySection>
          <TrustedByTitle>TRUSTED BY</TrustedByTitle>
          <LogosContainer>
            {companies.map((company) => (
              <CompanyLogo key={company.name}>
                <svg className="icon" viewBox="0 0 32 32" fill="none">
                  {company.name === 'Layers' && (
                    <path d="M16 4L4 10l12 6 12-6-12-6zM4 16l12 6 12-6M4 22l12 6 12-6" stroke={company.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  )}
                  {company.name === 'Sisyphus' && (
                    <path d="M16 4l12 12-12 12L4 16 16 4z" fill={company.color}/>
                  )}
                  {company.name === 'Circooles' && (
                    <circle cx="16" cy="16" r="12" fill={company.color}/>
                  )}
                  {company.name === 'Catalog' && (
                    <path d="M16 4c6.627 0 12 5.373 12 12s-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4zm0 6a6 6 0 100 12 6 6 0 000-12z" fill={company.color}/>
                  )}
                  {company.name === 'Quotient' && (
                    <>
                      <circle cx="16" cy="16" r="12" stroke={company.color} strokeWidth="2" fill="none"/>
                      <circle cx="16" cy="16" r="6" fill={company.color}/>
                    </>
                  )}
                </svg>
                <span className="name">{company.name}</span>
              </CompanyLogo>
            ))}
          </LogosContainer>
        </TrustedBySection>
      </HeroSection>
      
      {/* App Download Section */}
      <AppDownloadSection />
      
      {/* Floating Action Button */}
      <MobileAppFab />
    </main>
  );
};

export default Body;