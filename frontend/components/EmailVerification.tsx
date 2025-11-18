import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { Input, Button } from './ui';

interface EmailVerificationProps {
  navigation: any;
  route?: any;
}

export function EmailVerification({ navigation, route }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const email = route?.params?.email ?? '';

  useEffect(() => {
    // mock send email on mount
    sendCode();
    let timer: any = null;
    if (seconds > 0) {
      timer = setInterval(() => setSeconds((s: number) => s - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const sendCode = () => {
    Alert.alert('Email Sent', `A verification code was sent to ${email || 'your email'}`);
    setSeconds(60);
  };

  const handleResend = () => {
    if (seconds > 0) return;
    sendCode();
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code.trim().length === 6) {
        Alert.alert('Success', 'Email verified');
        navigation.navigate('RoleSelectionNew');
      } else {
        Alert.alert('Error', 'Please enter a valid 6-digit code');
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconButton icon="arrow-left" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>A 6-digit code was sent to {email || 'your email'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Input
          label="Email Code"
          placeholder="123456"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          containerStyle={styles.input}
          leftIcon={<IconButton icon="email" size={20} />}
        />

        <Button onPress={handleVerify} loading={loading} disabled={loading} style={styles.verifyButton}>
          {loading ? <ActivityIndicator color="#fff" /> : <IconButton icon="check" size={20} iconColor="#ffffff" />}
          <Text style={styles.verifyText}>Verify</Text>
        </Button>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't get a code?</Text>
          <TouchableOpacity onPress={handleResend} disabled={seconds > 0} activeOpacity={0.7}>
            <Text style={[styles.resendAction, seconds > 0 && styles.resendDisabled]}>
              {seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerText: { marginLeft: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  input: { marginBottom: 16 },
  verifyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  verifyText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  resendText: { fontSize: 13, color: '#64748b' },
  resendAction: { fontSize: 13, color: '#2563eb', marginLeft: 8 },
  resendDisabled: { color: '#94a3b8' },
});
