import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';

interface ReAuthenticationPromptNewProps {
  route?: {
    params?: {
      patientId?: string;
      staffId?: string;
      reason?: string;
      onAuthSuccess?: () => void;
    };
  };
}

type AuthMethod = 'password' | 'otp' | 'biometric';

export default function ReAuthenticationPromptNew({ route }: ReAuthenticationPromptNewProps) {
  const navigation = useNavigation();
  const patientId = route?.params?.patientId || 'P001';
  const staffId = route?.params?.staffId || 'STAFF001';
  const reason = route?.params?.reason || 'Your session has expired due to inactivity';

  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthSuccess = () => {
    if (route?.params?.onAuthSuccess) {
      route.params.onAuthSuccess();
    } else {
      navigation.goBack();
    }
  };

  const handlePasswordAuth = () => {
    setError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      if (password.length >= 6) {
        handleAuthSuccess();
      } else {
        setError('Invalid password. Please try again.');
        setIsAuthenticating(false);
        setPassword('');
      }
    }, 1500);
  };

  const handleOTPAuth = () => {
    setError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      if (otp === '123456') {
        handleAuthSuccess();
      } else {
        setError('Invalid OTP code. Please try again.');
        setIsAuthenticating(false);
        setOtp('');
      }
    }, 1500);
  };

  const handleBiometricAuth = async () => {
    setError('');
    setIsAuthenticating(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      });

      setIsAuthenticating(false);

      if (result.success) {
        handleAuthSuccess();
      } else {
        setError('Biometric verification failed. Please try again or use another method.');
      }
    } catch (err) {
      setIsAuthenticating(false);
      setError('Biometric verification failed. Please try again or use another method.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={isAuthenticating}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Re-Authentication Required</Text>
        </View>

        {/* Security Notice */}
        <Alert style={styles.alertMargin}>
          <View style={styles.alertContent}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.alertText}>
              <Text style={styles.bold}>Security Check:</Text> {reason}
            </Text>
          </View>
        </Alert>

        {/* Context Info */}
        <Card style={styles.card}>
          <View style={styles.contextContent}>
            <View style={styles.contextInfo}>
              <Text style={styles.contextLabel}>Accessing records for:</Text>
              <Text style={styles.contextValue}>Patient {patientId}</Text>
              <Text style={styles.contextLabel}>Staff: {staffId}</Text>
            </View>
            <Badge variant="outline" style={styles.secureBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
              <Text>Secure Access</Text>
            </Badge>
          </View>
        </Card>

        {/* Authentication Method Selection */}
        <View style={styles.methodSection}>
          <Text style={styles.methodTitle}>Choose verification method:</Text>
          <View style={styles.methodButtons}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'password' && styles.methodButtonActive,
              ]}
              onPress={() => setSelectedMethod('password')}
              disabled={isAuthenticating}
            >
              <Text style={styles.methodIcon}>🔒</Text>
              <Text
                style={[
                  styles.methodButtonText,
                  selectedMethod === 'password' && styles.methodButtonTextActive,
                ]}
              >
                Password Verification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodButton, selectedMethod === 'otp' && styles.methodButtonActive]}
              onPress={() => setSelectedMethod('otp')}
              disabled={isAuthenticating}
            >
              <Text style={styles.methodIcon}>📱</Text>
              <Text
                style={[
                  styles.methodButtonText,
                  selectedMethod === 'otp' && styles.methodButtonTextActive,
                ]}
              >
                SMS OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'biometric' && styles.methodButtonActive,
              ]}
              onPress={() => setSelectedMethod('biometric')}
              disabled={isAuthenticating}
            >
              <Text style={styles.methodIcon}>👆</Text>
              <Text
                style={[
                  styles.methodButtonText,
                  selectedMethod === 'biometric' && styles.methodButtonTextActive,
                ]}
              >
                Biometric Scan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Authentication Forms */}
        <View style={styles.formContainer}>
          {selectedMethod === 'password' && (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Password Verification</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter your password</Text>
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    secureTextEntry
                    editable={!isAuthenticating}
                  />
                </View>

                {error && (
                  <Alert variant="destructive">
                    <Text style={styles.errorText}>{error}</Text>
                  </Alert>
                )}

                <Button
                  onPress={handlePasswordAuth}
                  disabled={isAuthenticating || !password}
                  style={styles.button}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify Password</Text>
                  )}
                </Button>
              </View>
            </Card>
          )}

          {selectedMethod === 'otp' && (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>SMS Verification</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.description}>
                  Enter the 6-digit code sent to your registered phone number.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <Input
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!isAuthenticating}
                    style={styles.otpInput}
                  />
                </View>

                {error && (
                  <Alert variant="destructive">
                    <Text style={styles.errorText}>{error}</Text>
                  </Alert>
                )}

                <Button
                  onPress={handleOTPAuth}
                  disabled={isAuthenticating || otp.length !== 6}
                  style={styles.button}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify Code</Text>
                  )}
                </Button>

                <View style={styles.demoBox}>
                  <Text style={styles.demoText}>Demo: Use code "123456"</Text>
                </View>
              </View>
            </Card>
          )}

          {selectedMethod === 'biometric' && (
            <Card>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Biometric Verification</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.biometricContainer}>
                  <View
                    style={[
                      styles.biometricCircle,
                      isAuthenticating && styles.biometricCircleActive,
                    ]}
                  >
                    <Text style={styles.fingerprintIcon}>👆</Text>
                  </View>

                  <View style={styles.biometricText}>
                    {isAuthenticating ? (
                      <>
                        <Text style={styles.biometricTitle}>Scanning...</Text>
                        <Text style={styles.biometricDescription}>
                          Please keep your finger still
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.biometricTitle}>Touch Sensor</Text>
                        <Text style={styles.biometricDescription}>
                          Place your finger on the sensor or look at the camera
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {error && (
                  <Alert variant="destructive">
                    <Text style={styles.errorText}>{error}</Text>
                  </Alert>
                )}

                {!isAuthenticating && (
                  <Button onPress={handleBiometricAuth} style={styles.button}>
                    Start Biometric Scan
                  </Button>
                )}
              </View>
            </Card>
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.timeoutNotice}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.timeoutText}>
            This session will timeout in 5 minutes for security reasons.
          </Text>
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
  alertMargin: {
    marginBottom: 16,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shieldIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  bold: {
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
  },
  contextContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contextInfo: {
    flex: 1,
  },
  contextLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contextValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockIcon: {
    fontSize: 14,
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
  formContainer: {
    marginBottom: 16,
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
  otpInput: {
    textAlign: 'center',
    letterSpacing: 4,
  },
  demoBox: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  biometricContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  biometricCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricCircleActive: {
    borderColor: '#3b82f6',
  },
  fingerprintIcon: {
    fontSize: 48,
  },
  biometricText: {
    alignItems: 'center',
  },
  biometricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  biometricDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  timeoutNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timeoutText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
  },
});
