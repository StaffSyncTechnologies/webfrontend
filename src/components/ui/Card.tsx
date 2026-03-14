import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const { isDark } = useTheme();

  const bgClass = isDark ? 'bg-dark-card' : 'bg-light-card';
  const borderClass = isDark ? 'border-dark-border-light' : 'border-light-border-light';

  const variantClasses = {
    default: bgClass,
    elevated: `${bgClass} shadow-md`,
    outlined: `${bgClass} border ${borderClass}`,
  };

  return (
    <View
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

export default Card;
