import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge } from '../../../components/ui';

export function OpsDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  // Mock data - replace with API later
  const stats = {
    shiftCoordinators: { count: 5, change: 2 },
    activeWorkers: { count: 48, change: 8 },
    shiftsToday: { count: 12, change: -1 },
    complianceRate: { score: 92, change: 4 },
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <View className="flex-1">
          <H2>Ops Dashboard</H2>
          <Caption color="secondary">Operations Overview</Caption>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
          <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {/* Shift Coordinators */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="people-outline" size={24} color={primaryColor} />
              <Badge variant="success" className="text-[10px]">
                +{stats.shiftCoordinators.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.shiftCoordinators.count}</H3>
            <Caption color="secondary">Shift Coordinators</Caption>
          </Card>

          {/* Active Workers */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="person-outline" size={24} color="#16A34A" />
              <Badge variant="success" className="text-[10px]">
                +{stats.activeWorkers.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.activeWorkers.count}</H3>
            <Caption color="secondary">Active Workers</Caption>
          </Card>

          {/* Shifts Today */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
              <Badge variant="warning" className="text-[10px]">
                {stats.shiftsToday.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.shiftsToday.count}</H3>
            <Caption color="secondary">Shifts Today</Caption>
          </Card>

          {/* Compliance Rate */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="shield-checkmark-outline" size={24} color="#8B5CF6" />
              <Badge variant="success" className="text-[10px]">
                +{stats.complianceRate.change}%
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.complianceRate.score}%</H3>
            <Caption color="secondary">Compliance Rate</Caption>
          </Card>
        </View>

        {/* Quick Actions */}
        <H3 className="mb-3">Quick Actions</H3>
        <View className="gap-3 mb-6">
          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
              <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Assign Shift Coordinator</Body>
              <Caption color="secondary">Manage shift coordinators</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#16A34A' }}>
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">View Team Performance</Body>
              <Caption color="secondary">Monitor coordinator performance</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#3B82F6' }}>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Shift Schedule</Body>
              <Caption color="secondary">View and manage shifts</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#8B5CF6' }}>
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Compliance Reports</Body>
              <Caption color="secondary">View RTW compliance status</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <H3 className="mb-3">Recent Activity</H3>
        <Card className="p-4 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: primaryColor }} />
            <Body className="flex-1">New shift coordinator assigned</Body>
            <Caption color="secondary">1h ago</Caption>
          </View>
          <View className="flex-row items-center mb-4">
            <View className="w-2 h-2 rounded-full mr-3 bg-gray-400" />
            <Body className="flex-1">Worker compliance updated</Body>
            <Caption color="secondary">3h ago</Caption>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full mr-3 bg-gray-400" />
            <Body className="flex-1">Shift schedule approved</Body>
            <Caption color="secondary">5h ago</Caption>
          </View>
        </Card>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default OpsDashboardScreen;
