import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome name="chevron-left" size={16} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <Section title="1. Introduction">
            This Privacy Policy describes how Workdayr ("we", "our", or "the App")
            collects, uses, and protects your personal information when you use
            our task management application.
          </Section>

          <Section title="2. Information We Collect">
            <Text style={styles.bold}>Account Information:</Text> Email address
            and password when you create an account.{'\n\n'}
            <Text style={styles.bold}>Task Data:</Text> Tasks you create,
            including titles, descriptions, due dates, and status.{'\n\n'}
            <Text style={styles.bold}>Company & Team Data:</Text> If using
            Business Mode, company names and team member information.{'\n\n'}
            <Text style={styles.bold}>Usage Data:</Text> App usage patterns,
            device information, and crash reports.
          </Section>

          <Section title="3. How We Use Your Information">
            We use your information to:{'\n'}
            • Provide and maintain the App{'\n'}
            • Sync your tasks across devices{'\n'}
            • Enable team collaboration features{'\n'}
            • Improve the App and fix issues{'\n'}
            • Send important service notifications
          </Section>

          <Section title="4. Data Storage & Security">
            Your data is stored securely using Supabase, which provides
            enterprise-grade security including encryption at rest and in
            transit. We implement Row Level Security to ensure you can only
            access your own data.
          </Section>

          <Section title="5. Data Sharing">
            We do not sell your personal information. We may share data:{'\n'}
            • With team members in your company (if using Business Mode){'\n'}
            • With service providers who help operate the App{'\n'}
            • When required by law or to protect rights
          </Section>

          <Section title="6. Your Rights">
            You have the right to:{'\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate data{'\n'}
            • Delete your account and data{'\n'}
            • Export your data{'\n'}
            • Opt out of analytics (in Settings)
          </Section>

          <Section title="7. Data Retention">
            We retain your data as long as your account is active. When you
            delete your account, we will delete your personal data within 30
            days, except where retention is required by law.
          </Section>

          <Section title="8. Cookies & Tracking">
            The web version of the App may use cookies for authentication and
            preferences. We use analytics to understand App usage, which you
            can disable in Settings.
          </Section>

          <Section title="9. Children's Privacy">
            The App is not intended for users under 13 years of age. We do not
            knowingly collect information from children under 13.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy periodically. We will notify you
            of significant changes via the App or email.
          </Section>

          <Section title="11. Contact Us">
            For privacy-related questions or to exercise your rights, contact
            us at privacy@workdayr.app
          </Section>

          <View style={styles.footer} />
        </View>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    height: 40,
  },
});
