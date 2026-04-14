import { useState, useEffect } from 'react';
import { Box, styled, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Star, Timer, Warning, Business, Close } from '@mui/icons-material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, PageTitle } from '../../components/layout';
import { Button } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { 
  useGetSubscriptionSummaryQuery, 
  useGetPlansQuery,
  useCreateCheckoutMutation,
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
} from '../../store/slices/subscriptionSlice';
import { useToast } from '../../hooks';

// ============ STYLED COMPONENTS ============
const PageHeader = styled(Box)({
  marginBottom: '32px',
});

const PageSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '8px 0 0',
});

const CurrentPlanCard = styled(Box)<{ isExpired?: boolean }>(({ isExpired }) => ({
  background: isExpired 
    ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
    : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '32px',
  border: isExpired ? '1px solid #FCA5A5' : '1px solid #93C5FD',
}));

const PlanHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
});

const PlanInfo = styled(Box)({});

const PlanLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  color: colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '4px',
});

const PlanName = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '24px',
  fontWeight: 700,
  color: colors.primary.navy,
});

const PlanStatus = styled(Box)<{ status: 'active' | 'expiring' | 'expired' }>(({ status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  borderRadius: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  backgroundColor: status === 'active' ? '#D1FAE5' : status === 'expiring' ? '#FEF3C7' : '#FEE2E2',
  color: status === 'active' ? '#059669' : status === 'expiring' ? '#D97706' : '#DC2626',
}));

const PlanDetails = styled(Box)({
  display: 'flex',
  gap: '32px',
  flexWrap: 'wrap',
});

const PlanDetail = styled(Box)({
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
    marginBottom: '4px',
  },
  '& .value': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
});

const PlansSection = styled(Box)({
  marginTop: '32px',
});

const SectionTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 24px',
});

const PlansGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px',
});

const BillingToggle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '24px',
});

const ToggleOption = styled('button')<{ active?: boolean }>(({ active }) => ({
  padding: '8px 20px',
  borderRadius: '8px',
  border: active ? `2px solid ${colors.primary.blue}` : '1px solid #E5E7EB',
  backgroundColor: active ? colors.primary.blue + '10' : 'transparent',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: active ? 600 : 400,
  color: active ? colors.primary.blue : colors.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': { borderColor: colors.primary.blue },
}));

const SaveBadge = styled('span')({
  backgroundColor: '#D1FAE5',
  color: '#059669',
  padding: '2px 8px',
  borderRadius: '10px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  marginLeft: '6px',
});

const PlanCard = styled(Box)<{ recommended?: boolean }>(({ recommended }) => ({
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  padding: '24px',
  border: recommended ? `2px solid ${colors.primary.blue}` : '1px solid #E5E7EB',
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
  },
}));

const RecommendedBadge = styled(Box)({
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: colors.primary.blue,
  color: 'white',
  padding: '4px 16px',
  borderRadius: '12px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
});

const PlanCardHeader = styled(Box)({
  textAlign: 'center',
  marginBottom: '24px',
  paddingBottom: '24px',
  borderBottom: '1px solid #E5E7EB',
});

const PlanCardIcon = styled(Box)<{ color: string }>(({ color }) => ({
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  backgroundColor: color + '20',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
  '& svg': {
    fontSize: '28px',
    color: color,
  },
}));

const PlanCardName = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 700,
  color: colors.primary.navy,
  marginBottom: '8px',
});

const PlanCardPrice = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '32px',
  fontWeight: 700,
  color: colors.primary.navy,
  '& span': {
    fontSize: '14px',
    fontWeight: 400,
    color: colors.text.secondary,
  },
});

const PlanCardDescription = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  marginTop: '8px',
});

const FeaturesList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: '0 0 24px',
});

const FeatureItem = styled('li')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 0',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.primary,
  borderBottom: '1px solid #F3F4F6',
  '&:last-child': {
    borderBottom: 'none',
  },
  '& svg': {
    fontSize: '18px',
    color: '#10B981',
  },
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px',
});

// ============ COMPONENT ============
export function BillingPage() {
  useDocumentTitle('Billing & Plans');
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Handle checkout success/failure from URL parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    
    if (success === 'demo' && sessionId === 'demo') {
      toast.success('Demo checkout completed successfully! (This is a simulation - no actual payment was processed)');
      // Clear the URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    } else if (success === 'true' && sessionId) {
      toast.success('Payment completed successfully!');
      // Refresh subscription data
      window.location.reload();
    } else if (success === 'canceled') {
      toast.info('Payment was canceled');
      // Clear the URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, toast]);

  const { data: subscription, isLoading: subLoading } = useGetSubscriptionSummaryQuery();
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery();
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateCheckoutMutation();
  const [cancelSubscription, { isLoading: cancelLoading }] = useCancelSubscriptionMutation();
  const [updateSubscription, { isLoading: updateLoading }] = useUpdateSubscriptionMutation();

  const handleUpgrade = async (planTier: string) => {
    try {
      // Check if user has existing subscription
      if (subscription?.planTier && subscription.planTier !== 'FREE') {
        // For existing subscriptions, use update endpoint
        const result = await updateSubscription({ planTier, billingCycle }).unwrap();
        toast.success('Subscription upgraded successfully!');
        // Refresh subscription data
        window.location.reload();
      } else {
        // For new subscriptions, use checkout
        const result = await createCheckout({ planTier, billingCycle }).unwrap();
        if (result.url) {
          window.location.href = result.url;
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upgrade subscription');
    }
  };

  const handleCancel = async (immediately: boolean = false) => {
    try {
      await cancelSubscription({ immediately }).unwrap();
      toast.success(immediately ? 'Subscription canceled immediately' : 'Subscription will cancel at period end');
      setShowCancelDialog(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (subLoading || plansLoading) {
    return (
      <DashboardContainer header={<PageTitle>Billing & Plans</PageTitle>}>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  const isExpired = subscription?.isExpired;
  const isExpiring = subscription?.isTrialing && (subscription?.daysRemaining ?? 0) <= 30;
  const statusType = isExpired ? 'expired' : isExpiring ? 'expiring' : 'active';

  return (
    <DashboardContainer header={<PageTitle>Billing & Plans</PageTitle>}>
      <PageHeader>
        <PageSubtitle>Manage your subscription and billing details</PageSubtitle>
      </PageHeader>

      {/* Current Plan */}
      <CurrentPlanCard isExpired={isExpired}>
        <PlanHeader>
          <PlanInfo>
            <PlanLabel>Current Plan</PlanLabel>
            <PlanName>{subscription?.planName || 'Free Trial'}</PlanName>
          </PlanInfo>
          <Box display="flex" alignItems="center" gap="12px">
            <PlanStatus status={statusType}>
              {statusType === 'active' && <CheckCircle sx={{ fontSize: 16 }} />}
              {statusType === 'expiring' && <Timer sx={{ fontSize: 16 }} />}
              {statusType === 'expired' && <Warning sx={{ fontSize: 16 }} />}
              {statusType === 'active' ? 'Active' : statusType === 'expiring' ? 'Expiring Soon' : 'Expired'}
            </PlanStatus>
            {subscription?.planTier !== 'FREE' && subscription?.planTier && statusType === 'active' && (
              <Button 
                variant="outline" 
                size="small"
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelLoading}
              >
                Cancel Plan
              </Button>
            )}
          </Box>
        </PlanHeader>
        <PlanDetails>
          {subscription?.isTrialing && (
            <>
              <PlanDetail>
                <div className="label">Days Remaining</div>
                <div className="value">{subscription.daysRemaining ?? 0} days</div>
              </PlanDetail>
              <PlanDetail>
                <div className="label">Trial Ends</div>
                <div className="value">{formatDate(subscription.trialEnd)}</div>
              </PlanDetail>
            </>
          )}
          {!subscription?.isTrialing && subscription?.currentPeriodEnd && (
            <PlanDetail>
              <div className="label">Next Billing Date</div>
              <div className="value">{formatDate(subscription.currentPeriodEnd)}</div>
            </PlanDetail>
          )}
          <PlanDetail>
            <div className="label">Status</div>
            <div className="value">{subscription?.status || 'TRIALING'}</div>
          </PlanDetail>
        </PlanDetails>
      </CurrentPlanCard>

      {/* Available Plans */}
      <PlansSection>
        <SectionTitle>Available Plans</SectionTitle>

        {/* Billing Cycle Toggle */}
        {(() => {
          const paidPlans = (plansData?.plans || []).filter(
            (p: any) => p.monthlyPricePerWorker && p.yearlyPricePerWorker && !p.isCustomPricing
          );
          const avgSave = paidPlans.length > 0
            ? Math.round(
                paidPlans.reduce((sum: number, p: any) => 
                  sum + ((p.monthlyPricePerWorker - p.yearlyPricePerWorker) / p.monthlyPricePerWorker) * 100, 0
                ) / paidPlans.length
              )
            : 0;
          return (
            <BillingToggle>
              <ToggleOption active={billingCycle === 'monthly'} onClick={() => setBillingCycle('monthly')}>
                Monthly
              </ToggleOption>
              <ToggleOption active={billingCycle === 'yearly'} onClick={() => setBillingCycle('yearly')}>
                Yearly {avgSave > 0 && <SaveBadge>Save {avgSave}%</SaveBadge>}
              </ToggleOption>
            </BillingToggle>
          );
        })()}

        <PlansGrid>
          {(plansData?.plans || []).map((plan: any) => {
            const isCurrent = subscription?.planTier === plan.id;
            const isFree = plan.id === 'FREE';
            const isEnterprise = plan.isCustomPricing;
            const isRecommended = plan.id === 'PROFESSIONAL';

            const iconColors: Record<string, string> = {
              FREE: '#10B981',
              STARTER: '#F59E0B',
              PROFESSIONAL: colors.primary.blue,
              BUSINESS: '#8B5CF6',
              ENTERPRISE: '#7C3AED',
            };
            const iconMap: Record<string, any> = {
              FREE: <Star />,
              STARTER: <CheckCircle />,
              PROFESSIONAL: <CheckCircle />,
              BUSINESS: <Business />,
              ENTERPRISE: <Business />,
            };

            const price = isFree
              ? '£0'
              : isEnterprise
                ? 'Custom'
                : billingCycle === 'yearly' && plan.yearlyPricePerWorker
                  ? `£${(plan.yearlyPricePerWorker / 100).toFixed(2)}`
                  : plan.monthlyPricePerWorker
                    ? `£${(plan.monthlyPricePerWorker / 100).toFixed(2)}`
                    : 'Custom';

            const priceLabel = isFree
              ? '/month'
              : isEnterprise
                ? ' pricing'
                : '/worker/month';

            const description = isFree
              ? `${plansData?.freeTrialDays || 180} days free access to all features - Unlimited workers`
              : isEnterprise
                ? `${plan.minWorkers}+ workers - custom solution`
                : `${plan.minWorkers} - ${plan.maxWorkers} workers`;

            return (
              <PlanCard key={plan.id} recommended={isRecommended}>
                {isRecommended && <RecommendedBadge>Recommended</RecommendedBadge>}
                <PlanCardHeader>
                  <PlanCardIcon color={iconColors[plan.id] || colors.primary.blue}>
                    {iconMap[plan.id] || <CheckCircle />}
                  </PlanCardIcon>
                  <PlanCardName>{plan.name}</PlanCardName>
                  <PlanCardPrice>
                    {price} <span>{priceLabel}</span>
                  </PlanCardPrice>
                  <PlanCardDescription>{description}</PlanCardDescription>
                </PlanCardHeader>
                <FeaturesList>
                  {(plan.features || []).slice(0, 6).map((f: string, i: number) => (
                    <FeatureItem key={i}><CheckCircle /> {f}</FeatureItem>
                  ))}
                </FeaturesList>
                {isFree ? (
                  <Button variant="outline" fullWidth disabled>
                    {subscription?.isTrialing ? 'Current Plan' : isCurrent ? 'Current Plan' : 'Trial Ended'}
                  </Button>
                ) : isEnterprise ? (
                  <Button variant="outline" fullWidth onClick={() => window.location.href = 'mailto:sales@staffsynctech.co.uk'} disabled={isCurrent}>
                    {isCurrent ? 'Current Plan' : 'Contact Sales'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={checkoutLoading || updateLoading || isCurrent}
                    loading={checkoutLoading || updateLoading}
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                  </Button>
                )}
              </PlanCard>
            );
          })}
        </PlansGrid>
      </PlansSection>

      {/* Cancel Subscription Dialog */}
      <Dialog 
        open={showCancelDialog} 
        onClose={() => !cancelLoading && setShowCancelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap="8px">
              <Warning sx={{ color: colors.status.error, fontSize: 24 }} />
              Cancel Subscription
            </Box>
            <Box
              sx={{ 
                cursor: 'pointer', 
                padding: '4px',
                borderRadius: '4px',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
              onClick={() => !cancelLoading && setShowCancelDialog(false)}
            >
              <Close sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <strong>Current Plan:</strong> {subscription?.planName || 'Free Trial'}
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <strong>What happens when you cancel?</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>You'll continue to have access until the end of your current billing period</li>
              <li>No further charges will be made to your account</li>
              <li>You can reactivate your subscription anytime before it expires</li>
              <li>Your data will be retained for 90 days after cancellation</li>
            </ul>
          </Box>

          <Box sx={{ mb: 3 }}>
            <strong>Need help?</strong>
            <br />
            Contact our support team at support@staffsync.com for assistance with alternative plans or temporary suspensions.
          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            variant="outline" 
            onClick={() => setShowCancelDialog(false)}
            disabled={cancelLoading}
          >
            Keep Subscription
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleCancel(false)}
            disabled={cancelLoading}
            loading={cancelLoading}
          >
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
}

export default BillingPage;
