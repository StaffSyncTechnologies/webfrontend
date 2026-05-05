import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useOrgTheme } from '../../../contexts';
import { Caption, Input, Body } from '../../../components/ui';

interface Props {
  orgData: {
    organizationName: string;
    organizationEmail: string;
    tradingName: string;
    companyNumber: string;
    industry: string;
    numberOfWorkers: string;
    location: string;
    website: string;
  };
  setOrgData: (data: any) => void;
}

export function AdminOnboardingStep2({ orgData, setOrgData }: Props) {
  const { isDark } = useTheme();

  return (
    <View className="gap-4">
      <View>
        <Caption color="secondary" className="mb-2">Organization Name<Body className="text-red-500">*</Body></Caption>
        <Input
          placeholder="Enter organization name"
          value={orgData.organizationName}
          onChangeText={(text: string) => setOrgData({ ...orgData, organizationName: text })}
        />
      </View>
      <View>
        <Caption color="secondary" className="mb-2">Organization Email address<Body className="text-red-500">*</Body></Caption>
        <Input
          placeholder="Enter email address"
          value={orgData.organizationEmail}
          onChangeText={(text: string) => setOrgData({ ...orgData, organizationEmail: text })}
          keyboardType="email-address"
        />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Trading Name (optional)</Caption>
          <Input
            placeholder="Enter trading name"
            value={orgData.tradingName}
            onChangeText={(text: string) => setOrgData({ ...orgData, tradingName: text })}
          />
        </View>
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Company Number (optional)</Caption>
          <Input
            placeholder="Enter company number"
            value={orgData.companyNumber}
            onChangeText={(text: string) => setOrgData({ ...orgData, companyNumber: text })}
          />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Industry<Body className="text-red-500">*</Body></Caption>
          <Input
            placeholder="Select industry type"
            value={orgData.industry}
            onChangeText={(text: string) => setOrgData({ ...orgData, industry: text })}
            rightIcon={<Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />}
          />
        </View>
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Number of workers<Body className="text-red-500">*</Body></Caption>
          <Input
            placeholder="Select number"
            value={orgData.numberOfWorkers}
            onChangeText={(text: string) => setOrgData({ ...orgData, numberOfWorkers: text })}
            rightIcon={<Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />}
          />
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Location</Caption>
          <Input
            placeholder="Enter company address"
            value={orgData.location}
            onChangeText={(text: string) => setOrgData({ ...orgData, location: text })}
          />
        </View>
        <View className="flex-1">
          <Caption color="secondary" className="mb-2">Website (optional)</Caption>
          <Input
            placeholder="https://"
            value={orgData.website}
            onChangeText={(text: string) => setOrgData({ ...orgData, website: text })}
          />
        </View>
      </View>
    </View>
  );
}
