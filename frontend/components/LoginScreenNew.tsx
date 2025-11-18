import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Alert,
  Badge,
  useToast,
} from './ui';
import * as LocalAuthentication from 'expo-local-authentication';
import { authAPI } from '../services/api';

interface LoginScreenNewProps {
  navigation: any;
}

export function LoginScreenNew({ navigation }: LoginScreenNewProps) {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loginMethod, setLoginMethod] = useState<'password' | 'biometric'>('password');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!staffId || !password) {
      setError('Please enter both Email and Password');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(staffId, password);
      
      showToast('Login successful!', 'success');
      
      // Navigate based on user role
      const role = response.data.staff.role;
      
      switch(role) {
        case 'psychiatrist':
          navigation.navigate('PsychiatristDashboardNew');
          break;
        case 'psychologist':
          navigation.navigate('PsychologistDashboardNew');
          break;
        case 'therapist':
          navigation.navigate('TherapistDashboardNew');
          break;
        case 'nurse':
          navigation.navigate('NurseDashboardNew');
          break;
        case 'admin':
          navigation.navigate('AdminDashboardNew');
          break;
        default:
          navigation.navigate('RoleSelectionNew');
      }
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setError('Account locked due to multiple failed attempts. Contact admin.');
        showToast('Account locked!', 'error');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
        showToast(`Login failed. ${3 - newAttempts} attempts remaining.`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!staffId) {
      setError('Please enter your Staff ID first');
      return;
    }

    setBiometricLoading(true);
    setError('');

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setError('Biometric authentication is not available on this device.');
        setBiometricLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access NeuroLock',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        showToast('Biometric authentication successful!', 'success');
        navigation.navigate('RoleSelectionNew');
      } else {
        setError('Biometric authentication failed. Please try again or use password.');
      }
    } catch (err) {
      setError('Biometric authentication error occurred.');
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IconButton icon="arrow-left" size={24} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Secure Login</Text>
            <Text style={styles.headerSubtitle}>Access your healthcare portal</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Staff ID Input */}
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={staffId}
            onChangeText={setStaffId}
            leftIcon={<IconButton icon="email" size={20} />}
            containerStyle={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Login Method Selection */}
          <View style={styles.methodSelection}>
            <Text style={styles.methodTitle}>Choose your authentication method</Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === 'password' && styles.methodButtonActive,
                ]}
                onPress={() => setLoginMethod('password')}
                activeOpacity={0.7}
              >
                {loginMethod === 'password' ? (
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.methodGradient}
                  >
                    <IconButton icon="lock" size={24} iconColor="#ffffff" />
                    <Text style={styles.methodTextActive}>Password</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.methodContent}>
                    <IconButton icon="lock" size={24} iconColor="#64748b" />
                    <Text style={styles.methodText}>Password</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  loginMethod === 'biometric' && styles.methodButtonActive,
                ]}
                onPress={() => setLoginMethod('biometric')}
                activeOpacity={0.7}
              >
                {loginMethod === 'biometric' ? (
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.methodGradient}
                  >
                    <IconButton icon="fingerprint" size={24} iconColor="#ffffff" />
                    <Text style={styles.methodTextActive}>Biometric</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.methodContent}>
                    <IconButton icon="fingerprint" size={24} iconColor="#64748b" />
                    <Text style={styles.methodText}>Biometric</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Login Form */}
          {loginMethod === 'password' && (
            <Card style={styles.authCard}>
              <CardHeader style={styles.cardHeader}>
                <View style={styles.cardHeaderContent}>
                  <View style={styles.cardIcon}>
                    <IconButton icon="lock" size={20} iconColor="#ffffff" />
                  </View>
                  <CardTitle>Password Authentication</CardTitle>
                </View>
              </CardHeader>
              <CardContent>
                <Input
                  label="Password"
                  placeholder="Enter your secure password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  leftIcon={<IconButton icon="key" size={20} />}
                  containerStyle={styles.passwordInput}
                />

                <Button
                  onPress={handleSubmit}
                  disabled={attempts >= 3 || !staffId || !password || loading}
                  loading={loading}
                  style={styles.submitButton}
                >
                  <IconButton icon="lock" size={20} iconColor="#ffffff" />
                  <Text style={styles.submitButtonText}>Sign In Securely</Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Biometric Login */}
          {loginMethod === 'biometric' && (
            <Card style={styles.authCard}>
              <CardHeader style={styles.cardHeaderBiometric}>
                <View style={styles.cardHeaderContent}>
                  <View style={[styles.cardIcon, { backgroundColor: '#10b981' }]}>
                    <IconButton icon="fingerprint" size={20} iconColor="#ffffff" />
                  </View>
                  <CardTitle>Biometric Authentication</CardTitle>
                </View>
              </CardHeader>
              <CardContent style={styles.biometricContent}>
                <View style={styles.biometricIcon}>
                  <LinearGradient
                    colors={biometricLoading ? ['#e0f2fe', '#bae6fd'] : ['#f1f5f9', '#e2e8f0']}
                    style={styles.biometricIconGradient}
                  >
                    <IconButton
                      icon="fingerprint"
                      size={64}
                      iconColor={biometricLoading ? '#3b82f6' : '#64748b'}
                    />
                  </LinearGradient>
                </View>

                <Text style={styles.biometricTitle}>
                  {biometricLoading ? 'Verifying your identity...' : 'Secure biometric verification'}
                </Text>
                <Text style={styles.biometricSubtitle}>
                  {!biometricLoading && 'Fingerprint, Face ID, or Device PIN'}
                </Text>

                <Button
                  onPress={handleBiometricLogin}
                  disabled={attempts >= 3 || !staffId || biometricLoading}
                  loading={biometricLoading}
                  style={styles.submitButtonBiometric}
                >
                  {biometricLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.submitButtonText}>Authenticating...</Text>
                    </>
                  ) : (
                    <>
                      <IconButton icon="fingerprint" size={20} iconColor="#ffffff" />
                      <Text style={styles.submitButtonText}>Authenticate Now</Text>
                    </>
                  )}
                </Button>

                <Button
                  variant="link"
                  onPress={() => setLoginMethod('password')}
                  style={styles.switchButton}
                >
                  <Text style={styles.switchButtonText}>Use password instead</Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert
              variant={attempts >= 3 ? 'destructive' : 'warning'}
              title="Authentication Error"
              description={error}
              style={styles.alert}
              icon={<IconButton icon="alert-circle" size={20} />}
            />
          )}

          {/* Demo Instructions */}
          <Card style={styles.demoCard}>
            <CardContent style={styles.demoContent}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>• Psychiatrist: psychiatrist@neurolock.com</Text>
              <Text style={styles.demoText}>• Therapist: therapist@neurolock.com</Text>
              <Text style={styles.demoText}>• Nurse: nurse@neurolock.com</Text>
              <Text style={styles.demoText}>• Admin: admin@neurolock.com</Text>
              <Text style={styles.demoText}>• Password: password123</Text>
            </CardContent>
          </Card>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPasswordNew')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <View style={styles.securityItem}>
            <IconButton icon="shield-check" size={16} iconColor="#10b981" />
            <Text style={styles.securityText}>Secure Login</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.securityItem}>
            <IconButton icon="lock" size={16} iconColor="#10b981" />
            <Text style={styles.securityText}>256-bit Encryption</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24,
  },
  headerText: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 24,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    marginBottom: 24,
  },
  methodSelection: {
    marginBottom: 24,
  },
  methodTitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  methodButtonActive: {
    borderColor: '#3b82f6',
  },
  methodGradient: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  methodContent: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  methodTextActive: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  authCard: {
    marginBottom: 16,
  },
  cardHeader: {
    backgroundColor: '#e0f2fe',
  },
  cardHeaderBiometric: {
    backgroundColor: '#d1fae5',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passwordInput: {
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonBiometric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
  },
  biometricContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  biometricIcon: {
    marginBottom: 16,
  },
  biometricIconGradient: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  biometricSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  switchButton: {
    marginTop: 8,
  },
  switchButtonText: {
    color: '#64748b',
    fontSize: 14,
  },
  alert: {
    marginBottom: 16,
  },
  demoCard: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
    marginBottom: 16,
  },
  demoContent: {
    padding: 16,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748b',
    marginHorizontal: 12,
  },
});
