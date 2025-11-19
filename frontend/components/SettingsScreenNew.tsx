import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Button } from './ui/button.native';
import { Menu } from 'react-native-paper';
import { useToast } from './ui';

interface SettingsScreenNewProps {
  navigation: any;
  route: any;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  lastUsed: string;
  trusted: boolean;
  current: boolean;
}

export function SettingsScreenNew({ navigation, route }: SettingsScreenNewProps) {
  const { staffId, userRole } = route.params || { staffId: 'STAFF-001', userRole: 'psychiatrist' };
  const { showToast } = useToast();

  // MFA Settings
  const [preferredMFAVisible, setPreferredMFAVisible] = useState(false);
  const [preferredMFA, setPreferredMFA] = useState('authenticator');
  const [backupMFAEnabled, setBackupMFAEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);

  // Localization Settings
  const [languageVisible, setLanguageVisible] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezoneVisible, setTimezoneVisible] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormatVisible, setDateFormatVisible] = useState(false);
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  // Security Settings
  const [autoLockVisible, setAutoLockVisible] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState('15');
  const [deviceTrust, setDeviceTrust] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const connectedDevices: ConnectedDevice[] = [
    {
      id: 'DEV001',
      name: 'iPhone 13 Pro',
      type: 'smartphone',
      lastUsed: '2024-10-02 14:30',
      trusted: true,
      current: true,
    },
    {
      id: 'DEV002',
      name: 'Work Laptop',
      type: 'desktop',
      lastUsed: '2024-10-02 09:15',
      trusted: true,
      current: false,
    },
    {
      id: 'DEV003',
      name: 'iPad Air',
      type: 'tablet',
      lastUsed: '2024-09-30 16:45',
      trusted: false,
      current: false,
    },
  ];

  const handleSaveSettings = () => {
    showToast('Settings saved successfully');
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
        return '🔐';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>
          </View>
          <View style={styles.headerBottom}>
            <Text style={styles.headerSubtitle}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} • {staffId}
            </Text>
            <Badge variant="outline">
              <Text style={styles.badgeText}>⚙️ Preferences</Text>
            </Badge>
          </View>
        </View>

        {/* Settings Tabs */}
        <Tabs defaultValue="security" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="security">
              <Text>Security</Text>
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Text>Devices</Text>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Text>Alerts</Text>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Text>General</Text>
            </TabsTrigger>
          </TabsList>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card style={styles.settingsCard}>
              <CardHeader>
                <CardTitle>🔐 Multi-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Preferred MFA Method</Text>
                  <Menu
                    visible={preferredMFAVisible}
                    onDismiss={() => setPreferredMFAVisible(false)}
                    anchor={
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setPreferredMFAVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectButtonText}>{preferredMFA}</Text>
                        <Text style={styles.selectButtonIcon}>▼</Text>
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setPreferredMFA('authenticator');
                        setPreferredMFAVisible(false);
                      }}
                      title="Authenticator App"
                    />
                    <Menu.Item
                      onPress={() => {
                        setPreferredMFA('sms');
                        setPreferredMFAVisible(false);
                      }}
                      title="SMS"
                    />
                    <Menu.Item
                      onPress={() => {
                        setPreferredMFA('email');
                        setPreferredMFAVisible(false);
                      }}
                      title="Email"
                    />
                    <Menu.Item
                      onPress={() => {
                        setPreferredMFA('biometric');
                        setPreferredMFAVisible(false);
                      }}
                      title="Biometric"
                    />
                  </Menu>
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Backup MFA Methods</Text>
                    <Text style={styles.switchItemDescription}>
                      Allow fallback authentication
                    </Text>
                  </View>
                  <Switch
                    value={backupMFAEnabled}
                    onValueChange={setBackupMFAEnabled}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={backupMFAEnabled ? '#ffffff' : '#f3f4f6'}
                  />
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Biometric Authentication</Text>
                    <Text style={styles.switchItemDescription}>
                      Use fingerprint/face ID when available
                    </Text>
                  </View>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={setBiometricEnabled}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={biometricEnabled ? '#ffffff' : '#f3f4f6'}
                  />
                </View>

                <Button
                  onPress={() => navigation.navigate('BackupCodesNew', { staffId })}
                  variant="outline"
                  style={styles.backupCodesButton}
                >
                  <Text style={styles.backupCodesButtonText}>View Backup Codes</Text>
                </Button>
              </CardContent>
            </Card>

            <Card style={styles.settingsCard}>
              <CardHeader>
                <CardTitle>Session Security</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Auto-lock Timeout</Text>
                  <Menu
                    visible={autoLockVisible}
                    onDismiss={() => setAutoLockVisible(false)}
                    anchor={
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setAutoLockVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectButtonText}>{autoLockTimeout} minutes</Text>
                        <Text style={styles.selectButtonIcon}>▼</Text>
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setAutoLockTimeout('5');
                        setAutoLockVisible(false);
                      }}
                      title="5 minutes"
                    />
                    <Menu.Item
                      onPress={() => {
                        setAutoLockTimeout('15');
                        setAutoLockVisible(false);
                      }}
                      title="15 minutes"
                    />
                    <Menu.Item
                      onPress={() => {
                        setAutoLockTimeout('30');
                        setAutoLockVisible(false);
                      }}
                      title="30 minutes"
                    />
                    <Menu.Item
                      onPress={() => {
                        setAutoLockTimeout('60');
                        setAutoLockVisible(false);
                      }}
                      title="1 hour"
                    />
                  </Menu>
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Remember Trusted Devices</Text>
                    <Text style={styles.switchItemDescription}>
                      Skip MFA on trusted devices for 30 days
                    </Text>
                  </View>
                  <Switch
                    value={deviceTrust}
                    onValueChange={setDeviceTrust}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={deviceTrust ? '#ffffff' : '#f3f4f6'}
                  />
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Login Alerts</Text>
                    <Text style={styles.switchItemDescription}>
                      Notify on new device logins
                    </Text>
                  </View>
                  <Switch
                    value={loginAlerts}
                    onValueChange={setLoginAlerts}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={loginAlerts ? '#ffffff' : '#f3f4f6'}
                  />
                </View>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Management */}
          <TabsContent value="devices">
            <View style={styles.devicesHeader}>
              <Text style={styles.devicesTitle}>Connected Devices</Text>
              <Button
                onPress={() => navigation.navigate('DeviceRegistrationNew')}
                style={styles.addDeviceButton}
              >
                <Text style={styles.addDeviceButtonText}>Add Device</Text>
              </Button>
            </View>

            <View style={styles.devicesList}>
              {connectedDevices.map((device) => (
                <Card key={device.id} style={styles.deviceCard}>
                  <CardContent>
                    <View style={styles.deviceHeader}>
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceIcon}>{getDeviceIcon(device.type)}</Text>
                        <View style={styles.deviceDetails}>
                          <View style={styles.deviceTitleRow}>
                            <Text style={styles.deviceName}>{device.name}</Text>
                            {device.current && (
                              <Badge variant="outline" style={styles.currentBadge}>
                                <Text style={styles.badgeText}>Current</Text>
                              </Badge>
                            )}
                            {device.trusted && (
                              <Badge variant="secondary" style={styles.trustedBadge}>
                                <Text style={styles.badgeText}>Trusted</Text>
                              </Badge>
                            )}
                          </View>
                          <Text style={styles.deviceMeta}>Last used: {device.lastUsed}</Text>
                          <Text style={styles.deviceMeta}>
                            {device.type} • ID: {device.id}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {!device.current && (
                      <View style={styles.deviceActions}>
                        <TouchableOpacity
                          style={styles.deviceActionButton}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.deviceActionButtonText}>
                            {device.trusted ? 'Remove Trust' : 'Trust'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deviceActionButton, styles.deviceActionButtonDanger]}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.deviceActionButtonText, { color: '#ef4444' }]}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </CardContent>
                </Card>
              ))}
            </View>

            <Card style={styles.deviceSecurityCard}>
              <CardHeader>
                <CardTitle>Device Security</CardTitle>
              </CardHeader>
              <CardContent>
                <Text style={styles.securityRuleText}>
                  • Trusted devices skip MFA for 30 days
                </Text>
                <Text style={styles.securityRuleText}>
                  • Removing a device revokes all active sessions
                </Text>
                <Text style={styles.securityRuleText}>
                  • Maximum 5 trusted devices per account
                </Text>
                <Text style={styles.securityRuleText}>
                  • New device registration requires approval
                </Text>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card style={styles.settingsCard}>
              <CardHeader>
                <CardTitle>🔔 Alert Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Email Notifications</Text>
                    <Text style={styles.switchItemDescription}>
                      System updates and important alerts
                    </Text>
                  </View>
                  <Switch
                    value={emailNotifications}
                    onValueChange={setEmailNotifications}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={emailNotifications ? '#ffffff' : '#f3f4f6'}
                  />
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Security Alerts</Text>
                    <Text style={styles.switchItemDescription}>
                      Login attempts and security events
                    </Text>
                  </View>
                  <Switch
                    value={securityAlerts}
                    onValueChange={setSecurityAlerts}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={securityAlerts ? '#ffffff' : '#f3f4f6'}
                  />
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchItemText}>
                    <Text style={styles.switchItemTitle}>Session Reminders</Text>
                    <Text style={styles.switchItemDescription}>
                      Upcoming appointments and deadlines
                    </Text>
                  </View>
                  <Switch
                    value={sessionReminders}
                    onValueChange={setSessionReminders}
                    trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                    thumbColor={sessionReminders ? '#ffffff' : '#f3f4f6'}
                  />
                </View>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Preferences */}
          <TabsContent value="preferences">
            <Card style={styles.settingsCard}>
              <CardHeader>
                <CardTitle>🌐 Localization</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Language</Text>
                  <Menu
                    visible={languageVisible}
                    onDismiss={() => setLanguageVisible(false)}
                    anchor={
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setLanguageVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectButtonText}>{language}</Text>
                        <Text style={styles.selectButtonIcon}>▼</Text>
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setLanguage('en');
                        setLanguageVisible(false);
                      }}
                      title="English"
                    />
                    <Menu.Item
                      onPress={() => {
                        setLanguage('es');
                        setLanguageVisible(false);
                      }}
                      title="Español"
                    />
                    <Menu.Item
                      onPress={() => {
                        setLanguage('fr');
                        setLanguageVisible(false);
                      }}
                      title="Français"
                    />
                  </Menu>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Timezone</Text>
                  <Menu
                    visible={timezoneVisible}
                    onDismiss={() => setTimezoneVisible(false)}
                    anchor={
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setTimezoneVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectButtonText}>{timezone}</Text>
                        <Text style={styles.selectButtonIcon}>▼</Text>
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setTimezone('America/New_York');
                        setTimezoneVisible(false);
                      }}
                      title="Eastern (UTC-5)"
                    />
                    <Menu.Item
                      onPress={() => {
                        setTimezone('America/Chicago');
                        setTimezoneVisible(false);
                      }}
                      title="Central (UTC-6)"
                    />
                  </Menu>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Date Format</Text>
                  <Menu
                    visible={dateFormatVisible}
                    onDismiss={() => setDateFormatVisible(false)}
                    anchor={
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setDateFormatVisible(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectButtonText}>{dateFormat}</Text>
                        <Text style={styles.selectButtonIcon}>▼</Text>
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setDateFormat('MM/DD/YYYY');
                        setDateFormatVisible(false);
                      }}
                      title="MM/DD/YYYY"
                    />
                    <Menu.Item
                      onPress={() => {
                        setDateFormat('DD/MM/YYYY');
                        setDateFormatVisible(false);
                      }}
                      title="DD/MM/YYYY"
                    />
                    <Menu.Item
                      onPress={() => {
                        setDateFormat('YYYY-MM-DD');
                        setDateFormatVisible(false);
                      }}
                      title="YYYY-MM-DD"
                    />
                  </Menu>
                </View>
              </CardContent>
            </Card>

            <Card style={styles.settingsCard}>
              <CardHeader>
                <CardTitle>👤 Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Staff ID</Text>
                    <Text style={styles.infoValue}>{staffId}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={styles.infoValue}>
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Account Created</Text>
                    <Text style={styles.infoValue}>2024-01-15</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Last Login</Text>
                    <Text style={styles.infoValue}>2024-10-02 14:30</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button onPress={handleSaveSettings} variant="default" style={styles.saveButton}>
            <Text style={styles.saveButtonText}>💾 Save Settings</Text>
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
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
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  badgeText: {
    fontSize: 12,
  },
  tabs: {
    padding: 16,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  selectButtonIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchItemText: {
    flex: 1,
    marginRight: 16,
  },
  switchItemTitle: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  switchItemDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  addDeviceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  addDeviceButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  devicesList: {
    marginBottom: 16,
  },
  deviceCard: {
    marginBottom: 12,
  },
  deviceHeader: {
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
  },
  deviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  currentBadge: {
    marginRight: 6,
  },
  trustedBadge: {
    marginRight: 0,
  },
  deviceMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deviceActionButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    alignItems: 'center',
  },
  deviceActionButtonDanger: {
    borderColor: '#fecaca',
  },
  deviceActionButtonText: {
    fontSize: 12,
    color: '#1f2937',
  },
  deviceSecurityCard: {
    marginTop: 8,
  },
  securityRuleText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  saveButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    width: '100%',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  backupCodesButton: {
    marginTop: 16,
    width: '100%',
  },
  backupCodesButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
});
