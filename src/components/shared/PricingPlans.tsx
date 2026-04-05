import { Box, styled, CircularProgress } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';
import { useGetPlansQuery, type Plan } from '../../store/slices/subscriptionSlice';

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
  showTitle?: boolean;
}

const PlansContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  maxWidth: '1400px',
  margin: '0 auto',
});

const TopTierGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  '@media (max-width: 1200px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 800px)': {
    gridTemplateColumns: '1fr',
  },
});

const EnterpriseContainer = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
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

const fallbackPlans = [
  {
    id: 'FREE',
    name: 'Free Trial',
    monthlyPricePerWorker: 0,
    yearlyPricePerWorker: 0,
    minWorkers: 1,
    maxWorkers: 10,
    features: ['180-day free trial', 'Up to 10 workers', 'Full scheduling features', 'Time tracking & timesheets', 'Invoicing & payroll', 'Reports & analytics', 'Email support'],
    isCustomPricing: false,
    trialDays: 180,
    workerLimit: 10,
    clientLimit: 'Unlimited',
  },
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPricePerWorker: 2.50,
    yearlyPricePerWorker: 2.00,
    minWorkers: 1,
    maxWorkers: 10,
    features: ['1-10 workers', 'Unlimited clients', 'Full scheduling features', 'Time tracking & timesheets', 'Invoicing & payroll', 'Reports & analytics', 'Email support'],
    isCustomPricing: false,
    trialDays: null,
    workerLimit: 10,
    clientLimit: 'Unlimited',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    monthlyPricePerWorker: 3.50,
    yearlyPricePerWorker: 3.00,
    minWorkers: 11,
    maxWorkers: 50,
    features: ['11-50 workers', 'Unlimited clients', 'Everything in Starter', 'Priority email support', 'Advanced reporting', 'Custom branding', 'API access'],
    isCustomPricing: false,
    trialDays: null,
    workerLimit: 50,
    clientLimit: 'Unlimited',
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    monthlyPricePerWorker: 4.50,
    yearlyPricePerWorker: 4.00,
    minWorkers: 51,
    maxWorkers: 200,
    features: ['51-200 workers', 'Unlimited clients', 'Everything in Professional', 'Dedicated account manager', 'Phone support', 'Custom integrations', 'SLA guarantee'],
    isCustomPricing: false,
    trialDays: null,
    workerLimit: 200,
    clientLimit: 'Unlimited',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    monthlyPricePerWorker: null,
    yearlyPricePerWorker: null,
    minWorkers: 201,
    maxWorkers: 'Unlimited',
    features: ['200+ workers', 'Everything in Business', 'White-label branding', 'Custom SLA', 'On-site training', 'Volume discounts', 'Contact sales'],
    isCustomPricing: true,
    trialDays: null,
    workerLimit: 'Unlimited',
    clientLimit: 'Unlimited',
  },
] as Plan[];

function mapPlanToDisplay(plan: Plan) {
  const isFree = plan.id === 'FREE';
  const isEnterprise = plan.isCustomPricing;
  const isProfessional = plan.id === 'PROFESSIONAL';
  
  // Calculate example pricing for 10 workers (or show per-worker price)
  const exampleWorkers = isFree ? 10 : plan.id === 'STARTER' ? 10 : plan.id === 'PROFESSIONAL' ? 25 : plan.id === 'BUSINESS' ? 100 : 0;
  const monthlyTotal = plan.monthlyPricePerWorker ? (plan.monthlyPricePerWorker * exampleWorkers).toFixed(2) : 0;
  const yearlyTotal = plan.yearlyPricePerWorker ? (plan.yearlyPricePerWorker * exampleWorkers).toFixed(2) : 0;
  const yearlySavings = plan.monthlyPricePerWorker && plan.yearlyPricePerWorker 
    ? (((plan.monthlyPricePerWorker - plan.yearlyPricePerWorker) * exampleWorkers * 12) / 100).toFixed(2)
    : 0;

  return {
    id: plan.id,
    name: isProfessional ? `${plan.name} 👑` : plan.name,
    price: isEnterprise ? 'Custom' : isFree ? '£0' : `£${(plan.monthlyPricePerWorker / 100).toFixed(2)}`,
    period: isEnterprise ? '' : isFree ? '/month' : '/worker/month',
    billing: isEnterprise 
      ? 'Contact us for pricing.' 
      : isFree 
        ? '180-day free trial, then upgrade to continue.'
        : `£${(plan.yearlyPricePerWorker / 100).toFixed(2)}/worker/month billed annually. Save £${yearlySavings}/year with ${exampleWorkers} workers.`,
    features: plan.features,
    buttonText: isFree ? 'Start Free Trial' : isEnterprise ? 'Contact Sales' : 'Get Started',
    featured: isProfessional,
    popular: isProfessional,
  };
}

const PricingPlans = ({ onSelectPlan, showTitle = true }: PricingPlansProps) => {
  const navigate = useNavigate();
  const { data: plansData, isLoading } = useGetPlansQuery();

  const backendPlans = plansData?.plans ?? fallbackPlans;
  const displayPlans = backendPlans.map(mapPlanToDisplay);

  const topTierPlans = displayPlans.filter(p => p.id !== 'ENTERPRISE');
  const enterprisePlan = displayPlans.find(p => p.id === 'ENTERPRISE');

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      if (planId === 'ENTERPRISE') {
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
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <PlansContainer>
          <TopTierGrid>
            {topTierPlans.map((plan) => (
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
          </TopTierGrid>
          {enterprisePlan && (
            <EnterpriseContainer>
              <PlanCard featured={enterprisePlan.featured}>
                {enterprisePlan.popular && <PopularBadge>MOST POPULAR</PopularBadge>}
                <PlanName featured={enterprisePlan.featured}>{enterprisePlan.name}</PlanName>
                <PlanPrice featured={enterprisePlan.featured}>
                  <span className="amount">{enterprisePlan.price}</span>
                  <span className="period">{enterprisePlan.period}</span>
                </PlanPrice>
                <BillingNote featured={enterprisePlan.featured}>{enterprisePlan.billing}</BillingNote>
                <FeatureList>
                  {enterprisePlan.features.map((feature, idx) => (
                    <FeatureItem key={idx} featured={enterprisePlan.featured}>
                      <Check />
                      {feature}
                    </FeatureItem>
                  ))}
                </FeatureList>
                <PlanButton
                  featured={enterprisePlan.featured}
                  onClick={() => handleSelectPlan(enterprisePlan.id)}
                >
                  {enterprisePlan.buttonText}
                </PlanButton>
              </PlanCard>
            </EnterpriseContainer>
          )}
        </PlansContainer>
      )}
    </>
  );
};

export default PricingPlans;
