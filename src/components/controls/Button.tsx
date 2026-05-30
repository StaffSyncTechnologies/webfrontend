import { Button as MuiButton, styled, type ButtonProps as MuiButtonProps } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../utilities/colors';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'outline';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'customVariant',
})<{ customVariant: 'primary' | 'outline' }>(
  ({ customVariant }) => ({
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    minHeight: '48px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    gap: '8px',
    
    '& .MuiButton-startIcon': {
      marginRight: '4px',
      marginLeft: 0,
    },
    '& .MuiButton-endIcon': {
      marginLeft: '4px',
      marginRight: 0,
    },

    ...(customVariant === 'primary' && {
      backgroundColor: colors.primary.blue,
      color: colors.secondary.white,
      border: `2px solid ${colors.primary.blue}`,
      '&:hover': {
        backgroundColor: '#0095d9',
        borderColor: '#0095d9',
        boxShadow: 'none',
      },
      '&:active': {
        backgroundColor: '#0080c0',
      },
      '&:disabled': {
        backgroundColor: colors.interactive.disabled,
        borderColor: colors.interactive.disabled,
        color: colors.secondary.white,
      },
    }),

    ...(customVariant === 'outline' && {
      backgroundColor: 'transparent',
      color: colors.primary.navy,
      border: `2px solid ${colors.primary.navy}`,
      '&:hover': {
        backgroundColor: 'rgba(44, 45, 72, 0.04)',
        borderColor: colors.primary.navy,
      },
      '&:active': {
        backgroundColor: 'rgba(44, 45, 72, 0.08)',
      },
      '&:disabled': {
        borderColor: colors.interactive.disabled,
        color: colors.interactive.disabled,
      },
    }),
  })
);

export function Button({
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  return (
    <StyledButton customVariant={variant} {...props}>
      {children}
    </StyledButton>
  );
}

export default Button;
