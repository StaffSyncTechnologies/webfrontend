import { Box, styled } from '@mui/material';
import type { ReactNode } from 'react';
import { ChevronRight } from '@mui/icons-material';
import { colors } from '../../utilities/colors';

export interface ActionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
  badge?: string | number;
  badgeColor?: 'success' | 'warning' | 'error' | 'info';
}

const CardWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'clickable',
})<{ clickable?: boolean }>(({ clickable }) => ({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  border: '1px solid #E5E7EB',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  cursor: clickable ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  ...(clickable && {
    '&:hover': {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      borderColor: colors.primary.blue,
    },
  }),
}));

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor?: string }>(({ bgColor }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: bgColor ?? '#E0F7FA',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: '1.5rem',
    color: colors.primary.blue,
  },
}));

const ContentWrapper = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const Title = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const Description = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.8125rem',
  color: colors.text.secondary,
  margin: '4px 0 0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const Badge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'badgeColor',
})<{ badgeColor?: string }>(({ badgeColor }) => {
  const colorMap: Record<string, string> = {
    success: colors.status.success,
    warning: colors.status.warning,
    error: colors.status.error,
    info: colors.primary.blue,
  };
  const bgColorMap: Record<string, string> = {
    success: '#E8F5E9',
    warning: '#FFF3E0',
    error: '#FFEBEE',
    info: '#E3F2FD',
  };
  
  return {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colorMap[badgeColor ?? 'info'],
    backgroundColor: bgColorMap[badgeColor ?? 'info'],
    padding: '4px 10px',
    borderRadius: '12px',
    flexShrink: 0,
  };
});

const ArrowIcon = styled(ChevronRight)({
  color: colors.text.secondary,
  fontSize: '1.25rem',
  flexShrink: 0,
});

export function ActionCard({
  title,
  description,
  icon,
  iconBgColor,
  onClick,
  badge,
  badgeColor = 'info',
}: ActionCardProps) {
  return (
    <CardWrapper clickable={!!onClick} onClick={onClick}>
      {icon && <IconContainer bgColor={iconBgColor}>{icon}</IconContainer>}
      <ContentWrapper>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </ContentWrapper>
      {badge !== undefined && (
        <Badge badgeColor={badgeColor}>{badge}</Badge>
      )}
      {onClick && <ArrowIcon />}
    </CardWrapper>
  );
}

export default ActionCard;
