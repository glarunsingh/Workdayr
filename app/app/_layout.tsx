import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '../lib/auth';
import { SettingsProvider } from '../lib/settings';
import { CompanyProvider } from '../lib/company';
import { OfflineBanner } from '@/components/OfflineBanner';
import { hasCompletedOnboarding } from './onboarding';
import { analytics } from '@/lib/analytics';
import { errorMonitor, logAppInfo } from '@/lib/errorMonitoring';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize monitoring services
async function initializeServices() {
  await Promise.all([
    analytics.initialize(),
    errorMonitor.initialize(),
  ]);
  logAppInfo();
}

initializeServices();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

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
      <SettingsProvider>
        <CompanyProvider>
          <RootLayoutNav />
        </CompanyProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // Check if the navigation is ready
  const navigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check onboarding status when user signs in
  useEffect(() => {
    if (user && !loading) {
      hasCompletedOnboarding().then((completed) => {
        setNeedsOnboarding(!completed);
        setCheckingOnboarding(false);
      });
    } else if (!loading) {
      setCheckingOnboarding(false);
    }
  }, [user, loading]);

  useEffect(() => {
    // Don't navigate until navigation is ready and auth is loaded
    if (!navigationState?.key || loading || checkingOnboarding) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inLegal = segments[0] === 'legal';

    // Skip redirect for legal pages
    if (inLegal) return;

    if (!user && !inAuthGroup) {
      // Redirect to login if not signed in
      router.replace('/(auth)/login');
      setHasNavigated(true);
    } else if (user && inAuthGroup) {
      // Check if needs onboarding
      if (needsOnboarding) {
        router.replace('/onboarding');
      } else {
        // Redirect to home if signed in and on auth page
        router.replace('/(tabs)');
      }
      setHasNavigated(true);
    }
  }, [user, segments, loading, navigationState?.key, checkingOnboarding, needsOnboarding]);

  // Show loading indicator while checking auth
  if (loading || checkingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OfflineBanner />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
        <Stack.Screen name="day/[date]" options={{ headerShown: true, title: 'Day View' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
