import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  className?: string;
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-status-success', text: 'text-white' },
  warning: { bg: 'bg-status-warning', text: 'text-primary-navy' },
  error: { bg: 'bg-status-error', text: 'text-white' },
  info: { bg: 'bg-primary-blue', text: 'text-white' },
  default: { bg: 'bg-secondary-gray', text: 'text-white' },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1',
  md: 'px-4 py-2',
};

const textSizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const { bg, text } = variantClasses[variant];

  return (
    <View className={`flex-row items-center rounded-full ${bg} ${sizeClasses[size]} ${className}`}>
      {icon && <Text className={`${text} ${textSizeClasses[size]} font-outfit-bold mr-2`}>{icon}</Text>}
      <Text className={`${text} ${textSizeClasses[size]} font-outfit-semibold`}>{children}</Text>
    </View>
  );
}

export default Badge;
