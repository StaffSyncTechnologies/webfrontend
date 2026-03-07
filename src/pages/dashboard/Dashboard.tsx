import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { People, Close, CheckCircle, Settings, LocationOn, Palette, ArrowForward } from '@mui/icons-material';
import { Box, styled, Modal, IconButton, LinearProgress } from '@mui/material';
import { DashboardContainer, PageTitle, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { SubscriptionBanner } from '../../components/dashboard/SubscriptionBanner';

// ============ ONBOARDING MODAL STYLES ============
const ModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  padding: '32px',
  width: '480px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const WelcomeIcon = styled(Box)({
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${colors.primary.blue} 0%, #1E40AF 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  '& svg': { fontSize: '36px', color: colors.secondary.white },
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '24px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px',
  textAlign: 'center',
});

const ModalSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
  lineHeight: 1.5,
});

const ProgressSection = styled(Box)({
  marginBottom: '24px',
});

const ProgressHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
});

const ProgressLabel = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.primary.navy,
});

const ProgressPercent = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: colors.primary.blue,
});

const StyledProgress = styled(LinearProgress)({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: '#E5E7EB',
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
    background: `linear-gradient(90deg, ${colors.primary.blue} 0%, #1E40AF 100%)`,
  },
});

const StepsList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '24px',
});

const StepItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed?: boolean }>(({ completed }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: '10px',
  border: `1px solid ${completed ? '#D1FAE5' : '#E5E7EB'}`,
  backgroundColor: completed ? '#F0FDF4' : '#F9FAFB',
  cursor: completed ? 'default' : 'pointer',
  transition: 'all 0.2s',
  '&:hover': completed ? {} : { borderColor: colors.primary.blue, backgroundColor: '#EFF6FF' },
}));

const StepIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed?: boolean }>(({ completed }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: completed ? '#D1FAE5' : '#E0F2FE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': { fontSize: '20px', color: completed ? '#059669' : colors.primary.blue },
}));

const StepContent = styled(Box)({
  flex: 1,
});

const StepTitle = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.navy,
});

const StepDesc = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
  marginTop: '2px',
});

const CompleteBadge = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: '12px',
  backgroundColor: '#D1FAE5',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  color: '#059669',
});

const GoToSettingsBtn = styled('button')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px',
  borderRadius: '10px',
  border: 'none',
  background: `linear-gradient(135deg, ${colors.primary.navy} 0%, #1E3A5F 100%)`,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': { opacity: 0.9, transform: 'translateY(-1px)' },
});

const SkipLink = styled('button')({
  display: 'block',
  width: '100%',
  marginTop: '12px',
  padding: '10px',
  border: 'none',
  backgroundColor: 'transparent',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { color: colors.primary.navy },
});

// ============ COMPONENT ============
export function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Mock onboarding status - in real app, this would come from API/context
  const onboardingSteps = [
    { key: 'branding', title: 'Set up branding', desc: 'Upload logo and set brand colors', icon: <Palette />, completed: false },
    { key: 'location', title: 'Add location', desc: 'Add your first work location', icon: <LocationOn />, completed: false },
    { key: 'profile', title: 'Complete profile', desc: 'Fill in organization details', icon: <Settings />, completed: true },
  ];

  const completedSteps = onboardingSteps.filter(s => s.completed).length;
  const totalSteps = onboardingSteps.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const isOnboardingComplete = completedSteps === totalSteps;

  useEffect(() => {
    // Check if first time visit (in real app, check API/localStorage)
    const hasSeenOnboarding = localStorage.getItem('staffsync_onboarding_dismissed');
    if (!hasSeenOnboarding && !isOnboardingComplete) {
      setShowOnboarding(true);
    }
  }, [isOnboardingComplete]);

  const handleDismiss = () => {
    localStorage.setItem('staffsync_onboarding_dismissed', 'true');
    setShowOnboarding(false);
  };

  const handleGoToSettings = () => {
    setShowOnboarding(false);
    navigate('/settings');
  };

  return (
    <DashboardContainer
      header={<PageTitle>Dashboard</PageTitle>}
    >
      {/* Subscription Status Banner */}
      <SubscriptionBanner />

      <GridCols4>
        <StatsCard
          title="Total Workers"
          value="40"
          icon={<People />}
          iconBgColor="#E0F7FA"
          trend={{ value: '8.5%', label: 'this week', direction: 'up' }}
        />
        <StatsCard
          title="Active Shifts"
          value="124"
          icon={<People />}
          iconBgColor="#E8F5E9"
          trend={{ value: '12%', label: 'this month', direction: 'up' }}
        />
        <StatsCard
          title="Pending Invoices"
          value="8"
          icon={<People />}
          iconBgColor="#FFF3E0"
          trend={{ value: '3%', label: 'this week', direction: 'down' }}
        />
        <StatsCard
          title="Total Clients"
          value="15"
          icon={<People />}
          iconBgColor="#F3E5F5"
          trend={{ value: '5%', label: 'this month', direction: 'up' }}
        />
      </GridCols4>

      {/* Onboarding Modal */}
      <Modal open={showOnboarding} onClose={handleDismiss}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={handleDismiss}><Close /></ModalClose>
            
            <WelcomeIcon>
              <Settings />
            </WelcomeIcon>
            
            <ModalTitle>Complete Your Profile</ModalTitle>
            <ModalSubtitle>
              Welcome to StaffSync! Complete a few quick steps to set up your organization and start managing your workforce.
            </ModalSubtitle>

            <ProgressSection>
              <ProgressHeader>
                <ProgressLabel>Setup Progress</ProgressLabel>
                <ProgressPercent>{progressPercent}% Complete</ProgressPercent>
              </ProgressHeader>
              <StyledProgress variant="determinate" value={progressPercent} />
            </ProgressSection>

            <StepsList>
              {onboardingSteps.map((step) => (
                <StepItem key={step.key} completed={step.completed} onClick={() => !step.completed && handleGoToSettings()}>
                  <StepIcon completed={step.completed}>
                    {step.completed ? <CheckCircle /> : step.icon}
                  </StepIcon>
                  <StepContent>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDesc>{step.desc}</StepDesc>
                  </StepContent>
                  {step.completed ? (
                    <CompleteBadge><CheckCircle sx={{ fontSize: 14 }} /> Done</CompleteBadge>
                  ) : (
                    <ArrowForward sx={{ fontSize: 18, color: '#9CA3AF' }} />
                  )}
                </StepItem>
              ))}
            </StepsList>

            <GoToSettingsBtn onClick={handleGoToSettings}>
              Go to Settings <ArrowForward sx={{ fontSize: 18 }} />
            </GoToSettingsBtn>
            
            <SkipLink onClick={handleDismiss}>
              I'll do this later
            </SkipLink>
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default Dashboard;
