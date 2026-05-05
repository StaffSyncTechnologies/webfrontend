import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme, useTheme } from '../../../contexts';
import { lightTheme, darkTheme } from '../../../constants/colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  component: React.ComponentType<any>;
  iconOutline: IoniconsName;
  iconFilled: IoniconsName;
  label: string;
}

const Tab = createBottomTabNavigator();

interface AdminTabNavigatorProps {
  tabs: TabConfig[];
}

export function AdminTabNavigator({ tabs }: AdminTabNavigatorProps) {
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

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
      {tabs.map((tab) => (
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
                    size={22}
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

