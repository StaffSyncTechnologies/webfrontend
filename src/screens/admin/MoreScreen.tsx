import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme } from '../../contexts';
import { H2, Body, Caption } from '../../components/ui';
import { logout } from '../../store/slices/authSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const dispatch = useDispatch();

  const menuItems = [
    { id: '1', title: 'Settings', icon: 'settings-outline', description: 'App settings and preferences', screen: 'Settings' as const, action: null },
    { id: '2', title: 'Reports', icon: 'document-text-outline', description: 'View and generate reports', screen: 'Reports' as const, action: null },
    { id: '3', title: 'Compliance', icon: 'shield-checkmark-outline', description: 'Right to Work and compliance checks', screen: 'RTW' as const, action: null },
    { id: '4', title: 'Chat', icon: 'chatbubbles-outline', description: 'Messages and conversations', screen: 'AdminChatList' as const, action: null },
    { id: '5', title: 'Timesheets', icon: 'time-outline', description: 'View timesheet records', screen: 'AdminTimesheet' as const, action: null },
    { id: '6', title: 'Holiday', icon: 'calendar-outline', description: 'Holiday management', screen: 'AdminHoliday' as const, action: null },
    { id: '7', title: 'Invite Requests', icon: 'person-add-outline', description: 'Manage invite requests', screen: 'InviteRequests' as const, action: null },
    { id: '8', title: 'Help', icon: 'help-circle-outline', description: 'Get help and support', screen: null as any, action: null },
    { id: '9', title: 'Logout', icon: 'log-out-outline', description: 'Sign out of your account', screen: null as any, action: 'logout' },
  ];

  const handleMenuPress = (screen: string | null, action: string | null) => {
    if (action === 'logout') {
      Alert.alert('Logout', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
      ]);
      return;
    }
    if (screen) {
      navigation.navigate(screen as any);
    }
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4">
        <H2>More</H2>
        <Caption color="secondary">Additional options and settings</Caption>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-3 mb-6">
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              className="flex-row items-center p-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl"
              onPress={() => handleMenuPress(item.screen, item.action)}
              disabled={!item.screen && !item.action}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: item.action === 'logout' ? '#EF4444' : !item.screen && !item.action ? '#9CA3AF' : primaryColor }}>
                <Ionicons 
                  name={item.icon as keyof typeof Ionicons.glyphMap} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </View>
              <View className="flex-1">
                <Body className="font-outfit-semibold" style={{ opacity: !item.screen && !item.action ? 0.5 : 1 }}>{item.title}</Body>
                <Caption color="secondary" style={{ opacity: !item.screen && !item.action ? 0.5 : 1 }}>{item.description}</Caption>
              </View>
              {item.screen || item.action ? (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              ) : (
                <Caption color="secondary" className="text-xs">Coming Soon</Caption>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default MoreScreen;
