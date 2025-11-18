import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from './ui/card.native';
import { Button } from './ui/button.native';
import { Badge } from './ui/badge.native';
import { Alert } from './ui/alert.native';

interface MFASelectionScreenNewProps {
  navigation: any;
  route: any;
}

interface MFAOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  available: boolean;
  colors: string[];
}

export function MFASelectionScreenNew({ navigation, route }: MFASelectionScreenNewProps) {
  const { staffId, skipBiometric } = route.params || { staffId: 'STAFF-001', skipBiometric: false };

  const mfaOptions: MFAOption[] = [
    {
      id: 'sms',
      title: 'SMS Verification',
      description: 'Receive a code via text message',
      icon: '📱',
      available: true,
      colors: ['#3b82f6', '#2563eb'],
    },
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Receive a code via email',
      icon: '✉️',
      available: true,
      colors: ['#a855f7', '#9333ea'],
    },
    {
      id: 'authenticator',
      title: 'Authenticator App',
      description: 'Use your authenticator app',
      icon: '🛡️',
      available: true,
      colors: ['#10b981', '#059669'],
    },
    {
      id: 'biometric',
      title: 'Biometric Scan',
      description: 'Fingerprint or Face ID',
      icon: '👆',
      available: !skipBiometric,
      colors: ['#14b8a6', '#0d9488'],
    },
  ];

  const handleSelectMethod = (methodId: string) => {
    if (methodId === 'biometric') {
      navigation.navigate('BiometricNew', { staffId });
    } else {
      navigation.navigate('OTPVerificationNew', { method: methodId, staffId });
    }
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
            <Text style={styles.headerTitle}>Multi-Factor Authentication</Text>
            <Text style={styles.headerSubtitle}>Additional security layer required</Text>
          </View>
        </View>

        {/* User Info Card */}
        <Card style={styles.userInfoCard}>
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.userInfoGradient}
          >
            <CardContent style={styles.userInfoContent}>
              <View>
                <Text style={styles.userInfoLabel}>Authenticated as</Text>
                <Text style={styles.userInfoValue}>{staffId}</Text>
              </View>
              <View style={styles.lockIconContainer}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            </CardContent>
          </LinearGradient>
        </Card>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Choose Verification Method</Text>
          <Text style={styles.instructionsText}>
            Select your preferred method to complete secure authentication.
          </Text>
        </View>

        {/* Biometric Warning */}
        {skipBiometric && (
          <Alert
            variant="default"
            title="Information"
            description="Biometric was used for login. Please select a different verification method for enhanced security."
            style={styles.warningAlert}
          />
        )}

        {/* MFA Options */}
        <View style={styles.optionsContainer}>
          {mfaOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                !option.available && styles.optionCardDisabled,
              ]}
              onPress={() => option.available && handleSelectMethod(option.id)}
              disabled={!option.available}
              activeOpacity={0.7}
            >
              <Card style={styles.optionCardInner}>
                <CardContent style={styles.optionCardContent}>
                  <LinearGradient
                    colors={option.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionIconContainer}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                  </LinearGradient>
                  <View style={styles.optionTextContainer}>
                    <View style={styles.optionTitleRow}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      {!option.available && (
                        <Badge variant="outline" style={styles.unavailableBadge}>
                          <Text style={styles.unavailableBadgeText}>Unavailable</Text>
                        </Badge>
                      )}
                    </View>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {option.available && <Text style={styles.chevronIcon}>›</Text>}
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Backup Options */}
        <View style={styles.backupOptionsContainer}>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.backupButton}
            onPress={() => navigation.navigate('BackupCodesNew', { staffId })}
            activeOpacity={0.7}
          >
            <Text style={styles.backupButtonText}>Use backup codes instead</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backupButton}
            onPress={() => navigation.navigate('HelpNew')}
            activeOpacity={0.7}
          >
            <Text style={styles.helpButtonText}>Need help with verification?</Text>
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
  userInfoCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfoGradient: {
    borderRadius: 12,
  },
  userInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#e0f2fe',
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  lockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  warningAlert: {
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    marginBottom: 12,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionCardInner: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  unavailableBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unavailableBadgeText: {
    fontSize: 11,
    color: '#6b7280',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  chevronIcon: {
    fontSize: 28,
    color: '#9ca3af',
  },
  backupOptionsContainer: {
    marginTop: 24,
    paddingTop: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  backupButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backupButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  helpButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
