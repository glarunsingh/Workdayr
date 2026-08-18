import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useResponsive } from '../lib/responsive';
import { palette } from '../lib/theme';

const logoIcon = require('../assets/images/logo-icon.png');
const logoWordmark = require('../assets/images/logo-wordmark.png');

const TAGLINES = [
  'One app for personal and business tasks',
  'Calendar-first. Never miss a deadline.',
  'Built for teams of every size',
  'Across web, iOS, Android & desktop',
];

const CYCLE_DURATION = 4000; // 4 seconds per tagline
const FADE_DURATION = 800;   // 0.8s fade transition

interface BrandingPanelProps {
  compact?: boolean;
}

export default function BrandingPanel({ compact }: BrandingPanelProps) {
  const { isMobile } = useResponsive();
  const isCompact = compact ?? isMobile;

  const [currentIndex, setCurrentIndex] = useState(0);
  const opacity = useSharedValue(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advanceTagline = () => {
    setCurrentIndex((prev) => (prev + 1) % TAGLINES.length);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Fade out
      opacity.value = withTiming(0, {
        duration: FADE_DURATION,
        easing: Easing.out(Easing.ease),
      }, (finished) => {
        if (finished) {
          runOnJS(advanceTagline)();
          // Fade in
          opacity.value = withTiming(1, {
            duration: FADE_DURATION,
            easing: Easing.in(Easing.ease),
          });
        }
      });
    }, CYCLE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactInner}>
          <Image source={logoWordmark} style={styles.compactWordmarkImage} resizeMode="contain" />
          <Animated.Text style={[styles.compactTagline, taglineAnimStyle]}>
            {TAGLINES[currentIndex]}
          </Animated.Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Image source={logoWordmark} style={styles.wordmarkImage} resizeMode="contain" />
        <Animated.Text style={styles.subtitle}>Your workday, organized.</Animated.Text>

        <View style={styles.taglineContainer}>
          <Animated.Text style={[styles.tagline, taglineAnimStyle]}>
            {TAGLINES[currentIndex]}
          </Animated.Text>
        </View>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {TAGLINES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Desktop / Tablet ──────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: palette.gray800,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 64,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' as any } : {}),
  },
  inner: {
    maxWidth: 480,
    width: '100%',
    alignItems: 'flex-start',
  },
  wordmarkImage: {
    width: 280,
    height: 64,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: palette.gray500,
    fontWeight: '400',
    marginBottom: 48,
    letterSpacing: 0.3,
  },
  taglineContainer: {
    minHeight: 64,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 22,
    color: palette.gray300,
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.gray700,
  },
  dotActive: {
    backgroundColor: palette.gray50,
    width: 20,
    borderRadius: 3,
  },

  // ── Mobile (compact header) ───────────────────────────────
  compactContainer: {
    backgroundColor: palette.gray800,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  compactInner: {
    alignItems: 'center',
  },
  compactWordmarkImage: {
    width: 200,
    height: 48,
  },
  compactTagline: {
    fontSize: 15,
    color: palette.gray400,
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
