import React from 'react';
import { View, Image, Text } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-lg' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
  xl: { container: 'w-24 h-24', text: 'text-4xl' },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ source, name, size = 'md', className = '' }: AvatarProps) {
  const { container, text } = sizeClasses[size];

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        className={`${container} rounded-full ${className}`}
        resizeMode="cover"
      />
    );
  }

  return (
    <View className={`${container} rounded-full bg-primary-blue items-center justify-center ${className}`}>
      <Text className={`${text} font-outfit-bold text-white`}>{getInitials(name)}</Text>
    </View>
  );
}

export default Avatar;
