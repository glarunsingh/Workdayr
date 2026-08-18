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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const { isMobile } = useResponsive();
  const { colors, common } = useAppTheme();

  const handleResetPassword = async () => {
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        console.error('Reset password error:', error);
        setErrorMessage(error.message || 'Failed to send reset email');
      } else {
        setSuccess(true);
      }
    } catch (e: any) {
      console.error('Unexpected reset error:', e);
      setErrorMessage(e?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const successContent = (
    <View style={[styles.formWrapper, !isMobile && styles.formWrapperDesktop]}>
      <View style={styles.formInner}>
        <View style={styles.successIcon}>
          <FontAwesome name="check-circle" size={56} color={colors.text} />
        </View>
        <Text style={[styles.heading, { color: colors.text }]}>Check your email</Text>
        <Text style={[styles.subheading, { color: colors.textSubtle }]}>
          We've sent a password reset link to:
        </Text>
        <Text style={[styles.emailHighlight, { color: colors.text }]}>{email}</Text>
        <Text style={[styles.instructionText, { color: colors.textSubtle }]}>
          Click the link in the email to reset your password. If you don't see it, check your spam folder.
        </Text>

        <TouchableOpacity
          style={common.buttonPrimary}
          onPress={() => router.replace('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={common.buttonPrimaryText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const formContent = (
    <View style={[styles.formWrapper, !isMobile && styles.formWrapperDesktop]}>
      <View style={styles.formInner}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={16} color={colors.textMuted} />
          <Text style={[styles.backText, { color: colors.textMuted }]}>Back</Text>
        </TouchableOpacity>

        <Text style={[styles.heading, { color: colors.text }]}>Reset password</Text>
        <Text style={[styles.subheading, { color: colors.textSubtle }]}>
          Enter your email address and we'll send you a link to reset your password.
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
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[common.buttonPrimary, styles.buttonMarginTop, loading && common.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={common.buttonPrimaryText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSubtle }]}>
            Remember your password?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { color: colors.text }]}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );

  return (
    <AuthLayout>
      {success ? successContent : formContent}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
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
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emailHighlight: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  buttonMarginTop: {
    marginTop: 4,
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
