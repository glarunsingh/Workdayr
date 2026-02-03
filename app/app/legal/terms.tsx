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

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
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

          <Section title="1. Acceptance of Terms">
            By accessing or using Workdayr ("the App"), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do
            not use the App.
          </Section>

          <Section title="2. Description of Service">
            Workdayr is a calendar-first task management application that allows
            users to create, organize, and manage tasks. The App offers both
            personal and business modes for individual and team task management.
          </Section>

          <Section title="3. User Accounts">
            To use certain features of the App, you must create an account. You
            are responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account.
            You agree to notify us immediately of any unauthorized use of your
            account.
          </Section>

          <Section title="4. Acceptable Use">
            You agree not to:{'\n'}
            • Use the App for any illegal purpose{'\n'}
            • Attempt to gain unauthorized access to the App or its systems{'\n'}
            • Interfere with or disrupt the App's operation{'\n'}
            • Upload malicious code or content{'\n'}
            • Violate any applicable laws or regulations
          </Section>

          <Section title="5. User Content">
            You retain ownership of any content you create in the App (tasks,
            notes, etc.). By using the App, you grant us a license to store and
            process your content solely for the purpose of providing the service.
          </Section>

          <Section title="6. Business Mode & Teams">
            If you create a company or team in Business Mode, you are responsible
            for managing team members and their access. Team administrators can
            view and manage tasks assigned to team members.
          </Section>

          <Section title="7. Intellectual Property">
            The App, including its design, code, and branding, is owned by
            Workdayr and protected by intellectual property laws. You may not
            copy, modify, or distribute any part of the App without permission.
          </Section>

          <Section title="8. Disclaimer of Warranties">
            The App is provided "as is" without warranties of any kind. We do not
            guarantee that the App will be error-free or uninterrupted.
          </Section>

          <Section title="9. Limitation of Liability">
            To the maximum extent permitted by law, Workdayr shall not be liable
            for any indirect, incidental, special, or consequential damages
            arising from your use of the App.
          </Section>

          <Section title="10. Changes to Terms">
            We may update these Terms of Service from time to time. Continued use
            of the App after changes constitutes acceptance of the new terms.
          </Section>

          <Section title="11. Contact">
            If you have questions about these Terms, please contact us at
            support@workdayr.app
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
  footer: {
    height: 40,
  },
});
