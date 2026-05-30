import React from 'react';
import { Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Timer, CheckCircle, Warning, Star } from '@mui/icons-material';
import { Button } from '../controls';
import { colors } from '../../utilities/colors';
import { useGetSubscriptionSummaryQuery } from '../../store/slices/subscriptionSlice';

const BannerContainer = styled(Box)<{ variant: 'trial' | 'expiring' | 'expired' | 'active' }>(({ variant }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  borderRadius: '12px',
  marginBottom: '24px',
  background: variant === 'trial' 
    ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    : variant === 'expiring'
    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    : variant === 'expired'
    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  color: 'white',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  flexWrap: 'wrap',
  gap: '16px',
}));

const ContentSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
  minWidth: '280px',
});

const IconWrapper = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TextContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const Title = styled('div')({
  fontSize: '1rem',
  fontWeight: 600,
});

const Subtitle = styled('div')({
  fontSize: '0.875rem',
  opacity: 0.9,
});

const ActionButton = styled(Button)({
  background: 'white',
  color: colors.primary.main,
  fontWeight: 600,
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.9)',
  },
});

export const SubscriptionBanner: React.FC = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useGetSubscriptionSummaryQuery();

  if (isLoading || !summary) {
    return null;
  }

  const { planName, isTrialing, isExpired, daysRemaining, canAccessDashboard } = summary;

  // Determine banner variant
  let variant: 'trial' | 'expiring' | 'expired' | 'active' = 'active';
  let icon = <CheckCircle sx={{ fontSize: 28 }} />;
  let title = `${planName} Plan`;
  let subtitle = 'Your subscription is active';
  let showButton = false;
  let buttonText = 'View Plans';

  if (isExpired) {
    variant = 'expired';
    icon = <Warning sx={{ fontSize: 28 }} />;
    title = 'Subscription Expired';
    subtitle = 'Your free trial has ended. Upgrade to continue using StaffSync.';
    showButton = true;
    buttonText = 'Upgrade Now';
  } else if (isTrialing) {
    if (daysRemaining !== null && daysRemaining <= 30) {
      variant = 'expiring';
      icon = <Timer sx={{ fontSize: 28 }} />;
      title = `Free Trial - ${daysRemaining} days left`;
      subtitle = daysRemaining <= 5 
        ? 'Your trial is ending soon! Upgrade to keep your data.'
        : 'Upgrade to a paid plan to continue after your trial ends.';
      showButton = true;
      buttonText = 'View Plans';
    } else {
      variant = 'trial';
      icon = <Star sx={{ fontSize: 28 }} />;
      title = `Free Trial (${daysRemaining} days remaining)`;
      subtitle = 'Enjoy full access to all features during your trial.';
      showButton = true;
      buttonText = 'View Plans';
    }
  } else if (planName === 'Standard' || planName === 'Enterprise') {
    variant = 'active';
    icon = <CheckCircle sx={{ fontSize: 28 }} />;
    title = `${planName} Plan`;
    subtitle = 'Your subscription is active';
    showButton = false;
  }

  // Don't show banner for active paid subscriptions
  if (variant === 'active' && !isTrialing) {
    return null;
  }

  return (
    <BannerContainer variant={variant}>
      <ContentSection>
        <IconWrapper>
          {icon}
        </IconWrapper>
        <TextContent>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TextContent>
      </ContentSection>
      {showButton && (
        <ActionButton onClick={() => navigate('/settings/billing')}>
          {buttonText}
        </ActionButton>
      )}
    </BannerContainer>
  );
};

export default SubscriptionBanner;
