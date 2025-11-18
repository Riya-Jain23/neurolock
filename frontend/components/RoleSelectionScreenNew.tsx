import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Button } from './ui/button.native';

interface RoleSelectionScreenNewProps {
  navigation: any;
  route: any;
}

interface Role {
  id: string;
  title: string;
  description: string;
  icon: string;
  permissions: string[];
  screen: string;
}

export function RoleSelectionScreenNew({ navigation, route }: RoleSelectionScreenNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-001' };

  const roles: Role[] = [
    {
      id: 'psychiatrist',
      title: 'Psychiatrist',
      description: 'Full access to medical records, prescriptions, and therapy notes',
      icon: '🩺',
      permissions: ['Medical Records', 'Prescriptions', 'Therapy Notes', 'Reports'],
      screen: 'PsychiatristDashboardNew',
    },
    {
      id: 'psychologist',
      title: 'Psychologist',
      description: 'Access to therapy records and assessments (no prescriptions)',
      icon: '🧠',
      permissions: ['Therapy Notes', 'Assessments', 'Patient History'],
      screen: 'PsychologistDashboardNew',
    },
    {
      id: 'therapist',
      title: 'Therapist',
      description: 'Access to session logs and progress tracking only',
      icon: '❤️',
      permissions: ['Session Logs', 'Progress Notes', 'Client Updates'],
      screen: 'TherapistDashboardNew',
    },
    {
      id: 'nurse',
      title: 'Nurse',
      description: 'Medication schedules and patient alerts',
      icon: '👨‍⚕️',
      permissions: ['Medication Schedule', 'Patient Alerts', 'Basic Records'],
      screen: 'NurseDashboardNew',
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Staff management and system administration',
      icon: '🛡️',
      permissions: ['Staff Accounts', 'Role Assignment', 'Audit Logs', 'Security Reports'],
      screen: 'AdminDashboardNew',
    },
  ];

  const handleRoleSelect = (role: Role) => {
    // Navigate to the appropriate dashboard
    navigation.navigate(role.screen, {
      staffId,
      role: role.id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('WelcomeNew')}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Role</Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfoCard}>
          <Text style={styles.userInfoLabel}>Authenticated as:</Text>
          <Text style={styles.userInfoValue}>{staffId}</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instructionsTitle}>Choose your role to continue:</Text>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.7}
            >
              <Card style={styles.roleCard}>
                <CardHeader style={styles.roleCardHeader}>
                  <View style={styles.roleTitleRow}>
                    <Text style={styles.roleIcon}>{role.icon}</Text>
                    <CardTitle style={styles.roleTitle}>{role.title}</CardTitle>
                  </View>
                </CardHeader>
                <CardContent style={styles.roleCardContent}>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                  <View style={styles.permissionsContainer}>
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" style={styles.permissionBadge}>
                        <Text style={styles.permissionText}>{permission}</Text>
                      </Badge>
                    ))}
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>
            💡 Demo: Select any role to see role-specific dashboard
          </Text>
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
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  userInfoCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 24,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  rolesContainer: {
    marginBottom: 24,
  },
  roleCard: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  roleCardHeader: {
    paddingBottom: 8,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  roleCardContent: {
    paddingTop: 0,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 12,
    color: '#4b5563',
  },
  demoNotice: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 24,
  },
  demoNoticeText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
