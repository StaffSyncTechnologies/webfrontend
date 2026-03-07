import { Box, styled } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
  showTitle?: boolean;
}

const PlansContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  '@media (max-width: 800px)': {
    gridTemplateColumns: '1fr',
  },
});

const PlanCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ featured }) => ({
  padding: '32px 24px',
  borderRadius: '16px',
  border: featured ? 'none' : '1px solid #E5E7EB',
  backgroundColor: featured ? colors.primary.blue : colors.secondary.white,
  color: featured ? colors.secondary.white : colors.text.primary,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}));

const PopularBadge = styled(Box)({
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#E0F7FA',
  color: colors.primary.blue,
  padding: '4px 16px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const PlanName = styled('h3', {
  shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ featured }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 700,
  color: featured ? colors.secondary.white : colors.primary.navy,
  margin: 0,
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const PlanPrice = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ featured }) => ({
  marginBottom: '4px',
  '& .amount': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '36px',
    fontWeight: 700,
    color: featured ? colors.secondary.white : colors.primary.blue,
  },
  '& .period': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    color: featured ? 'rgba(255,255,255,0.8)' : colors.text.secondary,
  },
}));

const BillingNote = styled('p', {
  shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ featured }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: featured ? 'rgba(255,255,255,0.7)' : colors.text.secondary,
  margin: 0,
  marginBottom: '24px',
}));

const FeatureList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  marginBottom: '24px',
  flex: 1,
});

const FeatureItem = styled('li', {
  shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ featured }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: featured ? colors.secondary.white : colors.text.secondary,
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  '& svg': {
    fontSize: '18px',
    color: featured ? colors.secondary.white : colors.primary.blue,
  },
}));

const PlanButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'featured',
})<{ featured?: boolean }>(({ featured }) => ({
  width: '100%',
  padding: '12px 24px',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: featured ? '2px solid white' : 'none',
  backgroundColor: featured ? 'transparent' : colors.primary.blue,
  color: colors.secondary.white,
  '&:hover': {
    backgroundColor: featured ? 'rgba(255,255,255,0.1)' : '#0091E6',
  },
}));

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '8px',
  textAlign: 'center',
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '40px',
  textAlign: 'center',
});

const plans = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '£0',
    period: '/month',
    billing: 'Billed annually.',
    features: ['Free', '180 days free', 'Up to 10 workers', 'Basic shifts scheduling', 'GPS clock-in'],
    buttonText: 'Start Free',
    featured: false,
  },
  {
    id: 'pro',
    name: 'PRO 👑',
    price: '£99',
    period: '/month',
    billing: 'Billed annually.',
    features: ['£99/month', 'Unlimited workers', 'Rota builder', 'Notifications', 'Payroll'],
    buttonText: 'Start Trial',
    featured: true,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: '£X',
    period: '/month',
    billing: 'Billed annually.',
    features: ['Custom', 'White-label', 'API access', 'Priority support', 'Dedicated manager'],
    buttonText: 'Contact Us',
    featured: false,
  },
];

const PricingPlans = ({ onSelectPlan, showTitle = true }: PricingPlansProps) => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      if (planId === 'enterprise') {
        navigate('/contact-us');
      } else {
        navigate('/get-started');
      }
    }
  };

  return (
    <>
      {showTitle && (
        <>
          <Title>Choose Plan</Title>
          <Subtitle>Choose the plan that is right for you to complete your registration</Subtitle>
        </>
      )}
      <PlansContainer>
        {plans.map(plan => (
          <PlanCard key={plan.id} featured={plan.featured}>
            {plan.popular && <PopularBadge>MOST POPULAR</PopularBadge>}
            <PlanName featured={plan.featured}>{plan.name}</PlanName>
            <PlanPrice featured={plan.featured}>
              <span className="amount">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </PlanPrice>
            <BillingNote featured={plan.featured}>{plan.billing}</BillingNote>
            <FeatureList>
              {plan.features.map((feature, index) => (
                <FeatureItem key={index} featured={plan.featured}>
                  <Check />
                  {feature}
                </FeatureItem>
              ))}
            </FeatureList>
            <PlanButton
              featured={plan.featured}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.buttonText}
            </PlanButton>
          </PlanCard>
        ))}
      </PlansContainer>
    </>
  );
};

export default PricingPlans;
