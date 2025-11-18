import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button } from './ui/button.native';
import { Alert } from './ui/alert.native';
import { useToast } from './ui/toast.native';

interface BiometricScreenNewProps {
  navigation: any;
  route: any;
}

export function BiometricScreenNew({ navigation, route }: BiometricScreenNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-001' };
  const { showToast } = useToast();

  const [status, setStatus] = useState<'waiting' | 'scanning' | 'failed' | 'success'>('waiting');
  const [error, setError] = useState('');
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (status === 'scanning') {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (status === 'success') {
      // Success scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (status === 'failed') {
      // Shake animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status]);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setHasHardware(compatible);

    if (compatible) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsEnrolled(enrolled);
    }
  };

  const handleBiometricScan = async () => {
    if (!hasHardware) {
      setError('Biometric hardware not available on this device');
      setStatus('failed');
      return;
    }

    if (!isEnrolled) {
      setError('No biometric credentials enrolled. Please set up biometric authentication in device settings.');
      setStatus('failed');
      return;
    }

    setStatus('scanning');
    setError('');

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to verify your identity',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setStatus('success');
        showToast('Biometric verification successful!', 'success');
        setTimeout(() => {
          navigation.navigate('RoleSelectionNew', { staffId });
        }, 1000);
      } else {
        setStatus('failed');
        setError('Biometric verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('failed');
      setError('An error occurred during biometric verification.');
    }
  };

  const handleFallback = () => {
    navigation.navigate('MFASelectionNew', { staffId });
  };

  const getBorderColor = () => {
    switch (status) {
      case 'scanning':
        return '#3b82f6';
      case 'success':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#d1d5db';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'scanning':
        return '#3b82f6';
      case 'success':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      default:
        return '👆';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Biometric Verification</Text>
        </View>

        {/* Biometric Interface */}
        <View style={styles.biometricContainer}>
          <Animated.View
            style={[
              styles.biometricCircle,
              {
                borderColor: getBorderColor(),
                transform: [
                  { scale: status === 'scanning' ? pulseAnim : scaleAnim },
                ],
              },
            ]}
          >
            <Text style={[styles.biometricIcon, { color: getIconColor() }]}>
              {getStatusIcon()}
            </Text>
          </Animated.View>

          {/* Status Message */}
          <View style={styles.statusContainer}>
            {status === 'waiting' && (
              <>
                <Text style={styles.statusTitle}>Touch the sensor</Text>
                <Text style={styles.statusDescription}>
                  Place your finger on the sensor or look at the camera
                </Text>
              </>
            )}

            {status === 'scanning' && (
              <>
                <Text style={styles.statusTitle}>Scanning...</Text>
                <Text style={styles.statusDescription}>
                  Please keep your finger still
                </Text>
              </>
            )}

            {status === 'success' && (
              <>
                <Text style={[styles.statusTitle, { color: '#10b981' }]}>
                  Verified!
                </Text>
                <Text style={styles.statusDescription}>
                  Access granted
                </Text>
              </>
            )}

            {status === 'failed' && (
              <>
                <Text style={[styles.statusTitle, { color: '#ef4444' }]}>
                  Verification Failed
                </Text>
                <Text style={styles.statusDescription}>
                  Please try again or use an alternative method
                </Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          {status === 'waiting' && (
            <Button
              onPress={handleBiometricScan}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Start Biometric Scan</Text>
            </Button>
          )}

          {status === 'failed' && (
            <Button
              onPress={handleBiometricScan}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Try Again</Text>
            </Button>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              description={error}
              style={styles.errorAlert}
            />
          )}
        </View>

        {/* Fallback Options */}
        <View style={styles.fallbackContainer}>
          <Button
            variant="outline"
            onPress={handleFallback}
            style={styles.fallbackButton}
          >
            <Text style={styles.fallbackButtonText}>Use Password + OTP Instead</Text>
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('HelpNew')}
            activeOpacity={0.7}
            style={styles.helpButton}
          >
            <Text style={styles.helpButtonText}>Having trouble with biometrics?</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  biometricContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  biometricCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  biometricIcon: {
    fontSize: 64,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    marginBottom: 16,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorAlert: {
    width: '100%',
    marginTop: 16,
  },
  fallbackContainer: {
    marginTop: 'auto',
  },
  fallbackButton: {
    marginBottom: 16,
  },
  fallbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  helpButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
