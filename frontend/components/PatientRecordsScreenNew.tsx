import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Input } from './ui/input.native';
import { Button } from './ui/button.native';

interface PatientRecordsScreenNewProps {
  navigation: any;
  route: any;
}

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  status: string;
  priority: string;
}

export function PatientRecordsScreenNew({ navigation, route }: PatientRecordsScreenNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-001' };

  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Mock patient data
  const patients: Patient[] = [
    {
      id: 'P001',
      name: 'Anonymous Patient A',
      lastVisit: '2024-10-01',
      status: 'Active',
      priority: 'High',
    },
    {
      id: 'P002',
      name: 'Anonymous Patient B',
      lastVisit: '2024-09-28',
      status: 'Follow-up',
      priority: 'Medium',
    },
    {
      id: 'P003',
      name: 'Anonymous Patient C',
      lastVisit: '2024-09-25',
      status: 'Inactive',
      priority: 'Low',
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Active') return 'default';
    if (status === 'Follow-up') return 'secondary';
    return 'outline';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return '#ef4444';
    if (priority === 'Medium') return '#f59e0b';
    return '#10b981';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.headerTitle}>NeuroLock</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('WelcomeNew')}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerBottom}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.staffIdText}>{staffId}</Text>
          </View>
          <Badge variant="outline">
            <Text style={styles.badgeText}>Logged In</Text>
          </Badge>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search and Actions */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search patients by ID or name..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon="🔍"
            style={styles.searchInput}
          />

          <Button variant="outline" style={styles.newPatientButton}>
            <Text style={styles.newPatientButtonText}>➕ New Patient Record</Text>
          </Button>
        </View>

        {/* Patient List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>
            Patient Records ({filteredPatients.length})
          </Text>

          {filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              onPress={() =>
                navigation.navigate('PatientProfileNew', {
                  patientId: patient.id,
                  staffId,
                  role: 'psychiatrist',
                })
              }
              activeOpacity={0.7}
            >
              <Card style={styles.patientCard}>
                <CardHeader style={styles.patientCardHeader}>
                  <View style={styles.patientCardTitleRow}>
                    <View style={styles.patientNameRow}>
                      <Text style={styles.patientIcon}>👤</Text>
                      <CardTitle style={styles.patientName}>{patient.name}</CardTitle>
                    </View>
                    <Badge variant={getStatusBadgeVariant(patient.status)}>
                      <Text style={styles.statusBadgeText}>{patient.status}</Text>
                    </Badge>
                  </View>
                </CardHeader>
                <CardContent>
                  <View style={styles.patientDetails}>
                    <View>
                      <Text style={styles.patientDetailLabel}>ID: {patient.id}</Text>
                      <Text style={styles.patientDetailLabel}>
                        Last Visit: {patient.lastVisit}
                      </Text>
                    </View>
                    <View style={styles.priorityContainer}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(patient.priority) },
                        ]}
                      />
                      <Text style={styles.priorityText}>{patient.priority}</Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}

          {filteredPatients.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyText}>No patients found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Security Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>Secure Session</Text>
        </View>
        <Text style={styles.footerText}>HIPAA Compliant</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  logoutIcon: {
    fontSize: 20,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  staffIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  newPatientButton: {
    width: '100%',
  },
  newPatientButtonText: {
    fontSize: 14,
  },
  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  patientCard: {
    marginBottom: 12,
  },
  patientCardHeader: {
    paddingBottom: 8,
  },
  patientCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadgeText: {
    fontSize: 12,
  },
  patientDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
