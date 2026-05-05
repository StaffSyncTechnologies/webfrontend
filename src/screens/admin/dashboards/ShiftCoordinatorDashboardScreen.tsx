import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge } from '../../../components/ui';

export function ShiftCoordinatorDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  // Mock data - replace with API later
  const stats = {
    myWorkers: { count: 15, change: 3 },
    shiftsToday: { count: 8, change: 0 },
    availableWorkers: { count: 12, change: 2 },
    pendingApprovals: { count: 3, change: -1 },
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <View className="flex-1">
          <H2>Shift Coordinator Dashboard</H2>
          <Caption color="secondary">My Team Overview</Caption>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
          <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {/* My Workers */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="people-outline" size={24} color={primaryColor} />
              <Badge variant="success" className="text-[10px]">
                +{stats.myWorkers.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.myWorkers.count}</H3>
            <Caption color="secondary">My Workers</Caption>
          </Card>

          {/* Shifts Today */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
              <Badge variant="info" className="text-[10px]">
                {stats.shiftsToday.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.shiftsToday.count}</H3>
            <Caption color="secondary">Shifts Today</Caption>
          </Card>

          {/* Available Workers */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="person-outline" size={24} color="#16A34A" />
              <Badge variant="success" className="text-[10px]">
                +{stats.availableWorkers.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.availableWorkers.count}</H3>
            <Caption color="secondary">Available Workers</Caption>
          </Card>

          {/* Pending Approvals */}
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="time-outline" size={24} color="#F59E0B" />
              <Badge variant="warning" className="text-[10px]">
                {stats.pendingApprovals.change}
              </Badge>
            </View>
            <H3 className="text-2xl">{stats.pendingApprovals.count}</H3>
            <Caption color="secondary">Pending Approvals</Caption>
          </Card>
        </View>

        {/* Quick Actions */}
        <H3 className="mb-3">Quick Actions</H3>
        <View className="gap-3 mb-6">
          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: primaryColor }}>
              <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">View My Schedule</Body>
              <Caption color="secondary">See today's shifts</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#16A34A' }}>
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">My Workers</Body>
              <Caption color="secondary">View assigned workers</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#3B82F6' }}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Shift Swap Requests</Body>
              <Caption color="secondary">Manage swap requests</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#F59E0B' }}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Body className="font-outfit-semibold">Approve Requests</Body>
              <Caption color="secondary">{stats.pendingApprovals.count} pending</Caption>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Today's Shifts */}
        <H3 className="mb-3">Today's Shifts</H3>
        <View className="gap-3 mb-6">
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Body className="font-outfit-semibold">Morning Shift</Body>
              <Badge variant="success">Active</Badge>
            </View>
            <Caption color="secondary">06:00 - 14:00 • 5 workers</Caption>
          </Card>
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Body className="font-outfit-semibold">Afternoon Shift</Body>
              <Badge variant="info">Upcoming</Badge>
            </View>
            <Caption color="secondary">14:00 - 22:00 • 6 workers</Caption>
          </Card>
          <Card className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Body className="font-outfit-semibold">Night Shift</Body>
              <Badge variant="info">Scheduled</Badge>
            </View>
            <Caption color="secondary">22:00 - 06:00 • 4 workers</Caption>
          </Card>
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default ShiftCoordinatorDashboardScreen;
