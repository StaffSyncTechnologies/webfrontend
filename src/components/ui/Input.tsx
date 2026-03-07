import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  required,
  ...props
}: InputProps) {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error
    ? 'border-status-error'
    : isFocused
    ? 'border-primary-blue'
    : isDark
    ? 'border-dark-border-default'
    : 'border-light-border-default';

  const bgClass = isDark ? 'bg-dark-background-secondary' : 'bg-light-background-primary';
  const textClass = isDark ? 'text-dark-text-primary' : 'text-light-text-primary';
  const placeholderColor = isDark ? '#6B6B80' : '#9CA3AF';

  return (
    <View className={containerClassName}>
      {label && (
        <Text className={`text-sm font-outfit-medium mb-2 ${isDark ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
          {label}{required && <Text className="text-status-error"> *</Text>}
        </Text>
      )}
      <View className={`flex-row items-center border rounded-xl px-4 ${borderClass} ${bgClass}`}>
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          className={`flex-1 py-4 text-base font-outfit ${textClass} ${className}`}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View className="ml-3">{rightIcon}</View>}
      </View>
      {hint && !error && (
        <View className="flex-row items-center mt-2">
          <Text className="text-xs mr-1 text-secondary-gray">ⓘ</Text>
          <Text className={`text-xs font-outfit ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>{hint}</Text>
        </View>
      )}
      {error && <Text className="text-xs font-outfit text-status-error mt-2">{error}</Text>}
    </View>
  );
}

export default Input;
