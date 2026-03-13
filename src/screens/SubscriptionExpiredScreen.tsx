import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H2, Body, Caption } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export function SubscriptionExpiredScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <View
      className="flex-1 bg-light-background-primary dark:bg-dark-background-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* Icon */}
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
        </View>

        {/* Title */}
        <H2 className="text-center mb-2">Subscription Expired</H2>

        {/* Description */}
        <Body color="secondary" className="text-center mb-2 leading-6">
          Your organisation's subscription or free trial has ended.
          Please contact your administrator to renew the subscription
          so you can continue using StaffSync.
        </Body>

        <Caption color="muted" className="text-center mb-8">
          Your data is safe and will be available once the subscription is renewed.
        </Caption>

        {/* Divider */}
        <View className="w-16 h-0.5 bg-light-border-light mb-8" />

        {/* Info card */}
        <View
          className="w-full rounded-xl p-4 mb-8"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#92400E" />
            <Body className="font-outfit-semibold ml-2" style={{ color: '#92400E' }}>
              What to do?
            </Body>
          </View>
          <Caption style={{ color: '#B45309', lineHeight: 20 }}>
            Ask your manager or agency admin to upgrade the subscription
            from the StaffSync web dashboard under Settings → Billing & Plans.
          </Caption>
        </View>

        {/* Logout button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center py-3.5 px-8 rounded-xl"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <Ionicons name="log-out-outline" size={20} color="#374151" />
          <Body className="font-outfit-semibold ml-2" style={{ color: '#374151' }}>
            Log Out
          </Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default SubscriptionExpiredScreen;
