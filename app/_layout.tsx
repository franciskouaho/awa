import AuthNavigationHandler from '@/components/AuthNavigationHandler';
import { AuthProvider } from '@/contexts/AuthContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
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

  // Initialiser les notifications
  useNotificationSetup();

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
      <CategoryProvider>
        <AuthNavigationHandler>
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
                name="+not-found"
                options={{
                  title: 'Page non trouvée',
                  presentation: 'modal', // Modal Expo
                }}
              />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </AuthNavigationHandler>
      </CategoryProvider>
    </AuthProvider>
  );
}
