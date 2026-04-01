import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';

const Section = styled(Box)({
  display: 'flex',
  backgroundColor: colors.primary.navy,
  padding: '80px 48px',
  minHeight: '75vh',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  top: 0,
  zIndex: 0,
  overflow: 'hidden',
  '@media (max-width: 768px)': {
    padding: '60px 16px',
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
});

const Content = styled(Box)({
  position: 'relative',
  zIndex: 2,
  maxWidth: '1200px',
  margin: '0 auto',
  textAlign: 'center',
});

const Badge = styled(Box)({
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '20px',
  border: `1px solid ${colors.primary.blue}`,
  marginBottom: '24px',
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.primary.blue,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '30px',
  fontWeight: 700,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '16px',
  '@media (max-width: 768px)': {
    fontSize: '32px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  marginBottom: '64px',
  '@media (max-width: 768px)': {
    fontSize: '16px',
    marginBottom: '48px',
  },
});

const StepsContainer = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '24px',
  '@media (max-width: 900px)': {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
  },
});

const StepItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  maxWidth: '220px',
  '@media (max-width: 900px)': {
    maxWidth: '300px',
  },
});

const StepNumber = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: colors.primary.blue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    color: colors.secondary.white,
  },
});

const StepTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 600,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '12px',
});

const StepDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  lineHeight: 1.6,
  textAlign: 'center',
});

const Arrow = styled(Box)<{ delay?: number }>(({ delay = 0 }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingTop: '12px',
  '& svg': {
    width: '40px',
    height: '40px',
    color: 'rgba(255, 255, 255, 0.3)',
    animation: 'arrowMove 2s ease-in-out infinite',
    animationDelay: `${delay}s`,
  },
  '@keyframes arrowMove': {
    '0%, 100%': {
      transform: 'translateX(0)',
      opacity: 0.3,
    },
    '50%': {
      transform: 'translateX(8px)',
      opacity: 1,
      color: colors.primary.blue,
    },
  },
  '@media (max-width: 900px)': {
    display: 'none',
  },
}));

const steps = [
  {
    number: 1,
    title: 'Create Shifts',
    description: 'Set up your client requirements and shift patterns in seconds.',
  },
  {
    number: 2,
    title: 'Assign Workers',
    description: 'Use smart matching to find available staff to the job board.',
  },
  {
    number: 3,
    title: 'Track Time',
    description: 'Workers clock in via GPS, providing real-time visibility of attendance.',
  },
  {
    number: 4,
    title: 'Pay',
    description: 'Approve timesheets and run automated payroll with a single click.',
  },
];

const HowItWorks = () => {
  return (
    <Section id="how-it-works">
      <LogoBackground />
      <Content>
        <Badge>
          <span>How It Works</span>
        </Badge>
        <Title>Streamline your agency in 4 steps</Title>
        <Subtitle>Everything you need to manage your workforce</Subtitle>
        
        <StepsContainer>
          {steps.map((step, index) => (
            <Box key={step.number} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <StepItem>
                <StepNumber>
                  <span>{step.number}</span>
                </StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepItem>
              {index < steps.length - 1 && (
                <Arrow delay={index * 0.5}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Arrow>
              )}
            </Box>
          ))}
        </StepsContainer>
      </Content>
    </Section>
  );
};

export default HowItWorks;