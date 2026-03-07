import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useOrgTheme } from '../../contexts';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const { primaryColor } = useOrgTheme();
  const isDisabled = disabled || loading;

  const baseClasses = 'flex-row items-center justify-center rounded-xl';
  const widthClass = fullWidth ? 'w-full' : '';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-navy',
    secondary: 'bg-primary-blue',
    outline: 'border-2 border-primary-navy bg-transparent',
    ghost: 'bg-transparent',
    danger: 'bg-status-error',
  };

  const textVariantClasses: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-navy',
    ghost: 'text-primary-navy',
    danger: 'text-white',
  };

  const disabledClass = isDisabled ? 'opacity-50' : '';

  const dynamicStyle = variant === 'primary' ? { backgroundColor: primaryColor } : 
                       variant === 'outline' ? { borderColor: primaryColor } : undefined;

  return (
    <TouchableOpacity
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      style={dynamicStyle}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? primaryColor : '#fff'} />
      ) : (
        <>
          {leftIcon && <Text className="mr-2">{leftIcon}</Text>}
          <Text 
            className={`font-outfit-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]}`}
            style={variant === 'outline' || variant === 'ghost' ? { color: primaryColor } : undefined}
          >
            {children}
          </Text>
          {rightIcon && <Text className="ml-2">{rightIcon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
