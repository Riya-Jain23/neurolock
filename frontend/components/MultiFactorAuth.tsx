import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { Button, Badge } from './ui';

interface MultiFactorAuthProps {
  navigation: any;
}

export function MultiFactorAuth({ navigation }: MultiFactorAuthProps) {
  const selectMethod = (method: string) => {
    console.log('[MultiFactorAuth] selectMethod called with:', method);
    try {
      switch (method) {
        case 'authenticator':
          console.log('[MultiFactorAuth] navigating to AuthenticatorSetup');
          navigation.navigate('AuthenticatorSetup', { from: 'MFA' });
          break;
        case 'sms':
          console.log('[MultiFactorAuth] navigating to SMS flow');
          // if you have a phone in params/context pass it, otherwise ask the user
          navigation.navigate('ContactEntry', { method: 'sms' });
          break;
        case 'email':
          console.log('[MultiFactorAuth] navigating to Email flow');
          navigation.navigate('ContactEntry', { method: 'email' });
          break;
        case 'webauthn':
          console.log('[MultiFactorAuth] navigating to SecurityKeySetup');
          navigation.navigate('SecurityKeySetup');
          break;
        case 'biometric':
          console.log('[MultiFactorAuth] navigating to BiometricSetup');
          navigation.navigate('BiometricSetup');
          break;
        default:
          console.warn('[MultiFactorAuth] unknown method:', method);
          break;
      }
    } catch (err) {
      // Log error so Metro/device console shows the stack trace
      console.error('[MultiFactorAuth] navigation error:', err);
      throw err;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Multi-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Add an extra layer of security to your account. Choose one or more methods to enable.
        </Text>

        <View style={styles.methodList}>
          <TouchableOpacity style={styles.methodCard} onPress={() => selectMethod('authenticator')}>
            <View style={styles.row}>
              <IconButton icon="qrcode-scan" size={28} iconColor="#2563eb" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>Authenticator App</Text>
                <Text style={styles.methodDesc}>Use Google Authenticator, Authy or similar for TOTP codes.</Text>
              </View>
            </View>
            <Badge variant="default" style={styles.badge}>Recommended</Badge>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={() => selectMethod('sms')}>
            <View style={styles.row}>
              <IconButton icon="cellphone" size={28} iconColor="#10b981" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>SMS One-Time Password</Text>
                <Text style={styles.methodDesc}>Receive a code via text message to your phone.</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={() => selectMethod('email')}>
            <View style={styles.row}>
              <IconButton icon="email" size={28} iconColor="#f59e0b" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>Email One-Time Password</Text>
                <Text style={styles.methodDesc}>Receive a code at your registered email address.</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={() => selectMethod('webauthn')}>
            <View style={styles.row}>
              <IconButton icon="key" size={28} iconColor="#7c3aed" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>Security Key (WebAuthn)</Text>
                <Text style={styles.methodDesc}>Use a hardware security key (YubiKey or similar).</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodCard} onPress={() => selectMethod('biometric')}>
            <View style={styles.row}>
              <IconButton icon="fingerprint" size={28} iconColor="#ef4444" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>Biometric</Text>
                <Text style={styles.methodDesc}>Use device fingerprint/face unlock for quick authentication.</Text>
              </View>
            </View>
            <Badge variant="success" style={styles.badge}>Device-only</Badge>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button onPress={() => navigation.goBack()} style={styles.outlineBtn} variant="outline">
            Back
          </Button>
          <Button onPress={() => navigation.navigate('MFAHelp')} style={styles.primaryBtn}>
            Learn more
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  methodList: { gap: 12 },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  methodText: { marginLeft: 8, flex: 1 },
  methodTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  methodDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badge: { marginLeft: 12 },
  actions: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  primaryBtn: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 8,
  },
});