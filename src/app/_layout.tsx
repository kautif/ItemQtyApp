import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '../../redux/store.js';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AnimatedSplashOverlay/>
        <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name='scan' options={{ headerShown: false }} />
          <Stack.Screen name='scan_item' options={{ headerShown: false }} />
          <Stack.Screen name='storage' options={{ headerShown: false }} />
          <Stack.Screen name='menu' options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
}
