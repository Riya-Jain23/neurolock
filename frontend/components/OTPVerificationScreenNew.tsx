import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from './ui/card.native';
import { Button } from './ui/button.native';
import { Alert } from './ui/alert.native';
import { useToast } from './ui/toast.native';

interface OTPVerificationScreenNewProps {
  navigation: any;
  route: any;
}

interface MethodConfig {
  title: string;
  description: string;
  icon: string;
  destination: string;
  colors: string[];
}

export function OTPVerificationScreenNew({ navigation, route }: OTPVerificationScreenNewProps) {
  const { method, staffId } = route.params || { method: 'sms', staffId: 'STAFF-001' };
  const { showToast } = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const methodConfigs: Record<string, MethodConfig> = {
    sms: {
      title: 'SMS Verification',
      description: 'Enter the 6-digit code sent to your phone',
      icon: '📱',
      destination: '••• ••• 1234',
      colors: ['#3b82f6', '#2563eb'],
    },
    email: {
      title: 'Email Verification',
      description: 'Enter the 6-digit code sent to your email',
      icon: '✉️',
      destination: 'j••••@hospital.com',
      colors: ['#a855f7', '#9333ea'],
    },
    authenticator: {
      title: 'Authenticator App',
      description: 'Enter the 6-digit code from your authenticator app',
      icon: '🛡️',
      destination: 'Google Authenticator / Authy',
      colors: ['#10b981', '#059669'],
    },
  };

  const config = methodConfigs[method] || methodConfigs.sms;

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every((digit) => digit) && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (code?: string) => {
    const otpValue = code || otp.join('');
    setError('');

    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    // Simulate API call
    setTimeout(() => {
      if (otpValue === '123456') {
        showToast('OTP verified successfully!', 'success');
        navigation.navigate('RoleSelectionNew', { staffId });
      } else {
        setError('Invalid code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleResend = () => {
    setCanResend(false);
    setResendTimer(30);
    setError('');
    setOtp(['', '', '', '', '', '']);
    showToast('New code sent successfully', 'success');
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{config.title}</Text>
            <Text style={styles.headerSubtitle}>Secure verification step</Text>
          </View>
        </View>

        {/* Method Info Card */}
        <Card style={styles.methodInfoCard}>
          <LinearGradient
            colors={config.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.methodInfoGradient}
          >
            <CardContent style={styles.methodInfoContent}>
              <View style={styles.methodIconContainer}>
                <Text style={styles.methodIcon}>{config.icon}</Text>
              </View>
              <View style={styles.methodTextContainer}>
                <Text style={styles.methodDestination}>{config.destination}</Text>
                <Text style={styles.methodDescription}>{config.description}</Text>
              </View>
              <View style={styles.lockIconContainer}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            </CardContent>
          </LinearGradient>
        </Card>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Verification Code</Text>
          <View style={styles.otpInputRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>
        </View>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            description={error}
            style={styles.errorAlert}
          />
        )}

        {/* Verify Button */}
        <Button
          onPress={() => handleSubmit()}
          disabled={isVerifying || otp.some((digit) => !digit)}
          style={styles.verifyButton}
        >
          {isVerifying ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Code</Text>
          )}
        </Button>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>Resend code in {resendTimer}s</Text>
          )}
        </View>

        {/* Demo Hint */}
        <View style={styles.demoHintCard}>
          <Text style={styles.demoHintText}>💡 Demo: Use code "123456"</Text>
        </View>

        {/* Alternative Options */}
        <View style={styles.alternativeContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.alternativeText}>Try a different method</Text>
          </TouchableOpacity>
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  methodInfoCard: {
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  methodInfoGradient: {
    borderRadius: 12,
  },
  methodInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIcon: {
    fontSize: 28,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodDestination: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: '#e0f2fe',
  },
  lockIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1f2937',
  },
  otpInputFilled: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  errorAlert: {
    marginBottom: 24,
  },
  verifyButton: {
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  demoHintCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 24,
  },
  demoHintText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  alternativeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  alternativeText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
