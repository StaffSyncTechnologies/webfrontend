import { Box, Paper, styled, type PaperProps } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../utilities/colors';

export interface CardProps extends Omit<PaperProps, 'title'> {
  children?: ReactNode;
  padding?: string | number;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: string;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

const StyledCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'customPadding',
})<{ customPadding?: string | number }>(({ customPadding }) => ({
    backgroundColor: colors.secondary.white,
    borderRadius: '12px',
    padding: customPadding ?? '24px',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #E5E7EB',
  })
);

const StatsTitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text.secondary,
  margin: 0,
});

const StatsValue = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '2rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: '8px 0',
});

const TrendContainer = styled(Box)<{ direction: 'up' | 'down' | 'neutral' }>(
  ({ direction }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 500,
    color:
      direction === 'up'
        ? colors.status.success
        : direction === 'down'
        ? colors.status.error
        : colors.text.secondary,
  })
);

const TrendLabel = styled('span')({
  color: colors.text.secondary,
  marginLeft: '2px',
});

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'iconColor',
})<{ bgColor?: string; iconColor?: string }>(({ bgColor, iconColor }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: bgColor ?? '#E0F7FA',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: iconColor ?? colors.primary.blue,
  '& svg': {
    fontSize: '1.5rem',
  },
}));

const TrendArrow = ({ direction }: { direction: 'up' | 'down' | 'neutral' }) => {
  if (direction === 'up') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17L9 11L13 15L21 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7H21V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (direction === 'down') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 7L9 13L13 9L21 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 17H21V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
};

export function Card({ children, padding, ...props }: CardProps) {
  return (
    <StyledCard customPadding={padding} elevation={0} {...props}>
      {children}
    </StyledCard>
  );
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
}: StatsCardProps) {
  return (
    <Card>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <StatsTitle>{title}</StatsTitle>
          <StatsValue>{value}</StatsValue>
          {trend && (
            <TrendContainer direction={trend.direction}>
              <TrendArrow direction={trend.direction} />
              <span>{trend.value}</span>
              {trend.label && <TrendLabel>{trend.label}</TrendLabel>}
            </TrendContainer>
          )}
        </Box>
        {icon && <IconContainer bgColor={iconBgColor} iconColor={iconColor}>{icon}</IconContainer>}
      </Box>
    </Card>
  );
}

export default Card;
