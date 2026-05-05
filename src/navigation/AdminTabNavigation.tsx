import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme, useTheme } from '../contexts';
import { lightTheme, darkTheme } from '../constants/colors';
import { AdminDashboardScreen } from '../screens/admin/dashboards/AdminDashboardScreen';
import { OpsDashboardScreen } from '../screens/admin/dashboards/OpsDashboardScreen';
import { ShiftCoordinatorDashboardScreen } from '../screens/admin/dashboards/ShiftCoordinatorDashboardScreen';
import { ComplianceDashboardScreen } from '../screens/admin/dashboards/ComplianceDashboardScreen';
import { WorkersScreen } from '../screens/admin/worker/WorkersScreen';
import { ShiftsScreen } from '../screens/admin/shift/ShiftsScreen';
import { HRScreen } from '../screens/admin/hrscreen/HRScreen';
import { MoreScreen } from '../screens/admin/MoreScreen';
import { MyTeamScreen } from '../screens/admin/MyTeamScreen';
import { ScheduleScreen } from '../screens/admin/schedule/ScheduleScreen';
import { RTWScreen } from '../screens/admin/RTW/RTWScreen';
import { ReportsScreen } from '../screens/admin/reports/ReportsScreen';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  component: React.ComponentType<any>;
  iconOutline: IoniconsName;
  iconFilled: IoniconsName;
  label: string;
}

interface RoleTabsConfig {
  [key: string]: TabConfig[];
}

const ROLE_TABS: RoleTabsConfig = {
  ADMIN: [
    { name: 'Dashboard', component: AdminDashboardScreen, iconOutline: 'grid-outline', iconFilled: 'grid', label: 'Dashboard' },
    { name: 'Workers', component: WorkersScreen, iconOutline: 'people-outline', iconFilled: 'people', label: 'Workers' },
    { name: 'Shifts', component: ShiftsScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar', label: 'Shifts' },
    { name: 'Schedule', component: ScheduleScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar', label: 'Schedule' },
    { name: 'More', component: MoreScreen, iconOutline: 'ellipsis-horizontal-outline', iconFilled: 'ellipsis-horizontal', label: 'More' },
  ],
  OPS_MANAGER: [
    { name: 'Dashboard', component: OpsDashboardScreen, iconOutline: 'grid-outline', iconFilled: 'grid', label: 'Dashboard' },
    { name: 'Workers', component: WorkersScreen, iconOutline: 'people-outline', iconFilled: 'people', label: 'Workers' },
    { name: 'Shifts', component: ShiftsScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar', label: 'Shifts' },
    { name: 'Schedule', component: ScheduleScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar', label: 'Schedule' },
  ],
  SHIFT_COORDINATOR: [
    { name: 'Dashboard', component: ShiftCoordinatorDashboardScreen, iconOutline: 'grid-outline', iconFilled: 'grid', label: 'Dashboard' },
    { name: 'MyTeam', component: MyTeamScreen, iconOutline: 'people-outline', iconFilled: 'people', label: 'My Team' },
    { name: 'Shifts', component: ShiftsScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar', label: 'Shifts' },
    { name: 'Schedule', component: ScheduleScreen, iconOutline: 'calendar-outline', iconFilled: 'calendar', label: 'Schedule' },
  ],
  COMPLIANCE_OFFICER: [
    { name: 'Dashboard', component: ComplianceDashboardScreen, iconOutline: 'grid-outline', iconFilled: 'grid', label: 'Dashboard' },
    { name: 'Workers', component: WorkersScreen, iconOutline: 'people-outline', iconFilled: 'people', label: 'Workers' },
    { name: 'RTW', component: RTWScreen, iconOutline: 'shield-checkmark-outline', iconFilled: 'shield-checkmark', label: 'RTW' },
    { name: 'Reports', component: ReportsScreen, iconOutline: 'document-text-outline', iconFilled: 'document-text', label: 'Reports' },
  ],
};

// Additional screens that can be navigated to but not in bottom tabs
const ADDITIONAL_SCREENS = {
  HR: HRScreen,
};

const Tab = createBottomTabNavigator();

interface AdminTabNavigatorProps {
  userRole?: string;
  tabs?: TabConfig[];
}

export function AdminTabNavigator({ userRole = 'ADMIN', tabs }: AdminTabNavigatorProps) {
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const navigationTabs = tabs || ROLE_TABS[userRole] || ROLE_TABS.ADMIN;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.background.primary,
            borderTopColor: theme.border.light,
          },
        ],
      }}
    >
      {navigationTabs.map((tab: TabConfig) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={focused ? tab.iconFilled : tab.iconOutline}
                    size={18}
                    color={focused ? primaryColor : theme.text.muted}
                  />
                </View>
                <Text style={[styles.tabLabel, { color: focused ? primaryColor : theme.text.muted }, focused && { fontWeight: '700' }]}>{tab.label}</Text>
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
    borderTopWidth: 1,
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
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },
});

export default AdminTabNavigator;


