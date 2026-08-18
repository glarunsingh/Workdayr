import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { useResponsive } from '../../lib/responsive';
import { useAppTheme } from '../../lib/theme';
import AuthLayout from '../../components/AuthLayout';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { isMobile } = useResponsive();
  const { colors, common } = useAppTheme();

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error:', error);
        setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      console.error('Unexpected login error:', e);
      setErrorMessage(e?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={[styles.formWrapper, !isMobile && styles.formWrapperDesktop]}>
        <View style={styles.formInner}>
          <Text style={[styles.heading, { color: colors.text }]}>Sign in</Text>
          <Text style={[styles.subheading, { color: colors.textSubtle }]}>
            Enter your credentials to continue
          </Text>

          {errorMessage && (
            <View style={common.errorContainer}>
              <Text style={[common.errorText, styles.errorTextCenter]}>
                {errorMessage}
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={common.inputLabel}>Email</Text>
              <TextInput
                style={common.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textDisabled}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={common.inputLabel}>Password</Text>
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text style={[styles.forgotPasswordText, { color: colors.textMuted }]}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textDisabled}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontAwesome
                    name={showPassword ? 'eye' : 'eye-slash'}
                    size={18}
                    color={colors.textSubtle}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[common.buttonPrimary, styles.buttonMarginTop, loading && common.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={common.buttonPrimaryText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSubtle }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: colors.text }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formWrapperDesktop: {
    paddingHorizontal: 56,
  },
  formInner: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 15,
    marginBottom: 32,
    letterSpacing: 0.1,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonMarginTop: {
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '400',
  },
  errorTextCenter: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
