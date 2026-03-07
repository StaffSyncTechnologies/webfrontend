import { Box, styled } from '@mui/material';
import { 
  Warehouse, 
  HealthAndSafety, 
  LocalShipping, 
  Groups 
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';

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

const SegmentsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 576px)': {
    gridTemplateColumns: '1fr',
  },
});

const SegmentCard = styled(Box)({
  padding: '32px 24px',
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  border: `1px solid ${colors.border.light}`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: colors.primary.blue,
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.1)',
    '& .icon-wrapper': {
      backgroundColor: colors.primary.blue,
      '& svg': {
        color: colors.secondary.white,
      },
    },
  },
});

const IconWrapper = styled(Box)({
  width: '72px',
  height: '72px',
  borderRadius: '16px',
  backgroundColor: '#E0F2FE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
  '& svg': {
    fontSize: '36px',
    color: colors.primary.blue,
    transition: 'all 0.3s ease',
  },
});

const SegmentTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '12px',
});

const SegmentDescription = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: 0,
  lineHeight: 1.6,
});

const segments = [
  {
    icon: <Warehouse />,
    title: 'Warehouse Staffing',
    description: 'Manage high-volume temporary workers across multiple sites',
  },
  {
    icon: <HealthAndSafety />,
    title: 'Care & Healthcare',
    description: 'Compliance-first scheduling for care homes and NHS contracts',
  },
  {
    icon: <LocalShipping />,
    title: 'Logistics Providers',
    description: 'Real-time tracking for drivers and delivery personnel',
  },
  {
    icon: <Groups />,
    title: 'Temp Workforce Agencies',
    description: 'Scalable platform for growing staffing businesses',
  },
];

const WhoItsFor = () => {
  return (
    <Section id="who-its-for">
      <Content>
        <Badge>Who It's For</Badge>
        <Title>Built for modern staffing agencies</Title>
        <Subtitle>Specialised solutions for your industry vertical</Subtitle>
        
        <SegmentsGrid>
          {segments.map((segment, index) => (
            <SegmentCard key={index}>
              <IconWrapper className="icon-wrapper">{segment.icon}</IconWrapper>
              <SegmentTitle>{segment.title}</SegmentTitle>
              <SegmentDescription>{segment.description}</SegmentDescription>
            </SegmentCard>
          ))}
        </SegmentsGrid>
      </Content>
    </Section>
  );
};

export default WhoItsFor;
