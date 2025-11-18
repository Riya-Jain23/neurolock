import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';
import { Separator } from './ui/separator';

interface AccountLockedScreenNewProps {
  route?: {
    params?: {
      staffId?: string;
      lockReason?: 'failed-attempts' | 'security-breach' | 'admin-lock';
      attemptsCount?: number;
    };
  };
}

export default function AccountLockedScreenNew({ route }: AccountLockedScreenNewProps) {
  const navigation = useNavigation();
  const staffId = route?.params?.staffId || 'STAFF001';
  const lockReason = route?.params?.lockReason || 'failed-attempts';
  const attemptsCount = route?.params?.attemptsCount || 5;

  const [backupCode, setBackupCode] = useState('');
  const [showBackupCodeEntry, setShowBackupCodeEntry] = useState(false);
  const [adminContactSent, setAdminContactSent] = useState(false);

  const lockMessages = {
    'failed-attempts': `Account temporarily locked after ${attemptsCount} failed login attempts`,
    'security-breach': 'Account locked due to suspicious security activity',
    'admin-lock': 'Account has been administratively locked',
  };

  const getLockDuration = () => {
    if (lockReason === 'failed-attempts') return '30 minutes';
    if (lockReason === 'security-breach') return '24 hours';
    return 'Until administrator review';
  };

  const handleBackupCodeSubmit = () => {
    if (backupCode.length === 8) {
      navigation.navigate('RoleSelectionNew' as never);
    }
  };

  const handleContactAdmin = () => {
    setAdminContactSent(true);
    console.log(`Admin contact request sent for locked account: ${staffId}`);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('WelcomeNew' as never)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Locked</Text>
        </View>

        {/* Lock Status Alert */}
        <Alert variant="destructive" style={styles.alertMargin}>
          <View style={styles.alertContent}>
            <Text style={styles.lockIcon}>🔒</Text>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertText}>{lockMessages[lockReason]}</Text>
              <Text style={styles.alertText}>Account: {staffId}</Text>
              <Text style={styles.alertText}>Lock Duration: {getLockDuration()}</Text>
            </View>
          </View>
        </Alert>

        {/* Lock Details */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.cardTitle}>Security Information</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Lock Time</Text>
                <Text style={styles.infoValue}>{new Date().toLocaleString()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Lock Type</Text>
                <Badge
                  variant={lockReason === 'admin-lock' ? 'destructive' : 'secondary'}
                  style={styles.badge}
                >
                  {lockReason === 'failed-attempts' && 'Automatic'}
                  {lockReason === 'security-breach' && 'Security'}
                  {lockReason === 'admin-lock' && 'Administrative'}
                </Badge>
              </View>
              {lockReason === 'failed-attempts' && (
                <>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Failed Attempts</Text>
                    <Text style={styles.infoValue}>{attemptsCount}/5</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Auto-Unlock</Text>
                    <View style={styles.row}>
                      <Text style={styles.clockIcon}>⏰</Text>
                      <Text style={styles.infoValue}>30 minutes</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {lockReason === 'security-breach' && (
              <View style={styles.securityAlert}>
                <Text style={styles.securityAlertText}>
                  <Text style={styles.bold}>Security Alert:</Text> Suspicious activity detected
                  on your account. Please contact your administrator immediately for account
                  review.
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Recovery Options */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recovery Options</Text>
          </View>
          <View style={styles.cardContent}>
            {lockReason === 'failed-attempts' && (
              <>
                <View style={styles.recoveryOption}>
                  <View style={styles.recoveryHeader}>
                    <View style={styles.row}>
                      <Text style={styles.keyIcon}>🔑</Text>
                      <Text style={styles.recoveryLabel}>Use Backup Code</Text>
                    </View>
                    <Button
                      variant="outline"
                      onPress={() => setShowBackupCodeEntry(!showBackupCodeEntry)}
                      style={styles.smallButton}
                    >
                      {showBackupCodeEntry ? 'Cancel' : 'Use Code'}
                    </Button>
                  </View>

                  {showBackupCodeEntry && (
                    <View style={styles.backupCodeContainer}>
                      <Text style={styles.inputLabel}>Enter 8-digit backup code:</Text>
                      <Input
                        value={backupCode}
                        onChangeText={(text) =>
                          setBackupCode(text.replace(/\D/g, '').slice(0, 8))
                        }
                        placeholder="12345678"
                        keyboardType="numeric"
                        maxLength={8}
                        style={styles.backupCodeInput}
                      />
                      <Button
                        onPress={handleBackupCodeSubmit}
                        disabled={backupCode.length !== 8}
                        style={styles.submitButton}
                      >
                        Unlock Account
                      </Button>
                      <Text style={styles.helpText}>
                        Backup codes are provided during initial account setup. Each code can only
                        be used once.
                      </Text>
                    </View>
                  )}
                </View>

                <Separator style={styles.separator} />
              </>
            )}

            {/* Admin Contact */}
            <View style={styles.recoveryOption}>
              <View style={styles.recoveryHeader}>
                <View style={styles.row}>
                  <Text style={styles.userIcon}>👤</Text>
                  <Text style={styles.recoveryLabel}>Contact Administrator</Text>
                </View>
                <Button
                  variant="outline"
                  onPress={handleContactAdmin}
                  disabled={adminContactSent}
                  style={styles.smallButton}
                >
                  {adminContactSent ? 'Request Sent' : 'Contact'}
                </Button>
              </View>

              {adminContactSent && (
                <View style={styles.successAlert}>
                  <Text style={styles.successText}>
                    <Text style={styles.bold}>Request Sent:</Text> Administrator has been notified
                    of your account lock. You will receive an email when your account is reviewed.
                  </Text>
                </View>
              )}

              <View style={styles.contactInfo}>
                <Text style={styles.contactHeader}>For immediate assistance:</Text>
                <TouchableOpacity
                  onPress={() => handleCall('5551234567')}
                  style={styles.contactRow}
                >
                  <Text style={styles.phoneIcon}>📞</Text>
                  <Text style={styles.contactText}>IT Helpdesk: (555) 123-4567</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEmail('security@neurolock.com')}
                  style={styles.contactRow}
                >
                  <Text style={styles.mailIcon}>✉️</Text>
                  <Text style={styles.contactText}>security@neurolock.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Lost Device Option */}
        {lockReason === 'failed-attempts' && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Lost Device?</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.description}>
                If you've lost access to your MFA device, you can register a new device.
              </Text>
              <Button
                variant="outline"
                onPress={() => navigation.navigate('DeviceRegistrationNew' as never)}
                style={styles.fullWidthButton}
              >
                <Text style={styles.shieldIcon}>🛡️</Text>
                Register New Device
              </Button>
            </View>
          </Card>
        )}

        {/* Prevention Tips */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Security Tips</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.tipText}>• Store backup codes in a secure location</Text>
            <Text style={styles.tipText}>• Use a password manager for secure passwords</Text>
            <Text style={styles.tipText}>• Enable multiple MFA methods when available</Text>
            <Text style={styles.tipText}>• Report suspicious activity immediately</Text>
            <Text style={styles.tipText}>• Keep your contact information updated</Text>
          </View>
        </Card>

        {/* Back to Welcome */}
        <Button
          variant="outline"
          onPress={() => navigation.navigate('WelcomeNew' as never)}
          style={styles.backToWelcomeButton}
        >
          Return to Welcome
        </Button>
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
  lockIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardContent: {
    gap: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  securityAlert: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    marginTop: 8,
  },
  securityAlertText: {
    fontSize: 14,
    color: '#991b1b',
  },
  bold: {
    fontWeight: '600',
  },
  recoveryOption: {
    gap: 12,
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  userIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recoveryLabel: {
    fontSize: 16,
    color: '#111827',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backupCodeContainer: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
  },
  backupCodeInput: {
    textAlign: 'center',
    letterSpacing: 4,
  },
  submitButton: {
    width: '100%',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
  },
  separator: {
    marginVertical: 8,
  },
  successAlert: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
  },
  contactInfo: {
    gap: 8,
    marginTop: 8,
  },
  contactHeader: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  phoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  mailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  fullWidthButton: {
    width: '100%',
  },
  shieldIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  backToWelcomeButton: {
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
  },
});
