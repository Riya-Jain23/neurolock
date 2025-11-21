import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './context/LanguageContext';

import { WelcomeScreenNew } from "./components/WelcomeScreenNew";
import { LoginScreenNew } from "./components/LoginScreenNew";
import { MFASelectionScreenNew } from "./components/MFASelectionScreenNew";
import { OTPVerificationScreenNew } from "./components/OTPVerificationScreenNew";
import { BiometricScreenNew } from "./components/BiometricScreenNew";
import { RoleSelectionScreenNew } from "./components/RoleSelectionScreenNew";
import { PsychiatristDashboardNew } from './components/PsychiatristDashboardNew';
import { PsychologistDashboardNew } from './components/PsychologistDashboardNew';
import { TherapistDashboardNew } from './components/TherapistDashboardNew';
import { NurseDashboardNew } from './components/NurseDashboardNew';
import { AdminDashboardNew } from './components/AdminDashboardNew';
import { PatientListScreenNew } from './components/PatientListScreenNew';
import { PatientProfileScreenNew } from './components/PatientProfileScreenNew';
import { PatientRecordsScreenNew } from './components/PatientRecordsScreenNew';
import { TherapyNotesScreenNew } from './components/TherapyNotesScreenNew';
import { SecureNoteEditorNew } from './components/SecureNoteEditorNew';
import { StaffActivityLogsScreenNew } from './components/StaffActivityLogsScreenNew';
import { SecurityAlertsScreenNew } from './components/SecurityAlertsScreenNew';
import { SettingsScreenNew } from './components/SettingsScreenNew';
import { HelpScreenNew } from './components/HelpScreenNew';
import { BackupCodesScreenNew } from './components/BackupCodesScreenNew';
import AccountLockedScreenNew from './components/AccountLockedScreenNew';
import DeviceRegistrationScreenNew from './components/DeviceRegistrationScreenNew';
import OfflineModeScreenNew from './components/OfflineModeScreenNew';
import ReAuthenticationPromptNew from './components/ReAuthenticationPromptNew';
import ForgotPasswordScreenNew from './components/ForgotPasswordScreenNew';
import { TherapyNoteDetailScreen } from './components/TherapyNoteDetailScreen';
import { AssessmentDetailScreen } from './components/AssessmentDetailScreen';
import { ToastProvider } from './components/ui';
import { MultiFactorAuth } from './components/MultiFactorAuth';
import { SMSVerification } from './components/SMSVerification';
import { EmailVerification } from './components/EmailVerification';
import { SecurityKeySetup } from './components/SecurityKeySetup';
import { View } from 'react-native';

// Legacy redirect screen: forwards old 'OTPVerification' navigation to the new screens
function LegacyOTPRedirect({ navigation, route }: any) {
  useEffect(() => {
    const params = route?.params || {};
    // If a 'channel' param exists, forward to Email or SMS verification
    if (params.channel === 'email') {
      navigation.replace('EmailVerification', { email: params.email ?? '' });
    } else if (params.channel === 'sms') {
      navigation.replace('SMSVerification', { phone: params.phone ?? '' });
    } else {
      // default to the modern OTP screen if present
      navigation.replace('OTPVerificationNew', params);
    }
  }, []);

  return <View />;
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <PaperProvider>
            <ToastProvider>
              <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator 
                initialRouteName="WelcomeNew"
                screenOptions={{
                  headerShown: false,
                }}
              >
              <Stack.Screen name="WelcomeNew" component={WelcomeScreenNew} />
              <Stack.Screen name="MultiFactorAuth" component={MultiFactorAuth} />
              {/* Legacy compatibility: previous code used 'OTPVerification' */}
              <Stack.Screen name="OTPVerification" component={LegacyOTPRedirect} />
              <Stack.Screen name="SMSVerification" component={SMSVerification} />
              <Stack.Screen name="EmailVerification" component={EmailVerification} />
              <Stack.Screen name="SecurityKeySetup" component={SecurityKeySetup} />
              <Stack.Screen name="ContactEntry" component={require('./components/ContactEntry').ContactEntry} />
              <Stack.Screen name="LoginNew" component={LoginScreenNew} />
              <Stack.Screen name="MFASelectionNew" component={MFASelectionScreenNew} />
              <Stack.Screen name="OTPVerificationNew" component={OTPVerificationScreenNew} />
              <Stack.Screen name="BiometricNew" component={BiometricScreenNew} />
              <Stack.Screen name="RoleSelectionNew" component={RoleSelectionScreenNew} />
              <Stack.Screen name="PsychiatristDashboardNew" component={PsychiatristDashboardNew} />
              <Stack.Screen name="PsychologistDashboardNew" component={PsychologistDashboardNew} />
              <Stack.Screen name="TherapistDashboardNew" component={TherapistDashboardNew} />
              <Stack.Screen name="NurseDashboardNew" component={NurseDashboardNew} />
              <Stack.Screen name="AdminDashboardNew" component={AdminDashboardNew} />
              <Stack.Screen name="PatientListNew" component={PatientListScreenNew} />
              <Stack.Screen name="PatientProfileNew" component={PatientProfileScreenNew} />
              <Stack.Screen name="PatientRecordsNew" component={PatientRecordsScreenNew} />
              <Stack.Screen name="TherapyNotesNew" component={TherapyNotesScreenNew} />
              <Stack.Screen name="SecureNoteEditorNew" component={SecureNoteEditorNew} />
              <Stack.Screen name="StaffActivityLogsNew" component={StaffActivityLogsScreenNew} />
              <Stack.Screen name="SecurityAlertsNew" component={SecurityAlertsScreenNew} />
              <Stack.Screen name="SettingsNew" component={SettingsScreenNew} />
              <Stack.Screen name="HelpNew" component={HelpScreenNew} />
              <Stack.Screen name="BackupCodesNew" component={BackupCodesScreenNew} />
              <Stack.Screen name="AccountLockedNew" component={AccountLockedScreenNew} />
              <Stack.Screen name="DeviceRegistrationNew" component={DeviceRegistrationScreenNew} />
              <Stack.Screen name="OfflineModeNew" component={OfflineModeScreenNew} />
              <Stack.Screen name="ReAuthenticationPromptNew" component={ReAuthenticationPromptNew} />
              <Stack.Screen name="ForgotPasswordNew" component={ForgotPasswordScreenNew} />
              <Stack.Screen name="TherapyNoteDetail" component={TherapyNoteDetailScreen} />
              <Stack.Screen name="AssessmentDetail" component={AssessmentDetailScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaView>
    </SafeAreaProvider>
    </LanguageProvider>
  );
}