


import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';

const AboutSection = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '64px',
  padding: '80px 48px',
  backgroundColor: colors.secondary.white,
  '@media (max-width: 968px)': {
    gridTemplateColumns: '1fr',
    gap: '48px',
    padding: '60px 24px',
  },
  '@media (max-width: 576px)': {
    padding: '48px 16px',
  },
});

const ImagesGrid = styled(Box)({
  display: 'flex',
  gap: '16px',
  height: '450px',
  '@media (max-width: 576px)': {
    flexDirection: 'column',
    height: 'auto',
  },
});

const Column = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  flex: 1,
});

const ImageBox = styled(Box)({
  overflow: 'hidden',
  flex: 1,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const StatBox = styled(Box)<{ variant?: 'blue' | 'navy' }>(({ variant = 'navy' }) => ({
  backgroundColor: variant === 'blue' ? colors.primary.blue : colors.primary.navy,
  padding: '24px',
  '& .stat-value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '32px',
    fontWeight: 700,
    color: colors.secondary.white,
    margin: 0,
    marginBottom: '4px',
  },
  '& .stat-label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
}));


const ContentSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
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
  width: 'fit-content',
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '30px',
  fontWeight: 700,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '24px',
  lineHeight: 1.2,
  '@media (max-width: 768px)': {
    fontSize: '32px',
  },
});

const Description = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  lineHeight: 1.7,
  margin: 0,
  marginBottom: '20px',
});
// const myRow = styled(Box)({
//   display: 'flex',
//   flexDirection: 'column',
//   gap: '16px',

const AboutUs = () => {
  return (
    <AboutSection id="about">
      <ImagesGrid>
        {/* Column 1: Image on top, stat box at bottom */}
        <Column>
          <ImageBox>
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=600&fit=crop"
              alt="Business handshake"
            />
          </ImageBox>
          <StatBox variant="blue">
            <p className="stat-value">24/7</p>
            <p className="stat-label">Customer Support</p>
          </StatBox>
        </Column>

        {/* Column 2: Stat box on top, image at bottom */}
        <Column>
          <StatBox variant="navy">
            <p className="stat-label">Reduce operational overhead</p>
          </StatBox>
          <ImageBox>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
              alt="Team collaboration"
            />
          </ImageBox>
        </Column>
      </ImagesGrid>

      <ContentSection>
        <Badge>About Us</Badge>
        <Title>Built for Agencies and Companies</Title>
        <Description>
          StaffSync was created to simplify workforce management for modern staffing and recruitment 
          agencies. We understand the challenges agencies face daily from last-minute shift changes 
          and compliance pressure to payroll complexity and workforce visibility.
        </Description>
        <Description>
          Our mission is to give agencies one intelligent platform to manage people, shifts, 
          compliance, and payments without spreadsheets, manual errors, or disconnected tools.
        </Description>
      </ContentSection>
    </AboutSection>
  );
};

export default AboutUs;