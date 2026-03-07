import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';
import PricingPlans from '../../components/shared/PricingPlans';

const Section = styled(Box)({
  backgroundColor: colors.secondary.white,
  padding: '80px 48px',
  '@media (max-width: 768px)': {
    padding: '60px 16px',
  },
});

const Content = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  textAlign: 'center',
});

const Badge = styled(Box)({
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: colors.primary.blue,
  marginBottom: '24px',
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.secondary.white,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '36px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '16px',
  '@media (max-width: 768px)': {
    fontSize: '28px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 400,
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '48px',
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const Pricing = () => {
  return (
    <Section id="pricing">
      <Content>
        <Badge>
          <span>Pricing</span>
        </Badge>
        <Title>Simple Pricing Plan</Title>
        <Subtitle>Scale your agency without hidden fees. Choose the plan that fit your goal.</Subtitle>
        
        <PricingPlans showTitle={false} />
      </Content>
    </Section>
  );
};

export default Pricing;
