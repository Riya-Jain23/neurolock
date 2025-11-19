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
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';

type StepType = 'verification' | 'code' | 'device' | 'supervisor' | 'admin' | 'approval';
type VerificationTechniqueType = 'email' | 'mobile' | '';

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

  const [currentStep, setCurrentStep] = useState<StepType>('verification');
  const [verificationTechnique, setVerificationTechnique] = useState<VerificationTechniqueType>('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [deviceTypeVisible, setDeviceTypeVisible] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [justification, setJustification] = useState('');
  const [supervisorEmail] = useState('supervisor@hospital.com');
  const [supervisorStatus, setSupervisorStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [sendingSupervisor, setSendingSupervisor] = useState(false);
  const [adminVerificationCode, setAdminVerificationCode] = useState('');
  const [adminStatus, setAdminStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);

  const handleSendVerificationCode = async () => {
    setSendingCode(true);
    setTimeout(() => {
      setCodeSent(true);
      setSendingCode(false);
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setCodeVerified(true);
      setTimeout(() => setCurrentStep('device'), 500);
    }
  };

  const handleRegisterDevice = () => {
    if (deviceType && deviceName && justification) {
      setCurrentStep('supervisor');
    }
  };

  const handleSendSupervisorApproval = () => {
    setSendingSupervisor(true);
    setTimeout(() => {
      setSupervisorStatus('approved');
      setSendingSupervisor(false);
    }, 2000);
  };

  const handleCompleteAdminVerification = () => {
    if (adminVerificationCode.length >= 4) {
      setVerifyingAdmin(true);
      setTimeout(() => {
        setAdminStatus('verified');
        setVerifyingAdmin(false);
        setCurrentStep('approval');
      }, 1500);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Smartphone':
        return '📱';
      case 'Tablet':
        return '📱';
      case 'Desktop/Laptop':
        return '💻';
      default:
        return '🛡️';
    }
  };

  if (currentStep === 'verification') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Device</Text>
          </View>

          <Alert style={styles.alertMargin}>
            <View style={styles.alertContent}>
              <Text style={styles.shieldIcon}>🛡️</Text>
              <Text style={styles.alertText}>
                <Text style={styles.bold}>Device Registration:</Text> Select a verification technique to proceed.
              </Text>
            </View>
          </Alert>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 1: Select Verification Technique</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>Choose how you'd like to receive a verification code:</Text>
              
              <TouchableOpacity
                style={[styles.techniqueCard, verificationTechnique === 'email' && styles.techniqueCardActive]}
                onPress={() => setVerificationTechnique('email')}
                activeOpacity={0.7}
              >
                <View style={styles.techniqueIconBox}>
                  <Text style={styles.techniqueIcon}>✉️</Text>
                </View>
                <View style={styles.techniqueInfo}>
                  <Text style={styles.techniqueName}>Email Verification</Text>
                  <Text style={styles.techniqueDesc}>Receive code at your registered email</Text>
                  <Text style={styles.techniqueEmail}>john.smith@hospital.com</Text>
                </View>
                <Text style={styles.techniqueCheck}>{verificationTechnique === 'email' ? '✓' : ''}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.techniqueCard, verificationTechnique === 'mobile' && styles.techniqueCardActive]}
                onPress={() => setVerificationTechnique('mobile')}
                activeOpacity={0.7}
              >
                <View style={styles.techniqueIconBox}>
                  <Text style={styles.techniqueIcon}>📱</Text>
                </View>
                <View style={styles.techniqueInfo}>
                  <Text style={styles.techniqueName}>Mobile Verification</Text>
                  <Text style={styles.techniqueDesc}>Receive code via SMS</Text>
                  <Text style={styles.techniqueEmail}>+1 (555) ***-7890</Text>
                </View>
                <Text style={styles.techniqueCheck}>{verificationTechnique === 'mobile' ? '✓' : ''}</Text>
              </TouchableOpacity>

              <Button onClick={() => {
                if (verificationTechnique) setCurrentStep('code');
              }} disabled={!verificationTechnique} style={styles.button}>
                Continue to Verification
              </Button>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentStep === 'code') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentStep('verification')} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify Yourself</Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 2: Verify Your Identity</Text>
            </View>
            <View style={styles.cardContent}>
              {!codeSent ? (
                <>
                  <Text style={styles.description}>
                    Click the button below to send a verification code via {' '}
                    <Text style={styles.bold}>
                      {verificationTechnique === 'email' ? 'Email' : 'SMS'}
                    </Text>
                  </Text>
                  
                  <View style={styles.methodBox}>
                    <Text style={styles.methodIcon}>
                      {verificationTechnique === 'email' ? '✉️' : '📱'}
                    </Text>
                    <Text style={styles.methodText}>
                      {verificationTechnique === 'email'
                        ? 'john.smith@hospital.com'
                        : '+1 (555) ***-7890'}
                    </Text>
                  </View>

                  <Button onClick={handleSendVerificationCode} disabled={sendingCode} style={styles.button}>
                    {sendingCode ? 'Sending...' : `Send Code via ${verificationTechnique === 'email' ? 'Email' : 'SMS'}`}
                  </Button>
                </>
              ) : (
                <>
                  <Alert variant="default" style={styles.successAlert}>
                    <Text style={styles.successText}>
                      ✓ Verification code sent successfully!
                    </Text>
                  </Alert>

                  <Text style={styles.label}>Enter 6-digit verification code:</Text>
                  <TextInput
                    style={styles.codeInput}
                    value={verificationCode}
                    onChangeText={(text) =>
                      setVerificationCode(text.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    keyboardType="numeric"
                    maxLength={6}
                  />

                  <Button onClick={handleVerifyCode} disabled={verificationCode.length !== 6 || codeVerified} style={styles.button}>
                    {codeVerified ? 'Verified ✓' : 'Verify Code'}
                  </Button>

                  <TouchableOpacity onPress={() => setCodeSent(false)}>
                    <Text style={styles.resendLink}>Resend code</Text>
                  </TouchableOpacity>
                </>
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
            <TouchableOpacity onPress={() => setCurrentStep('verification')} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Register Device</Text>
          </View>

          <Badge variant="outline" style={styles.verifiedBadge}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.verifiedText}>Identity Verified</Text>
          </Badge>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 3: Device Information</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Device Type *</Text>
                <Menu
                  visible={deviceTypeVisible}
                  onDismiss={() => setDeviceTypeVisible(false)}
                  anchor={
                    <TouchableOpacity style={styles.selectButton} onPress={() => setDeviceTypeVisible(true)}>
                      <Text style={styles.selectButtonText}>
                        {deviceType || 'Select device type'}
                      </Text>
                      <Text style={styles.selectArrow}>▼</Text>
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item onPress={() => {setDeviceType('Smartphone'); setDeviceTypeVisible(false);}} title="📱 Smartphone" />
                  <Menu.Item onPress={() => {setDeviceType('Tablet'); setDeviceTypeVisible(false);}} title="📱 Tablet" />
                  <Menu.Item onPress={() => {setDeviceType('Desktop/Laptop'); setDeviceTypeVisible(false);}} title="💻 Desktop/Laptop" />
                </Menu>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Device Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={deviceName}
                  onChangeText={setDeviceName}
                  placeholder="e.g., My Hospital Laptop"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Justification *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={justification}
                  onChangeText={setJustification}
                  placeholder="Why do you need access from this device?"
                  multiline
                  numberOfLines={4}
                />
              </View>

                  <Button onClick={handleRegisterDevice} disabled={!deviceType || !deviceName || !justification} style={styles.button}>
                Continue to Supervisor Approval
              </Button>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentStep === 'supervisor') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentStep('device')} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Supervisor Approval</Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 4: Supervisor Approval</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                Your device registration request will be sent to your supervisor for approval.
              </Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Supervisor Email:</Text>
                <Text style={styles.infoValue}>{supervisorEmail}</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Request Summary:</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Device Type:</Text>
                  <Text style={styles.summaryValue}>{getDeviceIcon(deviceType)} {deviceType}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Device Name:</Text>
                  <Text style={styles.summaryValue}>{deviceName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Justification:</Text>
                  <Text style={styles.summaryValue}>{justification}</Text>
                </View>
              </View>

              {supervisorStatus === 'pending' && (
                <Button onClick={handleSendSupervisorApproval} disabled={sendingSupervisor} style={styles.button}>
                  {sendingSupervisor ? 'Sending Request...' : 'Send for Supervisor Approval'}
                </Button>
              )}

              {supervisorStatus === 'approved' && (
                <>
                  <Alert variant="default" style={styles.approvalAlert}>
                    <Text style={styles.approvalText}>
                      ✓ Supervisor approval request sent!
                    </Text>
                  </Alert>
                  <Button onClick={() => setCurrentStep('admin')} style={styles.button}>
                    Proceed to Admin Verification
                  </Button>
                </>
              )}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentStep === 'admin') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentStep('supervisor')} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Verification</Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Step 5: Admin Verification</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                An administrator will verify your device registration request. Enter the verification code provided by IT administration.
              </Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>🔐</Text>
                <View>
                  <Text style={styles.infoLabel}>Verification Status:</Text>
                  <Text style={styles.infoValue}>
                    {adminStatus === 'pending' ? 'Awaiting Verification' : 'Verified ✓'}
                  </Text>
                </View>
              </View>

              {adminStatus === 'pending' ? (
                <>
                  <Text style={styles.label}>Enter Admin Verification Code:</Text>
                  <TextInput
                    style={styles.codeInput}
                    value={adminVerificationCode}
                    onChangeText={setAdminVerificationCode}
                    placeholder="Admin code"
                    secureTextEntry
                  />

                  <Button onClick={handleCompleteAdminVerification} disabled={adminVerificationCode.length < 4 || verifyingAdmin} style={styles.button}>
                    {verifyingAdmin ? 'Verifying...' : 'Complete Verification'}
                  </Button>

                  <Text style={styles.helpText}>
                    Contact your IT administrator to receive the verification code.
                  </Text>
                </>
              ) : (
                <>
                  <Alert variant="default" style={styles.successAlert}>
                    <Text style={styles.successText}>
                      ✓ Device verification completed successfully!
                    </Text>
                  </Alert>
                  <Button onClick={() => setCurrentStep('approval')} style={styles.button}>
                    Continue to Completion
                  </Button>
                </>
              )}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Registration Complete</Text>
        </View>

        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Device Registration Approved!</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Registration Summary</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Device Type:</Text>
              <Text style={styles.summaryValue}>{getDeviceIcon(deviceType)} {deviceType}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Device Name:</Text>
              <Text style={styles.summaryValue}>{deviceName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Verification Method:</Text>
              <Text style={styles.summaryValue}>{verificationTechnique === 'email' ? 'Email' : 'SMS'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Staff ID:</Text>
              <Text style={styles.summaryValue}>{staffId}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Next Steps</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Setup Instructions</Text>
                <Text style={styles.stepDesc}>Check your email for device setup instructions</Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Install Security Software</Text>
                <Text style={styles.stepDesc}>Download and install the required security applications</Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Activate Device</Text>
                <Text style={styles.stepDesc}>Log in and activate your device within 7 days</Text>
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.buttonGroup}>
          <Button onClick={() => navigation.navigate('AdminDashboardNew' as never)} style={styles.button}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigation.goBack()} style={styles.button}>
            Back
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  scrollView: {flex: 1, padding: 16},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 24},
  backButton: {padding: 8},
  backButtonText: {fontSize: 24, color: '#374151'},
  headerTitle: {fontSize: 20, fontWeight: '600', color: '#111827', marginLeft: 12},
  alertMargin: {marginBottom: 16},
  alertContent: {flexDirection: 'row', alignItems: 'flex-start'},
  shieldIcon: {fontSize: 20, marginRight: 8},
  alertText: {flex: 1, fontSize: 14, color: '#374151'},
  bold: {fontWeight: '600'},
  card: {marginBottom: 16},
  cardHeader: {marginBottom: 16},
  cardTitle: {fontSize: 18, fontWeight: '600', color: '#111827'},
  cardContent: {gap: 16},
  description: {fontSize: 14, color: '#6b7280', lineHeight: 20},
  label: {fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8},
  techniqueCard: {flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, gap: 12, marginBottom: 12},
  techniqueCardActive: {borderColor: '#3b82f6', backgroundColor: '#eff6ff'},
  techniqueIconBox: {width: 50, height: 50, borderRadius: 8, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center'},
  techniqueIcon: {fontSize: 28},
  techniqueInfo: {flex: 1},
  techniqueName: {fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4},
  techniqueDesc: {fontSize: 13, color: '#6b7280', marginBottom: 4},
  techniqueEmail: {fontSize: 12, color: '#3b82f6'},
  techniqueCheck: {fontSize: 20, color: '#3b82f6', fontWeight: '700'},
  selectButton: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, backgroundColor: '#ffffff'},
  selectButtonText: {fontSize: 14, color: '#111827'},
  selectArrow: {fontSize: 12, color: '#6b7280'},
  inputGroup: {gap: 8},
  textInput: {borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827', backgroundColor: '#ffffff'},
  textArea: {minHeight: 80, textAlignVertical: 'top'},
  methodBox: {flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, gap: 12},
  methodIcon: {fontSize: 24},
  methodText: {fontSize: 14, color: '#111827', fontWeight: '500'},
  codeInput: {borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 18, color: '#111827', backgroundColor: '#f9fafb', textAlign: 'center', letterSpacing: 4, fontWeight: '600'},
  button: {width: '100%'},
  resendLink: {fontSize: 14, color: '#3b82f6', textAlign: 'center', fontWeight: '500'},
  verifiedBadge: {alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 12, paddingVertical: 6, borderColor: '#10b981'},
  checkIcon: {fontSize: 14, color: '#10b981', marginRight: 4},
  verifiedText: {fontSize: 14, color: '#10b981'},
  infoBox: {padding: 12, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12},
  infoIcon: {fontSize: 24},
  infoLabel: {fontSize: 12, color: '#6b7280', marginBottom: 4},
  infoValue: {fontSize: 14, color: '#111827', fontWeight: '600'},
  summaryBox: {padding: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8},
  summaryTitle: {fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb'},
  summaryLabel: {fontSize: 13, color: '#6b7280'},
  summaryValue: {fontSize: 13, color: '#111827', fontWeight: '500'},
  successAlert: {backgroundColor: '#f0fdf4', borderColor: '#86efac'},
  successText: {fontSize: 14, color: '#166534'},
  approvalAlert: {backgroundColor: '#f0fdf4', borderColor: '#86efac'},
  approvalText: {fontSize: 14, color: '#166534'},
  successContainer: {alignItems: 'center', padding: 24, marginBottom: 16},
  successIcon: {fontSize: 56, color: '#10b981', marginBottom: 8},
  successTitle: {fontSize: 18, fontWeight: '600', color: '#111827'},
  stepItem: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12},
  stepNumber: {width: 30, height: 30, borderRadius: 15, backgroundColor: '#3b82f6', color: '#ffffff', textAlign: 'center', textAlignVertical: 'center', fontWeight: '600', fontSize: 14},
  stepContent: {flex: 1},
  stepTitle: {fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4},
  stepDesc: {fontSize: 13, color: '#6b7280'},
  helpText: {fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 8},
  buttonGroup: {gap: 8, marginBottom: 24},
});
