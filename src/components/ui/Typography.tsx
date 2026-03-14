import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../contexts';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'error' | 'success' | 'warning';
}

const variantClasses = {
  h1: 'text-3xl font-outfit-bold',
  h2: 'text-2xl font-outfit-bold',
  h3: 'text-xl font-outfit-semibold',
  body: 'text-base font-outfit',
  bodySmall: 'text-sm font-outfit',
  caption: 'text-xs font-outfit',
  label: 'text-sm font-outfit-medium',
};

export function Typography({
  children,
  variant = 'body',
  color = 'primary',
  className = '',
  ...props
}: TypographyProps) {
  const { isDark } = useTheme();

  const colorClasses = {
    primary: isDark ? 'text-dark-text-primary' : 'text-light-text-primary',
    secondary: isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary',
    muted: isDark ? 'text-dark-text-muted' : 'text-light-text-muted',
    inverse: isDark ? 'text-light-text-primary' : 'text-dark-text-primary',
    error: 'text-status-error',
    success: 'text-status-success',
    warning: 'text-status-warning',
  };

  return (
    <Text className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`} {...props}>
      {children}
    </Text>
  );
}

export const H1 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h1" {...props} />;
export const H2 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h2" {...props} />;
export const H3 = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="h3" {...props} />;
export const Body = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="body" {...props} />;
export const Caption = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="caption" {...props} />;
export const Label = (props: Omit<TypographyProps, 'variant'>) => <Typography variant="label" {...props} />;

export default Typography;
