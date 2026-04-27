import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { brandColors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const blueFillHeight = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate blue color from bottom to top
    Animated.timing(blueFillHeight, {
      toValue: height,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      // After blue fills the screen, show logo with animation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Wait a moment then complete
        setTimeout(() => {
          onAnimationComplete?.();
        }, 1000);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Navy background (initial) */}
      <View style={[StyleSheet.absoluteFill, styles.navyBackground]} />
      
      {/* Blue fill animating from bottom to top */}
      <Animated.View
        style={[
          styles.blueFill,
          {
            height: blueFillHeight,
          },
        ]}
      />

      {/* Logo centered - appears after blue animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.primary.navy,
  },
  navyBackground: {
    backgroundColor: brandColors.primary.navy,
  },
  blueFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: brandColors.primary.blue,
  },
  logoContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    tintColor: '#FFFFFF',
  },
});

export default SplashScreen;
