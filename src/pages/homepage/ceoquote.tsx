import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';
import CEOImage from '../../assets/CEO.JPG';

const QuoteSection = styled(Box)({
  position: 'relative',
  padding: '80px 24px',
  background: colors.primary.navy,
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '75vh',
});

const WaveBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  opacity: 0.6,
});

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 2,
  maxWidth: '900px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '32px',
});

const QuoteText = styled('blockquote')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 500,
  color: colors.secondary.white,
  margin: 0,
  lineHeight: 1.5,
  fontStyle: 'italic',
  '@media (max-width: 768px)': {
    fontSize: '22px',
  },
  '@media (max-width: 480px)': {
    fontSize: '18px',
  },
});

const QuoteMark = styled('span')({
  color: colors.primary.blue,
  fontSize: '48px',
  fontWeight: 700,
  lineHeight: 1,
});

const AuthorWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const CEOAvatar = styled('img')({
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `3px solid ${colors.primary.blue}`,
});

const AuthorInfo = styled(Box)({
  textAlign: 'left',
});

const AuthorName = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.secondary.white,
  margin: 0,
});

const AuthorTitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  marginTop: '4px',
});

const CEOQuote = () => {
  return (
    <QuoteSection>
      <WaveBackground>
        <svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <filter id="ceoBlueGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path d="M0 150 Q150 100 300 150 T600 150 T900 150 T1200 150" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.5"/>
          <path d="M0 170 Q150 120 300 170 T600 170 T900 170 T1200 170" stroke={colors.secondary.white} strokeWidth="0.5" fill="none" opacity="0.4"/>
          <path d="M0 130 Q150 80 300 130 T600 130 T900 130 T1200 130" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.3"/>
          <path d="M0 190 Q150 140 300 190 T600 190 T900 190 T1200 190" stroke={colors.secondary.white} strokeWidth="0.5" fill="none" opacity="0.35"/>
          <path d="M0 110 Q150 60 300 110 T600 110 T900 110 T1200 110" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.5"/>
          
          <path d="M0 150 Q150 100 300 150 T600 150 T900 150 T1200 150" stroke={colors.primary.blue} strokeWidth="1" fill="none" filter="url(#ceoBlueGlow)" strokeDasharray="100 1100" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" values="0;-1200" dur="8s" repeatCount="indefinite"/>
          </path>
          
          <path d="M0 170 Q150 120 300 170 T600 170 T900 170 T1200 170" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#ceoBlueGlow)" strokeDasharray="80 1120" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" values="0;-1200" dur="10s" repeatCount="indefinite" begin="1s"/>
          </path>
          
          <path d="M0 130 Q150 80 300 130 T600 130 T900 130 T1200 130" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#ceoBlueGlow)" strokeDasharray="60 1140" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" values="0;-1200" dur="7s" repeatCount="indefinite" begin="2s"/>
          </path>
        </svg>
      </WaveBackground>
      
      <ContentWrapper>
        <QuoteMark>"</QuoteMark>
        <QuoteText>
          Every staffing agency that switches to StaffSync will feel like they've unlocked a new level of efficiency. 
          It's not just software—it's giving your team superpowers for scheduling, compliance, and payroll.
        </QuoteText>
        <AuthorWrapper>
          <CEOAvatar src={CEOImage} alt="Oluwasuyi Babayomi" />
          <AuthorInfo>
            <AuthorName>Oluwasuyi Babayomi</AuthorName>
            <AuthorTitle>Founder & CEO</AuthorTitle>
          </AuthorInfo>
        </AuthorWrapper>
      </ContentWrapper>
    </QuoteSection>
  );
};

export default CEOQuote;
