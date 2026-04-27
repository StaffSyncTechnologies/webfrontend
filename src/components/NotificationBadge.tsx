import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOrgTheme } from '../contexts';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left';
}

export function NotificationBadge({ 
  count, 
  size = 'small', 
  position = 'top-right' 
}: NotificationBadgeProps) {
  const { primaryColor } = useOrgTheme();
  
  if (!count || count <= 0) {
    return null;
  }

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, fontSize: 10, borderRadius: 8 };
      case 'medium':
        return { width: 20, height: 20, fontSize: 12, borderRadius: 10 };
      case 'large':
        return { width: 24, height: 24, fontSize: 14, borderRadius: 12 };
      default:
        return { width: 16, height: 16, fontSize: 10, borderRadius: 8 };
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top-right':
        return { top: -6, right: -6 };
      case 'top-left':
        return { top: -6, left: -6 };
      default:
        return { top: -6, right: -6 };
    }
  };

  const badgeSize = getBadgeSize();
  const positionStyle = getPositionStyle();
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View style={[
      styles.badge,
      {
        width: badgeSize.width,
        height: badgeSize.height,
        backgroundColor: primaryColor,
        borderRadius: badgeSize.borderRadius,
        ...positionStyle,
      }
    ]}>
      <Text style={[
        styles.badgeText,
        {
          fontSize: badgeSize.fontSize,
          color: '#FFFFFF',
        }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
});
