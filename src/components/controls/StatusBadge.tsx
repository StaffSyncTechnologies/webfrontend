import { styled } from '@mui/material';
import { colors } from '../../utilities/colors';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const Badge = styled('span')<{ variant: BadgeVariant }>(({ variant }) => {
  const colorMap: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: '#E8F5E9', text: colors.status.success },
    warning: { bg: '#FFF3E0', text: colors.status.warning },
    error: { bg: '#FFEBEE', text: colors.status.error },
    info: { bg: '#E3F2FD', text: colors.primary.blue },
    neutral: { bg: '#F3F4F6', text: colors.text.secondary },
  };

  return {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colorMap[variant].text,
    backgroundColor: colorMap[variant].bg,
    padding: '4px 10px',
    borderRadius: '12px',
    display: 'inline-block',
  };
});

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return <Badge variant={variant}>{label}</Badge>;
}

export default StatusBadge;
