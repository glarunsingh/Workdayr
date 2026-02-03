import { Platform, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

// Breakpoints following common responsive design patterns
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Get the current screen size category
 */
export function getScreenSize(width: number): ScreenSize {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

/**
 * Hook to track responsive breakpoints
 */
export function useResponsive() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [screenSize, setScreenSize] = useState<ScreenSize>(() =>
    getScreenSize(Dimensions.get('window').width)
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setScreenSize(getScreenSize(window.width));
    });

    return () => subscription.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop' || screenSize === 'wide',
    isWeb: Platform.OS === 'web',
  };
}

/**
 * Get responsive value based on screen size
 */
export function responsive<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  const width = Dimensions.get('window').width;
  const size = getScreenSize(width);

  if (size === 'desktop' || size === 'wide') {
    return desktop ?? tablet ?? mobile;
  }
  if (size === 'tablet') {
    return tablet ?? mobile;
  }
  return mobile;
}

/**
 * Get max content width for centered layouts on web
 */
export function getMaxContentWidth(screenSize: ScreenSize): number | undefined {
  switch (screenSize) {
    case 'wide':
      return 1200;
    case 'desktop':
      return 960;
    case 'tablet':
      return 720;
    default:
      return undefined; // Full width on mobile
  }
}

/**
 * Get sidebar width for desktop layouts
 */
export function getSidebarWidth(screenSize: ScreenSize): number {
  switch (screenSize) {
    case 'wide':
      return 320;
    case 'desktop':
      return 280;
    default:
      return 0; // No sidebar on mobile/tablet
  }
}
