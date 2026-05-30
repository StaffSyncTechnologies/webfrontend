import { Box, styled } from '@mui/material';
import { 
  VerifiedUser, 
  Security, 
  Cloud, 
  History, 
  Lock,
  Shield
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
});

const Header = styled(Box)({
  textAlign: 'center',
  marginBottom: '48px',
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
  backgroundColor: '#059669',
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
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const ComplianceGrid = styled(Box)({
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

const ComplianceCard = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '24px',
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  border: '1px solid #BBF7D0',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(5, 150, 105, 0.12)',
  },
});

const IconWrapper = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '10px',
  backgroundColor: '#059669',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: '24px',
    color: colors.secondary.white,
  },
});

const CardContent = styled(Box)({
  flex: 1,
});

const CardTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '8px',
});

const CardDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: 0,
  lineHeight: 1.5,
});

const TrustBadgesRow = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '32px',
  marginTop: '48px',
  flexWrap: 'wrap',
  '@media (max-width: 576px)': {
    gap: '16px',
  },
});

const TrustBadge = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  backgroundColor: '#F8FAFC',
  borderRadius: '8px',
  border: `1px solid ${colors.border.light}`,
  '& svg': {
    fontSize: '20px',
    color: '#059669',
  },
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    color: colors.text.primary,
  },
});

const complianceFeatures = [
  {
    icon: <VerifiedUser />,
    title: 'UK Right-to-Work Ready',
    description: 'Built-in RTW checks with Home Office compliant verification',
  },
  {
    icon: <Security />,
    title: 'GDPR Compliant',
    description: 'Full data protection compliance with consent management',
  },
  {
    icon: <Cloud />,
    title: 'UK Cloud Infrastructure',
    description: 'All data hosted securely in UK-based data centres',
  },
  {
    icon: <History />,
    title: 'Audit Logs & Activity Tracking',
    description: 'Complete audit trail for all system activities',
  },
  {
    icon: <Lock />,
    title: 'Secure Authentication',
    description: 'Enterprise-grade security with 2FA support',
  },
  {
    icon: <Shield />,
    title: 'Data Encryption',
    description: 'End-to-end encryption for all sensitive data',
  },
];

const TrustCompliance = () => {
  return (
    <Section id="trust-compliance">
      <Content>
        <Header>
          <Badge>Security & Compliance</Badge>
          <Title>Built for trust, designed for compliance</Title>
          <Subtitle>Enterprise-grade security that banks and investors expect</Subtitle>
        </Header>
        
        <ComplianceGrid>
          {complianceFeatures.map((feature, index) => (
            <ComplianceCard key={index}>
              <IconWrapper>{feature.icon}</IconWrapper>
              <CardContent>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </ComplianceCard>
          ))}
        </ComplianceGrid>

        <TrustBadgesRow>
          <TrustBadge>
            <Shield />
            <span>SOC 2 Ready</span>
          </TrustBadge>
          <TrustBadge>
            <Security />
            <span>ISO 27001 Aligned</span>
          </TrustBadge>
          <TrustBadge>
            <Lock />
            <span>256-bit SSL</span>
          </TrustBadge>
          <TrustBadge>
            <VerifiedUser />
            <span>ICO Registered</span>
          </TrustBadge>
        </TrustBadgesRow>
      </Content>
    </Section>
  );
};

export default TrustCompliance;
