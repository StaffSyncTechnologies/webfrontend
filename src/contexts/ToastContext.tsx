import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { brandColors } from '../constants/colors';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  vibrate?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: { duration?: number; vibrate?: boolean }) => void;
  success: (message: string, options?: { duration?: number; vibrate?: boolean }) => void;
  error: (message: string, options?: { duration?: number; vibrate?: boolean }) => void;
  warning: (message: string, options?: { duration?: number; vibrate?: boolean }) => void;
  info: (message: string, options?: { duration?: number; vibrate?: boolean }) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_COLORS = {
  success: { bg: brandColors.status.success, icon: '✓' },
  error: { bg: brandColors.status.error, icon: '✕' },
  warning: { bg: brandColors.status.warning, icon: '!' },
  info: { bg: brandColors.primary.blue, icon: 'i' },
};

const HAPTIC_PATTERNS = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  info: Haptics.ImpactFeedbackStyle.Light,
};

function ToastItem({ toast, onHide }: { toast: Toast; onHide: () => void }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide());
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const colors = TOAST_COLORS[toast.type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: colors.bg, opacity, transform: [{ translateY }] }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{colors.icon}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
      <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const triggerHaptic = useCallback(async (type: ToastType) => {
    try {
      if (type === 'info') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await Haptics.notificationAsync(HAPTIC_PATTERNS[type] as Haptics.NotificationFeedbackType);
      }
    } catch {}
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', options?: { duration?: number; vibrate?: boolean }) => {
    const id = Date.now().toString();
    const vibrate = options?.vibrate ?? true;
    
    if (vibrate) triggerHaptic(type);
    
    setToasts((prev) => [...prev.slice(-2), { id, message, type, duration: options?.duration }]);
  }, [triggerHaptic]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string, opts?: { duration?: number; vibrate?: boolean }) => showToast(msg, 'success', opts), [showToast]);
  const error = useCallback((msg: string, opts?: { duration?: number; vibrate?: boolean }) => showToast(msg, 'error', opts), [showToast]);
  const warning = useCallback((msg: string, opts?: { duration?: number; vibrate?: boolean }) => showToast(msg, 'warning', opts), [showToast]);
  const info = useCallback((msg: string, opts?: { duration?: number; vibrate?: boolean }) => showToast(msg, 'info', opts), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, hideToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onHide={() => hideToast(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, zIndex: 9999 },
  toast: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  iconContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  message: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  closeBtn: { padding: 4, marginLeft: 8 },
  closeText: { color: '#fff', fontSize: 20, fontWeight: '300' },
});
