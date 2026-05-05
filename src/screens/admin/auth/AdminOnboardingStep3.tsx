import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme } from '../../../contexts';
import { Caption, Input, Body } from '../../../components/ui';

interface Props {
  adminData: {
    fullName: string;
    email: string;
    jobTitle: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  };
  setAdminData: (data: any) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

export function AdminOnboardingStep3({ 
  adminData, 
  setAdminData, 
  showPassword, 
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword
}: Props) {
  const { isDark } = useTheme();

  return (
    <View className="gap-4">
      <View>
        <Caption color="secondary" className="mb-2">Full Name<Body className="text-red-500">*</Body></Caption>
        <Input
          placeholder="Enter your full name"
          value={adminData.fullName}
          onChangeText={(text: string) => setAdminData({ ...adminData, fullName: text })}
        />
      </View>
      <View>
        <Caption color="secondary" className="mb-2">Email Address<Body className="text-red-500">*</Body></Caption>
        <Input
          placeholder="Enter your email"
          value={adminData.email}
          onChangeText={(text: string) => setAdminData({ ...adminData, email: text })}
          keyboardType="email-address"
        />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Job Title<Body className="text-red-500">*</Body></Caption>
          <Input
            placeholder="Select job title"
            value={adminData.jobTitle}
            onChangeText={(text: string) => setAdminData({ ...adminData, jobTitle: text })}
            rightIcon={<Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />}
          />
        </View>
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Phone Number<Body className="text-red-500">*</Body></Caption>
          <Input
            placeholder="Enter phone number"
            value={adminData.phoneNumber}
            onChangeText={(text: string) => setAdminData({ ...adminData, phoneNumber: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Password<Body className="text-red-500">*</Body></Caption>
          <Input
            placeholder="Enter password"
            value={adminData.password}
            onChangeText={(text: string) => setAdminData({ ...adminData, password: text })}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
              </TouchableOpacity>
            }
          />
        </View>
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Confirm password<Body className="text-red-500">*</Body></Caption>
          <Input
            placeholder="Confirm password"
            value={adminData.confirmPassword}
            onChangeText={(text: string) => setAdminData({ ...adminData, confirmPassword: text })}
            secureTextEntry={!showConfirmPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
              </TouchableOpacity>
            }
          />
        </View>
      </View>
      <View className="flex-row items-center gap-2 mt-2">
        <Ionicons name="help-circle-outline" size={18} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
        <Caption color="secondary" className="text-xs">
          Password must contain uppercase, lowercase, numbers & symbols
        </Caption>
      </View>
    </View>
  );
}
