import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge } from '../../../components/ui';

export function ComplianceDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  // Mock data - replace with API later
  const stats = {
    rtwApproved: { count: 42, change: 5 },
    rtwPending: { count: 8, change: -2 },
    documentsVerified: { count: 38, change: 3 },
    onboardingComplete: { count: 35, change: 4 },
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <View className="flex-1">
          <H2>Compliance Dashboard</H2>
          <Caption color="secondary">RTW & Document Overview</Caption>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
          <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {/* RTW Approved */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="shield-checkmark-outline" size={24} color="#16A34A" />
              <Badge variant="success" className="text-[10px]">
                +{stats.rtwApproved.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.rtwApproved.count}</H3>
            <Caption color="secondary">RTW Approved</Caption>
          </Card>

          {/* RTW Pending */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
              <Badge variant="warning" className="text-[10px]">
                {stats.rtwPending.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.rtwPending.count}</H3>
            <Caption color="secondary">RTW Pending</Caption>
          </Card>

          {/* Documents Verified */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
              <Badge variant="success" className="text-[10px]">
                +{stats.documentsVerified.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.documentsVerified.count}</H3>
            <Caption color="secondary">Documents Verified</Caption>
          </Card>

          {/* Onboarding Complete */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="checkmark-circle-outline" size={24} color="#8B5CF6" />
              <Badge variant="success" className="text-[10px]">
                +{stats.onboardingComplete.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.onboardingComplete.count}</H3>
            <Caption color="secondary">Onboarding Complete</Caption>
          </Card>
        </View>

        {/* Quick Actions */}
        <H3 className="mb-3">Quick Actions</H3>
        <View className="gap-3 mb-6">
          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Review RTW Status</Body>
              <Caption color="secondary">Check worker RTW compliance</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#3B82F6' }}>
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Verify Documents</Body>
              <Caption color="secondary">Review pending documents</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#16A34A' }}>
              <Ionicons name="person-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Onboarding Status</Body>
              <Caption color="secondary">Track worker onboarding progress</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#8B5CF6' }}>
              <Ionicons name="file-tray-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Compliance Reports</Body>
              <Caption color="secondary">Generate compliance reports</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Pending RTW Reviews */}
        <H3 className="mb-3">Pending RTW Reviews</H3>
        <View className="gap-3 mb-6">
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Body className="font-outfit-semibold">John Smith</Body>
              <Badge variant="warning">Pending</Badge>
            </View>
            <Caption color="secondary">Submitted 2 days ago</Caption>
          </Card>
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Body className="font-outfit-semibold">Sarah Johnson</Body>
              <Badge variant="warning">Pending</Badge>
            </View>
            <Caption color="secondary">Submitted 3 days ago</Caption>
          </Card>
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Body className="font-outfit-semibold">Mike Williams</Body>
              <Badge variant="warning">Pending</Badge>
            </View>
            <Caption color="secondary">Submitted 5 days ago</Caption>
          </Card>
        </View>

        {/* Compliance Alerts */}
        <H3 className="mb-3">Compliance Alerts</H3>
        <Card className="p-4 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-2 h-2 rounded-full mr-3 bg-red-500" />
            <Body className="flex-1">3 workers RTW expiring soon</Body>
            <Caption color="secondary">Action needed</Caption>
          </View>
          <View className="flex-row items-center mb-4">
            <View className="w-2 h-2 rounded-full mr-3 bg-yellow-500" />
            <Body className="flex-1">5 documents pending verification</Body>
            <Caption color="secondary">Review needed</Caption>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full mr-3 bg-blue-500" />
            <Body className="flex-1">2 workers incomplete onboarding</Body>
            <Caption color="secondary">Follow up</Caption>
          </View>
        </Card>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default ComplianceDashboardScreen;
