import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useResponsive, getMaxContentWidth } from '@/lib/responsive';
import { useAppTheme } from '@/lib/theme';

interface ResponsiveContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  centered?: boolean;
  maxWidth?: number;
}

/**
 * A container that centers content and applies max-width on larger screens
 */
export function ResponsiveContainer({
  children,
  style,
  centered = true,
  maxWidth,
}: ResponsiveContainerProps) {
  const { screenSize, isWeb } = useResponsive();

  // On native, just render children directly
  if (!isWeb) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  // On web, apply centered layout for larger screens
  const computedMaxWidth = maxWidth ?? getMaxContentWidth(screenSize);

  const innerStyle: ViewStyle[] = [styles.innerContainer];
  if (centered && computedMaxWidth) {
    innerStyle.push({
      maxWidth: computedMaxWidth,
      width: '100%',
      alignSelf: 'center',
    });
  }

  return (
    <View style={[styles.container, style]}>
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  );
}

/**
 * A wrapper for pages that need responsive padding
 */
interface ResponsivePageProps {
  children: ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export function ResponsivePage({
  children,
  style,
  backgroundColor,
}: ResponsivePageProps) {
  const { screenSize, isWeb } = useResponsive();
  const { colors } = useAppTheme();

  const containerStyle: ViewStyle[] = [
    styles.page,
    { backgroundColor: backgroundColor ?? colors.background },
  ];
  
  if (style) {
    containerStyle.push(style);
  }

  // Add horizontal padding on larger screens
  if (isWeb && (screenSize === 'desktop' || screenSize === 'wide')) {
    containerStyle.push(styles.pageDesktopPadding);
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

/**
 * Responsive grid container for cards/items
 */
interface ResponsiveGridProps {
  children: ReactNode;
  minItemWidth?: number;
  gap?: number;
}

export function ResponsiveGrid({
  children,
  minItemWidth = 300,
  gap = 16,
}: ResponsiveGridProps) {
  const { isWeb, width } = useResponsive();

  if (!isWeb) {
    // On native, render as a simple column
    return (
      <View style={[styles.grid, { gap }]}>
        {children}
      </View>
    );
  }

  // On web, calculate columns based on available width
  const columns = Math.max(1, Math.floor((width - 32) / minItemWidth));

  // Use flexWrap for web grid behavior
  return (
    <View
      style={[
        styles.webGrid,
        {
          gap,
          flexDirection: 'row',
          flexWrap: 'wrap',
        },
      ]}
    >
      {React.Children.map(children, (child) => (
        <View style={{ width: `${100 / columns}%` as any, minWidth: minItemWidth }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageDesktopPadding: {
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'column',
  },
  webGrid: {
    flex: 1,
  },
});
