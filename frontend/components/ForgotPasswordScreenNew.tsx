import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert } from './ui/alert';

type StepType = 'request' | 'sent' | 'reset';
type ResetMethod = 'email' | 'admin';

export default function ForgotPasswordScreenNew() {
  const navigation = useNavigation();

  const [step, setStep] = useState<StepType>('request');
  const [resetMethod, setResetMethod] = useState<ResetMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = () => {
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your Staff ID or Email');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('sent');
    }, 1500);
  };

  const handlePasswordReset = () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('LoginNew' as never);
    }, 2000);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (step === 'request') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginNew' as never)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
          </View>

          {/* Reset Method Selection */}
          <View style={styles.methodSection}>
            <Text style={styles.methodTitle}>Choose reset method:</Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  resetMethod === 'email' && styles.methodButtonActive,
                ]}
                onPress={() => setResetMethod('email')}
              >
                <Text style={styles.methodIcon}>✉️</Text>
                <Text
                  style={[
                    styles.methodButtonText,
                    resetMethod === 'email' && styles.methodButtonTextActive,
                  ]}
                >
                  Email Reset Link
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  resetMethod === 'admin' && styles.methodButtonActive,
                ]}
                onPress={() => setResetMethod('admin')}
              >
                <Text style={styles.methodIcon}>🛡️</Text>
                <Text
                  style={[
                    styles.methodButtonText,
                    resetMethod === 'admin' && styles.methodButtonTextActive,
                  ]}
                >
                  Admin Assistance
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset Form */}
          {resetMethod === 'email' && (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Email Password Reset</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Staff ID or Email</Text>
                  <Input
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="Enter your Staff ID or email address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                {error && (
                  <Alert variant="destructive">
                    <Text style={styles.errorText}>{error}</Text>
                  </Alert>
                )}

                <Button onPress={handleResetRequest} disabled={isLoading} style={styles.button}>
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                  )}
                </Button>
              </View>
            </Card>
          )}

          {resetMethod === 'admin' && (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Administrator Assistance</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.description}>
                  Contact your IT administrator for immediate password reset assistance.
                </Text>

                <View style={styles.contactButtons}>
                  <TouchableOpacity
                    onPress={() => handleCall('5559876543')}
                    style={styles.contactButton}
                  >
                    <Text style={styles.contactIcon}>📞</Text>
                    <Text style={styles.contactButtonText}>IT Support: (555) 987-6543</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleEmail('support@hospital.com')}
                    style={styles.contactButton}
                  >
                    <Text style={styles.contactIcon}>✉️</Text>
                    <Text style={styles.contactButtonText}>support@hospital.com</Text>
                  </TouchableOpacity>
                </View>

                <Alert>
                  <Text style={styles.alertText}>
                    Have your Staff ID ready when contacting support. Password resets require
                    identity verification.
                  </Text>
                </Alert>
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'sent') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContainer}>
          <View style={styles.centeredContent}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconCircleText}>✉️</Text>
            </View>

            <Text style={styles.sentTitle}>Reset Link Sent</Text>
            <Text style={styles.sentDescription}>
              Check your email for a password reset link. The link will expire in 15 minutes.
            </Text>

            <View style={styles.sentButtonGroup}>
              <Button onPress={() => setStep('reset')} style={styles.button}>
                I have the reset code
              </Button>

              <Button variant="outline" onPress={() => setStep('request')} style={styles.button}>
                Resend Reset Link
              </Button>

              <TouchableOpacity
                onPress={() => navigation.navigate('LoginNew' as never)}
                style={styles.linkButton}
              >
                <Text style={styles.linkButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Reset step
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('sent')} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Password</Text>
        </View>

        <Card style={styles.resetCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Set New Password</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {error && (
              <Alert variant="destructive">
                <Text style={styles.errorText}>{error}</Text>
              </Alert>
            )}

            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>Password requirements:</Text>
              <Text style={styles.requirementItem}>• At least 8 characters</Text>
              <Text style={styles.requirementItem}>• Must contain letters and numbers</Text>
              <Text style={styles.requirementItem}>• Cannot be a recently used password</Text>
            </View>

            <Button onPress={handlePasswordReset} disabled={isLoading} style={styles.button}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </Button>
          </View>
        </Card>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  methodSection: {
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  methodButtons: {
    gap: 8,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  methodButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  methodIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  methodButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  methodButtonTextActive: {
    color: '#ffffff',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardContent: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
  button: {
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactButtons: {
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  alertText: {
    fontSize: 14,
    color: '#374151',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  centeredContent: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircleText: {
    fontSize: 32,
  },
  sentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  sentDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  sentButtonGroup: {
    width: '100%',
    gap: 12,
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  resetCard: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  requirementsBox: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});
