import { Box, styled } from '@mui/material';
import { 
  CalendarMonth, 
  PersonAdd, 
  VerifiedUser, 
  AccessTime, 
  Assessment, 
  Payments 
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';

const Section = styled(Box)({
  padding: '80px 48px',
  backgroundColor: colors.secondary.white,
  '@media (max-width: 768px)': {
    padding: '60px 24px',
  },
  '@media (max-width: 576px)': {
    padding: '48px 16px',
  },
});

const Content = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  textAlign: 'center',
});

const Badge = styled('span')({
  display: 'inline-block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: colors.secondary.white,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '8px 20px',
  backgroundColor: colors.primary.blue,
  borderRadius: '20px',
  marginBottom: '24px',
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '36px',
  fontWeight: 700,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '16px',
  lineHeight: 1.3,
  '@media (max-width: 768px)': {
    fontSize: '28px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '48px',
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const ModulesGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 576px)': {
    gridTemplateColumns: '1fr',
  },
});

const ModuleCard = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '24px',
  backgroundColor: '#F8FAFC',
  borderRadius: '12px',
  border: `1px solid ${colors.border.light}`,
  textAlign: 'left',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#F0F9FF',
    borderColor: colors.primary.blue,
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 175, 239, 0.12)',
  },
});

const IconWrapper = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '10px',
  backgroundColor: colors.primary.blue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: '24px',
    color: colors.secondary.white,
  },
});

const ModuleContent = styled(Box)({
  flex: 1,
});

const ModuleTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '8px',
});

const ModuleDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: 0,
  lineHeight: 1.5,
});

const modules = [
  {
    icon: <CalendarMonth />,
    title: 'Shift Scheduling',
    description: 'Create and manage shifts with drag-and-drop simplicity',
  },
  {
    icon: <PersonAdd />,
    title: 'Worker Onboarding',
    description: 'Digital onboarding with document collection',
  },
  {
    icon: <VerifiedUser />,
    title: 'RTW Compliance',
    description: 'Right to Work checks and expiry tracking',
  },
  {
    icon: <AccessTime />,
    title: 'Clock In/Out Tracking',
    description: 'GPS-verified attendance with anti-fraud measures',
  },
  {
    icon: <Assessment />,
    title: 'Reporting',
    description: 'Real-time dashboards and custom reports',
  },
  {
    icon: <Payments />,
    title: 'Payroll-Ready Data',
    description: 'HMRC-compliant exports for seamless payroll',
  },
];

const Solution = () => {
  return (
    <Section id="solution">
      <Content>
        <Badge>Solution</Badge>
        <Title>One platform to run your entire workforce operation</Title>
        <Subtitle>Everything you need, nothing you don't</Subtitle>
        
        <ModulesGrid>
          {modules.map((module, index) => (
            <ModuleCard key={index}>
              <IconWrapper>{module.icon}</IconWrapper>
              <ModuleContent>
                <ModuleTitle>{module.title}</ModuleTitle>
                <ModuleDescription>{module.description}</ModuleDescription>
              </ModuleContent>
            </ModuleCard>
          ))}
        </ModulesGrid>
      </Content>
    </Section>
  );
};

export default Solution;
