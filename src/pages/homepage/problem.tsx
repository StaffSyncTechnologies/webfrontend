import { Box, styled } from '@mui/material';
import { 
  ErrorOutline, 
  PersonOff, 
  Warning, 
  ReceiptLong, 
  VisibilityOff 
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';

const Section = styled(Box)({
  padding: '80px 48px',
  backgroundColor: '#FEF2F2',
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

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '30px',
  fontWeight: 700,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '48px',
  lineHeight: 1.3,
  '@media (max-width: 768px)': {
    fontSize: '28px',
    marginBottom: '32px',
  },
});

const PainPointsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '24px',
  '@media (max-width: 1100px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  '@media (max-width: 768px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr',
  },
});

const PainPoint = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 16px',
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #FCA5A5',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
  },
});

const IconWrapper = styled(Box)({
  width: '56px',
  height: '56px',
  borderRadius: '12px',
  backgroundColor: '#FEE2E2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  '& svg': {
    fontSize: '28px',
    color: '#DC2626',
  },
});

const PainPointText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  textAlign: 'center',
  lineHeight: 1.4,
});

const painPoints = [
  {
    icon: <ErrorOutline />,
    text: 'Last-minute shift chaos',
  },
  {
    icon: <PersonOff />,
    text: 'Worker no-shows',
  },
  {
    icon: <Warning />,
    text: 'Compliance risks',
  },
  {
    icon: <ReceiptLong />,
    text: 'Manual payroll coordination',
  },
  {
    icon: <VisibilityOff />,
    text: 'Poor visibility',
  },
];

const Problem = () => {
  return (
    <Section id="problem">
      <Content>
        <Title>
          Staffing agencies are still running on<br />
          spreadsheets and WhatsApp
        </Title>
        
        <PainPointsGrid>
          {painPoints.map((point, index) => (
            <PainPoint key={index}>
              <IconWrapper>{point.icon}</IconWrapper>
              <PainPointText>{point.text}</PainPointText>
            </PainPoint>
          ))}
        </PainPointsGrid>
      </Content>
    </Section>
  );
};

export default Problem;
