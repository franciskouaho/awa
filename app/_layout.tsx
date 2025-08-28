import AuthNavigationHandler from '@/components/AuthNavigationHandler';
import NotificationInitializer from '@/components/NotificationInitializer';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // Police par défaut Expo uniquement
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthNavigationHandler>
        <NotificationInitializer />
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right', // Animation Expo Router
            }}
          >
            <Stack.Screen
              name="intro"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal', // Style Expo
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                gestureEnabled: false, // Désactiver le swipe back sur les tabs
              }}
            />
            <Stack.Screen
              name="test-firebase"
              options={{
                headerShown: true,
                title: 'Test Firebase',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="+not-found"
              options={{
                title: 'Page non trouvée',
                presentation: 'modal', // Modal Expo
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthNavigationHandler>
    </AuthProvider>
  );
}
