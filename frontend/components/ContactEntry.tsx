import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { Input, Button } from './ui';

interface ContactEntryProps {
  navigation: any;
  route?: any;
}

export function ContactEntry({ navigation, route }: ContactEntryProps) {
  const method = route?.params?.method ?? 'email';
  const [value, setValue] = useState('');

  const handleContinue = () => {
    if (!value.trim()) {
      Alert.alert('Required', `Please enter your ${method}`);
      return;
    }

    if (method === 'sms') {
      navigation.navigate('SMSVerification', { phone: value });
    } else {
      navigation.navigate('EmailVerification', { email: value });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconButton icon="arrow-left" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Enter {method === 'sms' ? 'phone number' : 'email address'}</Text>
          <Text style={styles.subtitle}>We will send a verification code to this {method === 'sms' ? 'phone' : 'email'}.</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Input
          label={method === 'sms' ? 'Phone number' : 'Email address'}
          placeholder={method === 'sms' ? '+1 555 555 5555' : 'you@example.com'}
          value={value}
          onChangeText={setValue}
          keyboardType={method === 'sms' ? 'phone-pad' : 'email-address'}
          containerStyle={styles.input}
        />

        <Button onPress={handleContinue} style={styles.continueButton}>
          Continue
        </Button>
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
  continueButton: { marginTop: 8 },
});
