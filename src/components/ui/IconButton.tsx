import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: IconButtonProps) {
  const { isDark } = useTheme();
  const isDisabled = disabled || loading;

  const variantClasses: Record<IconButtonVariant, string> = {
    primary: 'bg-primary-navy',
    secondary: 'bg-primary-blue',
    ghost: isDark ? 'bg-transparent' : 'bg-transparent',
    outline: isDark ? 'border border-dark-border-default' : 'border border-light-border-default',
  };

  const disabledClass = isDisabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`items-center justify-center rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClass} ${className}`}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color="#00AFEF" /> : children}
    </TouchableOpacity>
  );
}

export default IconButton;
