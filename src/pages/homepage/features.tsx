import { Box, styled } from '@mui/material';
import { 
  CalendarMonth, 
  LocationOn, 
  Receipt, 
  PhoneIphone, 
  VerifiedUser, 
  Campaign,
  Apple,
  Android
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';

const FeaturesSection = styled(Box)({
  padding: '80px 48px',
  backgroundColor: '#F8FAFC',
  textAlign: 'center',
  '@media (max-width: 768px)': {
    padding: '60px 24px',
  },
  '@media (max-width: 576px)': {
    padding: '48px 16px',
  },
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
  fontSize: '30px',
  fontWeight: 700,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '16px',
  lineHeight: 1.2,
  '@media (max-width: 768px)': {
    fontSize: '32px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '48px',
});

const FeaturesGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
  '@media (max-width: 968px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 576px)': {
    gridTemplateColumns: '1fr',
  },
});

const FeatureCard = styled(Box)({
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)',
  padding: '32px',
  borderRadius: '16px',
  textAlign: 'left',
  border: `1px solid ${colors.border.light}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-8px)',
    borderColor: colors.primary.blue,
    background: 'linear-gradient(135deg, #ffffff 0%, #e0f7fa 50%, #b2ebf2 100%)',
  },
  '&:hover .icon-wrapper': {
    transform: 'scale(1.1)',
  },
});

const IconWrapper = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: colors.primary.blue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  transition: 'transform 0.3s ease',
  '& svg': {
    fontSize: '24px',
    color: colors.secondary.white,
  },
});

const FeatureTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '12px',
});

const FeatureDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: 0,
  lineHeight: 1.6,
});

const AppBadges = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
});

const AppBadge = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: colors.primary.navy,
  borderRadius: '8px',
  '& svg': {
    fontSize: '18px',
    color: colors.secondary.white,
  },
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    color: colors.secondary.white,
  },
});

const features = [
  {
    icon: <CalendarMonth />,
    title: 'Smart Scheduling',
    description: 'Drag-and-drop rota builder with auto-fill capabilities to ensure every shift is covered by the right and qualified person.',
  },
  {
    icon: <LocationOn />,
    title: 'GPS Clock In/Out',
    description: 'Geofenced attendance tracking with anti-fraud technology to verify your team or worker is on-site and also on-time.',
  },
  {
    icon: <Receipt />,
    title: 'Automated Payroll',
    description: 'UK-specific tax and National Insurance calculated automatically. Generate HMRC-ready reports in seconds.',
  },
  {
    icon: <PhoneIphone />,
    title: 'Worker App',
    description: 'A dedicated iOS and Android experience for your workers to manage shifts, view payslips, and update availability.',
    showAppBadges: true,
  },
  {
    icon: <VerifiedUser />,
    title: 'UK Compliance',
    description: 'Built-in Right to Work (RTW) checks, DBS tracking, and audit-ready documentation to keep you protected.',
  },
  {
    icon: <Campaign />,
    title: 'Emergency Broadcast',
    description: 'Fill last minute no-shows in under five minutes by instantly alerting all qualified and available important candidates.',
  },
];

const Features = () => {
  return (
      <FeaturesSection id="features">
        <Badge>Features</Badge>
        <Title>Powerful tools you need for agencies and companies</Title>
        <Subtitle>Everything you need to manage your workforce</Subtitle>
        
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <IconWrapper className="icon-wrapper">{feature.icon}</IconWrapper>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              {feature.showAppBadges && (
                <AppBadges>
                  <AppBadge>
                    <Apple />
                    <span>iOS</span>
                  </AppBadge>
                  <AppBadge>
                    <Android />
                    <span>Android</span>
                  </AppBadge>
                </AppBadges>
              )}
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>
   
  );
};

export default Features;
