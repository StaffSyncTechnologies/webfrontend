import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';
import ceoImage from '../../assets/CEO.JPG';

const Section = styled(Box)({
  padding: '80px 48px',
  backgroundColor: '#F8FAFC',
  '@media (max-width: 768px)': {
    padding: '60px 24px',
  },
  '@media (max-width: 576px)': {
    padding: '48px 16px',
  },
});

const Content = styled(Box)({
  maxWidth: '900px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  gap: '48px',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    textAlign: 'center',
    gap: '32px',
  },
});

const PhotoContainer = styled(Box)({
  flexShrink: 0,
});

const PhotoWrapper = styled(Box)({
  width: '200px',
  height: '200px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '4px solid',
  borderColor: colors.primary.blue,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  '@media (max-width: 768px)': {
    width: '160px',
    height: '160px',
  },
});

const CEOImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const TextContent = styled(Box)({
  flex: 1,
});

const Badge = styled('span')({
  display: 'inline-block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: colors.primary.blue,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '6px 16px',
  backgroundColor: 'rgba(0, 175, 239, 0.1)',
  borderRadius: '20px',
  marginBottom: '16px',
});

const Quote = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 400,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '24px',
  lineHeight: 1.7,
  fontStyle: 'italic',
  '@media (max-width: 768px)': {
    fontSize: '18px',
  },
});

const FounderInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  '@media (max-width: 768px)': {
    justifyContent: 'center',
  },
});

const FounderName = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
});

const FounderRole = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  color: colors.text.secondary,
  margin: 0,
  marginTop: '4px',
});

const CredibilityBadges = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
  flexWrap: 'wrap',
  '@media (max-width: 768px)': {
    justifyContent: 'center',
  },
});

const CredBadge = styled(Box)({
  padding: '8px 16px',
  backgroundColor: colors.secondary.white,
  borderRadius: '8px',
  border: `1px solid ${colors.border.light}`,
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text.secondary,
  },
});

const Founder = () => {
  return (
    <Section id="founder">
      <Content>
        <PhotoContainer>
          <PhotoWrapper>
            <CEOImage src={ceoImage} alt="Founder & CEO" />
          </PhotoWrapper>
        </PhotoContainer>
        
        <TextContent>
          <Badge>From the Founder</Badge>
          <Quote>
            "Built by a workforce operator and software engineer who experienced 
            staffing inefficiencies first-hand. After years of watching agencies 
            struggle with spreadsheets, WhatsApp groups, and disconnected systems, 
            I built StaffSync to give staffing businesses the tools they deserve."
          </Quote>
          <FounderInfo>
            <Box>
              <FounderName>Babayomi Oluwasuyi</FounderName>
              <FounderRole>Founder & CEO, StaffSync</FounderRole>
            </Box>
          </FounderInfo>
          <CredibilityBadges>
            <CredBadge>
              <span>🏢 10+ years in workforce operations</span>
            </CredBadge>
            <CredBadge>
              <span>💻 Software engineering background</span>
            </CredBadge>
            <CredBadge>
              <span>🇬🇧 UK-based founder</span>
            </CredBadge>
          </CredibilityBadges>
        </TextContent>
      </Content>
    </Section>
  );
};

export default Founder;
