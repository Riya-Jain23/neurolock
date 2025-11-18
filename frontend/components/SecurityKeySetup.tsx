import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { Button } from './ui';

interface SecurityKeySetupProps {
  navigation: any;
}

export function SecurityKeySetup({ navigation }: SecurityKeySetupProps) {
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    // This is a mock; implement WebAuthn / platform-authenticator registration here
    setTimeout(() => {
      setRegistering(false);
      Alert.alert('Registered', 'Security key registered successfully (mock)');
      navigation.navigate('RoleSelectionNew');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconButton icon="arrow-left" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Register Security Key</Text>
          <Text style={styles.subtitle}>Use a hardware key (YubiKey) or platform authenticator.</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.body}>Follow the instructions to register your security key with this device.</Text>

        <Button onPress={handleRegister} loading={registering} style={styles.registerButton}>
          Register security key
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
  body: { fontSize: 14, color: '#334155', marginBottom: 16 },
  registerButton: { marginTop: 12 },
});
