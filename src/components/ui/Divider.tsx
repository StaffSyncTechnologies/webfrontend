import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../contexts';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export function Divider({ className = '', vertical = false }: DividerProps) {
  const { isDark } = useTheme();
  const bgClass = isDark ? 'bg-dark-border-light' : 'bg-light-border-light';

  if (vertical) {
    return <View className={`w-px h-full ${bgClass} ${className}`} />;
  }

  return <View className={`h-px w-full ${bgClass} ${className}`} />;
}

export default Divider;
