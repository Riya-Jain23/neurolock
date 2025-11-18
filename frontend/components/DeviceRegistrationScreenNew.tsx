import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Menu } from 'react-native-paper';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';

type StepType = 'identity' | 'device' | 'approval';

interface DeviceRegistrationScreenNewProps {
  route?: {
    params?: {
      staffId?: string;
    };
  };
}

export default function DeviceRegistrationScreenNew({
  route,
}: DeviceRegistrationScreenNewProps) {
  const navigation = useNavigation();
  const staffId = route?.params?.staffId || 'STAFF001';

  const [currentStep, setCurrentStep] = useState<StepType>('identity');
  const [verificationMethodVisible, setVerificationMethodVisible] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [deviceTypeVisible, setDeviceTypeVisible] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [justification, setJustification] = useState('');

  const handleIdentityVerification = () => {
    if (verificationCode.length === 6) {
      setCurrentStep('device');
    }
  };

  const handleDeviceRegistration = () => {
    if (deviceType && deviceName && justification) {
      setCurrentStep('approval');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return '📱';
      case 'tablet':
        return '📱';
      case 'desktop':
        return '💻';
      default:
        return '🛡️';
    }
  };

  if (currentStep === 'identity') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountLockedNew' as never)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Device Registration</Text>
          </View>

          <Alert style={styles.alertMargin}>
            <View style={styles.alertContent}>
              <Text style={styles.shieldIcon}>🛡️</Text>
              <Text style={styles.alertText}>
                <Text style={styles.bold}>Identity Verification Required:</Text> Before registering
                a new device, we need to verify your identity using an alternative method.
              </Text>
            </View>
          </Alert>

          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 1: Verify Identity</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.label}>Verification Method</Text>
              <Menu
                visible={verificationMethodVisible}
                onDismiss={() => setVerificationMethodVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setVerificationMethodVisible(true)}
                  >
                    <Text style={styles.selectButtonText}>
                      {verificationMethod || 'Choose verification method'}
                    </Text>
                    <Text style={styles.selectArrow}>▼</Text>
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setVerificationMethod('Emergency Email');
                    setVerificationMethodVisible(false);
                  }}
                  title="Emergency Email"
                />
                <Menu.Item
                  onPress={() => {
                    setVerificationMethod('Emergency Phone (SMS)');
                    setVerificationMethodVisible(false);
                  }}
                  title="Emergency Phone (SMS)"
                />
                <Menu.Item
                  onPress={() => {
                    setVerificationMethod('Supervisor Approval');
                    setVerificationMethodVisible(false);
                  }}
                  title="Supervisor Approval"
                />
                <Menu.Item
                  onPress={() => {
                    setVerificationMethod('Admin Verification');
                    setVerificationMethodVisible(false);
                  }}
                  title="Admin Verification"
                />
              </Menu>

              {verificationMethod && (
                <View style={styles.methodInfo}>
                  {verificationMethod === 'Emergency Email' && (
                    <View style={styles.methodDetails}>
                      <View style={styles.row}>
                        <Text style={styles.mailIcon}>✉️</Text>
                        <Text style={styles.methodText}>Emergency Email: s****@hospital.com</Text>
                      </View>
                      <Text style={styles.helpText}>
                        A verification code will be sent to your registered emergency email.
                      </Text>
                    </View>
                  )}

                  {verificationMethod === 'Emergency Phone (SMS)' && (
                    <View style={styles.methodDetails}>
                      <View style={styles.row}>
                        <Text style={styles.phoneIcon}>📞</Text>
                        <Text style={styles.methodText}>Emergency Phone: ***-***-1234</Text>
                      </View>
                      <Text style={styles.helpText}>
                        A verification code will be sent via SMS to your emergency contact number.
                      </Text>
                    </View>
                  )}

                  {verificationMethod === 'Supervisor Approval' && (
                    <View style={styles.methodDetails}>
                      <Text style={styles.helpText}>
                        Your immediate supervisor will be contacted to verify your identity and
                        approve the device registration request.
                      </Text>
                    </View>
                  )}

                  {verificationMethod === 'Admin Verification' && (
                    <View style={styles.methodDetails}>
                      <Text style={styles.helpText}>
                        IT Administrator will manually verify your identity using employment records
                        and security questions.
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {verificationMethod &&
              (verificationMethod.includes('Email') || verificationMethod.includes('Phone')) ? (
                <View style={styles.verificationSection}>
                  <Button disabled={!verificationMethod} style={styles.button}>
                    Send Verification Code
                  </Button>

                  <Text style={styles.inputLabel}>Enter 6-digit verification code:</Text>
                  <Input
                    value={verificationCode}
                    onChangeText={(text) =>
                      setVerificationCode(text.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="123456"
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.codeInput}
                  />

                  <Button
                    onPress={handleIdentityVerification}
                    disabled={verificationCode.length !== 6}
                    style={styles.button}
                  >
                    Verify Identity
                  </Button>
                </View>
              ) : (
                verificationMethod && (
                  <Button onPress={() => setCurrentStep('device')} style={styles.button}>
                    Submit for Manual Verification
                  </Button>
                )
              )}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentStep === 'device') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setCurrentStep('identity')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Register New Device</Text>
          </View>

          <Badge variant="outline" style={styles.verifiedBadge}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.verifiedText}>Identity Verified</Text>
          </Badge>

          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 2: Device Information</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Device Type</Text>
                <Menu
                  visible={deviceTypeVisible}
                  onDismiss={() => setDeviceTypeVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setDeviceTypeVisible(true)}
                    >
                      <Text style={styles.selectButtonText}>
                        {deviceType || 'Select device type'}
                      </Text>
                      <Text style={styles.selectArrow}>▼</Text>
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setDeviceType('Smartphone');
                      setDeviceTypeVisible(false);
                    }}
                    title="Smartphone"
                  />
                  <Menu.Item
                    onPress={() => {
                      setDeviceType('Tablet');
                      setDeviceTypeVisible(false);
                    }}
                    title="Tablet"
                  />
                  <Menu.Item
                    onPress={() => {
                      setDeviceType('Desktop/Laptop');
                      setDeviceTypeVisible(false);
                    }}
                    title="Desktop/Laptop"
                  />
                </Menu>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Device Name</Text>
                <Input
                  value={deviceName}
                  onChangeText={setDeviceName}
                  placeholder="e.g., Sarah's iPhone, Work Laptop, etc."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact</Text>
                <Input
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  placeholder="Phone number or email for emergency access"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Justification</Text>
                <TextInput
                  value={justification}
                  onChangeText={setJustification}
                  placeholder="Explain why you need to register a new device (e.g., lost phone, device stolen, hardware failure, etc.)"
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />
              </View>

              <View style={styles.warningBox}>
                <View style={styles.warningHeader}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningTitle}>Security Notice:</Text>
                </View>
                <Text style={styles.warningText}>
                  New device registration requires administrator approval and may take up to 24
                  hours. You will receive email notification when approved.
                </Text>
              </View>

              <Button
                onPress={handleDeviceRegistration}
                disabled={!deviceType || !deviceName || !justification}
                style={styles.button}
              >
                Submit Registration Request
              </Button>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Approval step
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Registration Submitted</Text>
        </View>

        <Alert style={styles.alertMargin}>
          <View style={styles.alertContent}>
            <Text style={styles.clockIcon}>⏰</Text>
            <Text style={styles.alertText}>
              <Text style={styles.bold}>Request Pending:</Text> Your device registration request
              has been submitted and is awaiting administrator approval.
            </Text>
          </View>
        </Alert>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Request Summary</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Staff ID</Text>
                <Text style={styles.summaryValue}>{staffId}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Request ID</Text>
                <Text style={styles.summaryValue}>DEV-{Date.now().toString().slice(-6)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Device Type</Text>
                <View style={styles.row}>
                  <Text style={styles.deviceIcon}>
                    {getDeviceIcon(deviceType.toLowerCase().split('/')[0])}
                  </Text>
                  <Text style={styles.summaryValue}>{deviceType}</Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Device Name</Text>
                <Text style={styles.summaryValue}>{deviceName}</Text>
              </View>
              <View style={[styles.summaryItem, styles.fullWidth]}>
                <Text style={styles.summaryLabel}>Justification</Text>
                <Text style={styles.summaryValue}>{justification}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Next Steps</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Administrator Review</Text>
                <Text style={styles.stepDescription}>
                  Your request will be reviewed within 24 hours during business hours.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, styles.stepNumberInactive]}>
                <Text style={styles.stepNumberTextInactive}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Email Notification</Text>
                <Text style={styles.stepDescription}>
                  You'll receive an email when your device is approved or if additional information
                  is needed.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, styles.stepNumberInactive]}>
                <Text style={styles.stepNumberTextInactive}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Device Setup</Text>
                <Text style={styles.stepDescription}>
                  Once approved, you'll receive setup instructions for your new device.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Emergency Access</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.description}>
              If you need immediate system access for patient care:
            </Text>
            <Text style={styles.tipText}>• Contact your immediate supervisor</Text>
            <Text style={styles.tipText}>• Call IT Emergency Line: (555) 123-4567</Text>
            <Text style={styles.tipText}>• Use backup codes if available</Text>
            <Text style={styles.tipText}>• Request temporary access from administration</Text>
          </View>
        </Card>

        <View style={styles.buttonGroup}>
          <Button onPress={() => navigation.navigate('WelcomeNew' as never)} style={styles.button}>
            Return to Welcome
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.navigate('AccountLockedNew' as never)}
            style={styles.button}
          >
            Back to Account Recovery
          </Button>
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
  clockIcon: {
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  selectArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  methodInfo: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 12,
  },
  methodDetails: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  methodText: {
    fontSize: 14,
    color: '#111827',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
  },
  verificationSection: {
    gap: 12,
    marginTop: 12,
  },
  button: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 4,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderColor: '#10b981',
  },
  checkIcon: {
    fontSize: 14,
    color: '#10b981',
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: '#10b981',
  },
  inputGroup: {
    gap: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  warningBox: {
    padding: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 8,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
  },
  card: {
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 16,
  },
  summaryItem: {
    gap: 4,
  },
  fullWidth: {
    width: '100%',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  deviceIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberInactive: {
    backgroundColor: '#e5e7eb',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  stepNumberTextInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  buttonGroup: {
    gap: 8,
    marginBottom: 24,
  },
});
