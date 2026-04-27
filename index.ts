import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import App from './App';
import { registerNotifeeBackgroundHandler, displayShiftNotification, displayGeneralNotification } from './src/services/notifeeService';

// Must be registered at root level, outside the React tree
registerNotifeeBackgroundHandler();

// Firebase background handler — fires when app is killed or in background
// Backend sends data-only FCM messages for shift notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  const data = remoteMessage.data as Record<string, string> | undefined;
  if (!data) return;

  const type = (data.type ?? '').toLowerCase();
  const isShift = type.includes('shift');

  if (isShift && data.shiftId) {
    await displayShiftNotification({
      shiftId: data.shiftId,
      title: data.title,
      body: data.body,
      date: data.date,
      location: data.location,
      hours: data.hours,
      pay: data.pay,
    });
  } else if (data.title) {
    await displayGeneralNotification({
      title: data.title,
      body: data.body ?? '',
    });
  }
});

LogBox.ignoreLogs([
  '`new NativeEventEmitter()`',
  'NativeJSLogger',
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
