import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Body } from './Typography';
import { useOrgTheme } from '../../contexts';

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

export function StepHeader({ currentStep, totalSteps, onBack }: StepHeaderProps) {
  const { primaryColor } = useOrgTheme();

  return (
    <View>
      {/* Header Row */}
      <View className="flex-row items-center px-4 py-3">
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 items-center justify-center"
          >
            <Body className="text-xl">{'‹'}</Body>
          </TouchableOpacity>
        )}
        <View className="flex-1 items-center" style={onBack ? { marginRight: 40 } : undefined}>
          <Body className="font-outfit-semibold text-base">
            Step {currentStep} of {totalSteps}
          </Body>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="flex-row px-4 gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor: i < currentStep ? primaryColor : '#E5E7EB',
            }}
          />
        ))}
      </View>
    </View>
  );
}

export default StepHeader;
