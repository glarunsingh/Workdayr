import React from 'react';
import { Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        // iOS-specific tab bar styling
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderTopColor: colorScheme === 'dark' ? '#38383a' : '#e0e0e0',
          },
          android: {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
            elevation: 8,
          },
          default: {},
        }),
        // Larger touch targets for iOS
        tabBarItemStyle: Platform.select({
          ios: {
            paddingVertical: 4,
          },
          default: {},
        }),
        // Header styling
        headerStyle: Platform.select({
          ios: {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
          },
          android: {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
            elevation: 4,
          },
          default: {},
        }),
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: 'Business',
          tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Hide this tab for now
        }}
      />
    </Tabs>
  );
}
