import { Box, styled, CircularProgress } from '@mui/material';
import { Warning, RocketLaunch, CheckCircle } from '@mui/icons-material';
import { colors } from '../utilities/colors';
import { useNavigate } from 'react-router-dom';
import {
  useGetSubscriptionSummaryQuery,
  useGetPlansQuery,
} from '../store/slices/subscriptionSlice';
import type { Plan } from '../store/slices/subscriptionSlice';
import { useState } from 'react';
import { useCreateCheckoutMutation } from '../store/slices/subscriptionSlice';

// ============ STYLED COMPONENTS ============
const PageWrapper = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F5F7FA',
  padding: '24px',
});

const Container = styled(Box)({
  maxWidth: '900px',
  width: '100%',
  textAlign: 'center',
});

const ExpiredCard = styled(Box)({
  backgroundColor: '#FEF2F2',
  borderRadius: '16px',
  padding: '40px 32px',
  marginBottom: '32px',
  border: '1px solid #FECACA',
});

const IconCircle = styled(Box)({
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  backgroundColor: '#FEE2E2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
});

const Title = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px',
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  lineHeight: 1.5,
});

const PlansRow = styled(Box)({
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: '24px',
});

const PlanCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'recommended',
})<{ recommended?: boolean }>(({ recommended }) => ({
  flex: '1 1 280px',
  maxWidth: '380px',
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  padding: '28px 24px',
  border: recommended ? `2px solid ${colors.primary.blue}` : '1px solid #E5E7EB',
  position: 'relative',
  textAlign: 'left',
  boxShadow: recommended ? '0 4px 20px rgba(0, 175, 239, 0.15)' : 'none',
}));

const RecommendedBadge = styled(Box)({
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: colors.primary.blue,
  color: '#fff',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  padding: '4px 16px',
  borderRadius: '12px',
  whiteSpace: 'nowrap',
});

const PlanName = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 4px',
});

const PlanPrice = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '32px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '12px 0 4px',
  '& span': {
    fontSize: '14px',
    fontWeight: 400,
    color: colors.text.secondary,
  },
});

const FeatureList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: '16px 0 20px',
});

const FeatureItem = styled('li')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  padding: '6px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const UpgradeButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'primary' | 'outline' }>(({ variant = 'primary' }) => ({
  width: '100%',
  padding: '12px 24px',
  borderRadius: '8px',
  border: variant === 'outline' ? `1px solid ${colors.primary.navy}` : 'none',
  backgroundColor: variant === 'primary' ? colors.primary.navy : 'transparent',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  color: variant === 'primary' ? '#fff' : colors.primary.navy,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: variant === 'primary' ? '#1a2d5a' : '#F9FAFB',
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
}));

const LogoutLink = styled('button')({
  background: 'none',
  border: 'none',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  textDecoration: 'underline',
  marginTop: '16px',
  '&:hover': {
    color: colors.primary.navy,
  },
});

// ============ COMPONENT ============
export function SubscriptionExpiredPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = useGetSubscriptionSummaryQuery();
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateCheckoutMutation();
  const [billingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = plansData?.plans || [];
  const standardPlan = plans.find((p: Plan) => p.id === 'STANDARD');
  const enterprisePlan = plans.find((p: Plan) => p.id === 'ENTERPRISE');

  const handleUpgrade = async (planTier: string) => {
    try {
      const result = await createCheckout({ planTier, billingCycle }).unwrap();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('persist:auth');
    navigate('/login');
  };

  if (summaryLoading || plansLoading) {
    return (
      <PageWrapper>
        <CircularProgress />
      </PageWrapper>
    );
  }

  const isTrialExpired = summary?.isTrialing === false && summary?.isExpired;
  const expiredLabel = summary?.status === 'CANCELED' ? 'Subscription Cancelled' : 'Free Trial Expired';

  return (
    <PageWrapper>
      <Container>
        <ExpiredCard>
          <IconCircle>
            <Warning sx={{ fontSize: 36, color: '#DC2626' }} />
          </IconCircle>
          <Title>{expiredLabel}</Title>
          <Subtitle>
            Your access to StaffSync has been paused. Upgrade to a plan to continue
            managing your workforce seamlessly. Your data is safe and will be available
            once you subscribe.
          </Subtitle>
        </ExpiredCard>

        <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: colors.primary.navy, mb: 3 }}>
          Choose a Plan to Continue
        </Box>

        <PlansRow>
          {standardPlan && (
            <PlanCard recommended>
              <RecommendedBadge>Recommended</RecommendedBadge>
              <PlanName>{standardPlan.name}</PlanName>
              <PlanPrice>
                £{billingCycle === 'monthly' ? standardPlan.monthlyPrice : standardPlan.yearlyPrice}
                <span> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </PlanPrice>
              <FeatureList>
                {standardPlan.features.map((f, i) => (
                  <FeatureItem key={i}>
                    <CheckCircle sx={{ fontSize: 16, color: colors.status.success }} />
                    {f}
                  </FeatureItem>
                ))}
              </FeatureList>
              <UpgradeButton
                variant="primary"
                onClick={() => handleUpgrade('STANDARD')}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Upgrade to Standard'}
              </UpgradeButton>
            </PlanCard>
          )}

          {enterprisePlan && (
            <PlanCard>
              <PlanName>{enterprisePlan.name}</PlanName>
              <PlanPrice>
                {enterprisePlan.isCustomPricing ? (
                  <>Custom</>
                ) : (
                  <>
                    £{billingCycle === 'monthly' ? enterprisePlan.monthlyPrice : enterprisePlan.yearlyPrice}
                    <span> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </>
                )}
              </PlanPrice>
              <FeatureList>
                {enterprisePlan.features.map((f, i) => (
                  <FeatureItem key={i}>
                    <CheckCircle sx={{ fontSize: 16, color: colors.status.success }} />
                    {f}
                  </FeatureItem>
                ))}
              </FeatureList>
              <UpgradeButton
                variant="outline"
                onClick={() => enterprisePlan.isCustomPricing ? navigate('/contact') : handleUpgrade('ENTERPRISE')}
                disabled={checkoutLoading}
              >
                {enterprisePlan.isCustomPricing ? 'Contact Sales' : 'Upgrade to Enterprise'}
              </UpgradeButton>
            </PlanCard>
          )}
        </PlansRow>

        <LogoutLink onClick={handleLogout}>
          Log out of your account
        </LogoutLink>
      </Container>
    </PageWrapper>
  );
}

export default SubscriptionExpiredPage;
