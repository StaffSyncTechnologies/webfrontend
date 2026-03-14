import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen, ShiftsScreen, ScheduleScreen, PayslipScreen, ProfileScreen } from '../screens/main';
import { useOrgTheme } from '../contexts';
import { colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: keyof MainTabParamList;
  component: React.ComponentType<any>;
  iconOutline: IoniconsName;
  iconFilled: IoniconsName;
  label?: string;
}

const tabConfigs: Omit<TabConfig, 'label'>[] = [
  { name: 'Home', component: HomeScreen, iconOutline: 'home-outline', iconFilled: 'home' },
  { name: 'Shifts', component: ShiftsScreen, iconOutline: 'briefcase-outline', iconFilled: 'briefcase' },
  { name: 'Schedule', component: ScheduleScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar' },
  { name: 'Payslip', component: PayslipScreen, iconOutline: 'receipt-outline', iconFilled: 'receipt' },
  { name: 'Profile', component: ProfileScreen, iconOutline: 'person-outline', iconFilled: 'person' },
];

const TAB_KEYS: Record<string, string> = {
  Home: 'tabs.home',
  Shifts: 'tabs.shifts',
  Schedule: 'tabs.schedule',
  Payslip: 'tabs.payslip',
  Profile: 'tabs.profile',
};

export function MainTabNavigator() {
  const { primaryColor } = useOrgTheme();
  const { t } = useTranslation();

  const tabs: TabConfig[] = tabConfigs.map((tab) => ({
    ...tab,
    label: t(TAB_KEYS[tab.name] || tab.name),
  }));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name={focused ? tab.iconFilled : tab.iconOutline}
                  size={22}
                  color={focused ? primaryColor : '#9CA3AF'}
                />
                <Text style={[styles.tabLabel, focused && { color: primaryColor, fontWeight: '700' }]}>
                  {tab.label}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 82,
    paddingTop: 8,
    paddingBottom: 26,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 3,
  },
});

export default MainTabNavigator;
