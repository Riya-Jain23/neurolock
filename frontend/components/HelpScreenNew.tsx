import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Alert } from './ui/alert.native';
import { Separator } from './ui/separator.native';

interface HelpScreenNewProps {
  navigation: any;
}

export function HelpScreenNew({ navigation }: HelpScreenNewProps) {
  const faqs = [
    {
      question: "I'm locked out of my account",
      answer:
        'Contact your administrator or IT support. After 3 failed login attempts, accounts are temporarily locked for security.',
    },
    {
      question: "I'm not receiving OTP codes",
      answer:
        'Check your spam folder for email codes. For SMS, ensure your phone number is up to date in the system.',
    },
    {
      question: "Biometric login isn't working",
      answer:
        "Ensure your device supports biometrics and it's enabled in settings. Clean the sensor and try again.",
    },
    {
      question: 'I lost my backup codes',
      answer:
        'Contact your administrator to generate new backup codes. Never share these codes with anyone.',
    },
    {
      question: 'My device was lost or stolen',
      answer:
        'Immediately contact IT support to disable your account access. Report the incident following hospital policy.',
    },
  ];

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & FAQ</Text>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <Alert
            variant="destructive"
            title="⚠️ Emergency Access"
            description="For urgent patient care situations requiring immediate access:"
          />
          <View style={styles.emergencyButtons}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => handleCall('5551234567')}
              activeOpacity={0.7}
            >
              <Text style={styles.emergencyButtonIcon}>📞</Text>
              <Text style={styles.emergencyButtonText}>Emergency IT: (555) 123-4567</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => handleEmail('emergency@hospital.com')}
              activeOpacity={0.7}
            >
              <Text style={styles.emergencyButtonIcon}>📧</Text>
              <Text style={styles.emergencyButtonText}>emergency@hospital.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqHeaderIcon}>❓</Text>
            <Text style={styles.faqHeaderTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <Card key={index} style={styles.faqCard}>
                <CardHeader>
                  <CardTitle>{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        <Separator style={styles.separator} />

        {/* Support Contact */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need More Help?</Text>

          <View style={styles.supportButtons}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleCall('5559876543')}
              activeOpacity={0.7}
            >
              <Text style={styles.supportButtonIcon}>📞</Text>
              <Text style={styles.supportButtonText}>IT Support: (555) 987-6543</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => handleEmail('support@hospital.com')}
              activeOpacity={0.7}
            >
              <Text style={styles.supportButtonIcon}>📧</Text>
              <Text style={styles.supportButtonText}>support@hospital.com</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.supportAvailability}>Available 24/7 for technical issues</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  emergencySection: {
    padding: 16,
  },
  emergencyButtons: {
    marginTop: 16,
    gap: 12,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  emergencyButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  emergencyButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  faqSection: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  faqHeaderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  faqHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
  },
  separator: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  supportSection: {
    padding: 16,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  supportButtons: {
    gap: 12,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  supportButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  supportButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  supportAvailability: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
