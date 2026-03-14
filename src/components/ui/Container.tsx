import React from 'react';
import { View, ViewProps, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  safe?: boolean;
  scroll?: boolean;
  keyboard?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-6',
};

export function Container({
  children,
  safe = true,
  scroll = false,
  keyboard = false,
  padding = 'md',
  className = '',
  ...props
}: ContainerProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bgClass = isDark ? 'bg-dark-background-primary' : 'bg-light-background-primary';

  let content = (
    <View className={`flex-1 ${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </View>
  );

  if (scroll) {
    content = (
      <ScrollView
        className={`flex-1 ${paddingClasses[padding]}`}
        contentContainerClassName="flex-grow"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  if (keyboard) {
    content = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  if (safe) {
    return <View className={`flex-1 ${bgClass}`} style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>{content}</View>;
  }

  return <View className={`flex-1 ${bgClass}`}>{content}</View>;
}

export default Container;
