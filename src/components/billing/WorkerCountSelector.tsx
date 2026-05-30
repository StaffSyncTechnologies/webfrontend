import { Box, Slider, Typography, styled } from '@mui/material';
import { colors } from '../../utilities/colors';
import type { Plan } from '../../store/slices/subscriptionSlice';

interface WorkerCountSelectorProps {
  workerCount: number;
  onWorkerCountChange: (count: number) => void;
  selectedPlan: Plan | null;
  billingCycle: 'monthly' | 'yearly';
}

const Container = styled(Box)({
  padding: '24px',
  backgroundColor: '#F9FAFB',
  borderRadius: '12px',
  marginBottom: '24px',
});

const Label = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: '16px',
});

const WorkerCountDisplay = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
});

const CountText = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '24px',
  fontWeight: 700,
  color: colors.primary.navy,
});

const PriceBreakdown = styled(Box)({
  marginTop: '16px',
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  border: `1px solid ${colors.border.light}`,
});

const PriceRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  '&:last-child': {
    marginBottom: 0,
    paddingTop: '12px',
    borderTop: `2px solid ${colors.border.light}`,
  },
});

const PriceLabel = styled(Typography)<{ isTotal?: boolean }>(({ isTotal }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: isTotal ? '16px' : '14px',
  fontWeight: isTotal ? 700 : 500,
  color: isTotal ? colors.primary.navy : colors.text.secondary,
}));

const PriceValue = styled(Typography)<{ isTotal?: boolean }>(({ isTotal }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: isTotal ? '24px' : '14px',
  fontWeight: isTotal ? 700 : 600,
  color: isTotal ? colors.primary.navy : colors.text.primary,
}));

const StyledSlider = styled(Slider)({
  color: colors.primary.navy,
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: colors.primary.navy,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
  '& .MuiSlider-mark': {
    backgroundColor: colors.border.default,
    height: 8,
    width: 2,
    '&.MuiSlider-markActive': {
      opacity: 1,
      backgroundColor: 'currentColor',
    },
  },
  '& .MuiSlider-markLabel': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const marks = [
  { value: 1, label: '1' },
  { value: 10, label: '10' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 150, label: '150' },
  { value: 200, label: '200' },
];

export const WorkerCountSelector: React.FC<WorkerCountSelectorProps> = ({
  workerCount,
  onWorkerCountChange,
  selectedPlan,
  billingCycle,
}) => {
  const calculatePrice = (plan: Plan | null, workers: number, cycle: 'monthly' | 'yearly') => {
    if (!plan || plan.isCustomPricing) return 0;
    
    const pricePerWorker = cycle === 'yearly' 
      ? plan.yearlyPricePerWorker 
      : plan.monthlyPricePerWorker;
    
    return (workers * pricePerWorker) / 100; // Convert pence to pounds
  };

  const totalPrice = calculatePrice(selectedPlan, workerCount, billingCycle);
  const pricePerWorker = selectedPlan && !selectedPlan.isCustomPricing
    ? (billingCycle === 'yearly' ? selectedPlan.yearlyPricePerWorker : selectedPlan.monthlyPricePerWorker) / 100
    : 0;

  const annualSavings = selectedPlan && !selectedPlan.isCustomPricing
    ? ((selectedPlan.monthlyPricePerWorker - selectedPlan.yearlyPricePerWorker) * workerCount * 12) / 100
    : 0;

  return (
    <Container>
      <Label>Number of Workers</Label>
      
      <WorkerCountDisplay>
        <CountText>{workerCount} {workerCount === 1 ? 'Worker' : 'Workers'}</CountText>
      </WorkerCountDisplay>

      <StyledSlider
        value={workerCount}
        onChange={(_, value) => onWorkerCountChange(value as number)}
        min={1}
        max={200}
        marks={marks}
        valueLabelDisplay="auto"
      />

      {selectedPlan && !selectedPlan.isCustomPricing && (
        <PriceBreakdown>
          <PriceRow>
            <PriceLabel>Price per worker</PriceLabel>
            <PriceValue>£{pricePerWorker.toFixed(2)}/{billingCycle === 'yearly' ? 'month' : 'month'}</PriceValue>
          </PriceRow>
          
          <PriceRow>
            <PriceLabel>Number of workers</PriceLabel>
            <PriceValue>× {workerCount}</PriceValue>
          </PriceRow>

          {billingCycle === 'yearly' && annualSavings > 0 && (
            <PriceRow>
              <PriceLabel style={{ color: '#059669' }}>Annual savings</PriceLabel>
              <PriceValue style={{ color: '#059669' }}>£{annualSavings.toFixed(2)}/year</PriceValue>
            </PriceRow>
          )}

          <PriceRow>
            <PriceLabel isTotal>Total</PriceLabel>
            <PriceValue isTotal>
              £{totalPrice.toFixed(2)}
              <Typography component="span" sx={{ fontSize: '14px', fontWeight: 500, color: colors.text.secondary, ml: 0.5 }}>
                /{billingCycle === 'yearly' ? 'year' : 'month'}
              </Typography>
            </PriceValue>
          </PriceRow>
        </PriceBreakdown>
      )}
    </Container>
  );
};
