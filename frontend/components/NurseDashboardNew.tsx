import React, { useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Alert } from './ui/alert.native';
import { Input } from './ui/input.native';

interface NurseDashboardNewProps {
  navigation: any;
  route: any;
}

interface Patient {
  id: string;
  name: string;
  room: string;
  heartRate: number;
  bloodPressure: string;
  lastChecked: string;
}

interface Medication {
  id: string;
  patient: string;
  medication: string;
  dosage: string;
  time: string;
  status: string;
}

interface AlertItem {
  id: string;
  patient: string;
  message: string;
  priority: string;
  time: string;
}

export function NurseDashboardNew({ navigation, route }: NurseDashboardNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-004' };
  const [searchTerm, setSearchTerm] = useState('');

  const patients: Patient[] = [
    {
      id: 'P001',
      name: 'Patient A',
      room: '101',
      heartRate: 72,
      bloodPressure: '120/80',
      lastChecked: '10:30 AM',
    },
    {
      id: 'P002',
      name: 'Patient B',
      room: '102',
      heartRate: 68,
      bloodPressure: '118/76',
      lastChecked: '11:00 AM',
    },
    {
      id: 'P003',
      name: 'Patient C',
      room: '103',
      heartRate: 75,
      bloodPressure: '122/82',
      lastChecked: '9:45 AM',
    },
  ];

  const medications: Medication[] = [
    {
      id: 'M001',
      patient: 'Patient A',
      medication: 'Sertraline',
      dosage: '50mg',
      time: '08:00 AM',
      status: 'Administered',
    },
    {
      id: 'M002',
      patient: 'Patient B',
      medication: 'Risperidone',
      dosage: '2mg',
      time: '12:00 PM',
      status: 'Pending',
    },
    {
      id: 'M003',
      patient: 'Patient C',
      medication: 'Lorazepam',
      dosage: '1mg',
      time: '02:00 PM',
      status: 'Scheduled',
    },
    {
      id: 'M004',
      patient: 'Patient A',
      medication: 'Vitamin D',
      dosage: '1000 IU',
      time: '08:00 PM',
      status: 'Scheduled',
    },
  ];

  const alerts: AlertItem[] = [
    {
      id: 'A001',
      patient: 'Patient B',
      message: 'Medication refill needed',
      priority: 'High',
      time: '10:15 AM',
    },
    {
      id: 'A002',
      patient: 'Patient A',
      message: 'Scheduled vitals check',
      priority: 'Medium',
      time: '11:30 AM',
    },
    {
      id: 'A003',
      patient: 'Patient C',
      message: 'Review lab results',
      priority: 'Low',
      time: '02:00 PM',
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const medicationStats = {
    administered: medications.filter((m) => m.status === 'Administered').length,
    pending: medications.filter((m) => m.status === 'Pending').length,
    scheduled: medications.filter((m) => m.status === 'Scheduled').length,
  };

  const alertStats = {
    high: alerts.filter((a) => a.priority === 'High').length,
    medium: alerts.filter((a) => a.priority === 'Medium').length,
    low: alerts.filter((a) => a.priority === 'Low').length,
  };

  const getMedicationStatusBadge = (status: string) => {
    if (status === 'Administered') return 'default';
    if (status === 'Pending') return 'secondary';
    return 'outline';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    if (priority === 'High') return 'destructive';
    if (priority === 'Medium') return 'secondary';
    return 'outline';
  };

  const getPriorityDotColor = (priority: string) => {
    if (priority === 'High') return '#ef4444';
    if (priority === 'Medium') return '#f59e0b';
    return '#10b981';
  };

  const highPriorityAlerts = alerts.filter((a) => a.priority === 'High');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>🏥</Text>
              <Text style={styles.headerTitle}>Nurse Dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WelcomeNew')}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>{staffId}</Text>
        </View>

        {/* High Priority Alerts */}
        {highPriorityAlerts.length > 0 && (
          <Alert
            variant="destructive"
            title="⚠️ High Priority Alerts"
            description={`${highPriorityAlerts.length} urgent items require attention`}
            style={styles.highPriorityAlert}
          />
        )}

        {/* Access Restrictions Notice */}
        <Alert
          variant="default"
          title="Access Level: Nurse"
          description="Limited to medication schedules and basic patient information. No therapy notes access."
          style={styles.accessAlert}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="patients" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="patients">
              <Text>Patients</Text>
            </TabsTrigger>
            <TabsTrigger value="medications">
              <Text>Medications</Text>
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Text>Alerts</Text>
            </TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Patient List</Text>
            </View>

            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              leftIcon="🔍"
              style={styles.searchInput}
            />

            <View style={styles.patientList}>
              {filteredPatients.map((patient) => (
                <TouchableOpacity key={patient.id} activeOpacity={0.7}>
                  <Card style={styles.patientCard}>
                    <CardHeader style={styles.patientCardHeader}>
                      <View style={styles.patientCardTitleRow}>
                        <CardTitle>{patient.name}</CardTitle>
                        <Badge variant="outline">
                          <Text style={styles.badgeText}>Room {patient.room}</Text>
                        </Badge>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <View style={styles.vitalsGrid}>
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>❤️ Heart Rate</Text>
                          <Text style={styles.vitalValue}>{patient.heartRate} bpm</Text>
                        </View>
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>🩸 Blood Pressure</Text>
                          <Text style={styles.vitalValue}>{patient.bloodPressure}</Text>
                        </View>
                      </View>
                      <View style={styles.lastChecked}>
                        <Text style={styles.lastCheckedText}>
                          Last checked: {patient.lastChecked}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </TabsContent>

          {/* Medication Schedule Tab */}
          <TabsContent value="medications">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Medication Schedule</Text>
            </View>

            {/* Medication Summary */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>{medicationStats.administered}</Text>
                  <Text style={styles.statLabel}>Administered</Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>{medicationStats.pending}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>{medicationStats.scheduled}</Text>
                  <Text style={styles.statLabel}>Scheduled</Text>
                </CardContent>
              </Card>
            </View>

            {/* Medication List */}
            <View style={styles.medicationList}>
              {medications.map((med) => (
                <TouchableOpacity key={med.id} activeOpacity={0.7}>
                  <Card style={styles.medicationCard}>
                    <CardContent>
                      <View style={styles.medicationHeader}>
                        <Text style={styles.medicationName}>{med.medication}</Text>
                        <Badge variant={getMedicationStatusBadge(med.status)}>
                          <Text style={styles.badgeText}>{med.status}</Text>
                        </Badge>
                      </View>

                      <View style={styles.medicationDetails}>
                        <View style={styles.medicationDetailRow}>
                          <Text style={styles.medicationDetailLabel}>Patient:</Text>
                          <Text style={styles.medicationDetailValue}>{med.patient}</Text>
                        </View>
                        <View style={styles.medicationDetailRow}>
                          <Text style={styles.medicationDetailLabel}>Dosage:</Text>
                          <Text style={styles.medicationDetailValue}>{med.dosage}</Text>
                        </View>
                        <View style={styles.medicationDetailRow}>
                          <Text style={styles.medicationDetailLabel}>Time:</Text>
                          <Text style={styles.medicationDetailValue}>{med.time}</Text>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Patient Alerts</Text>
            </View>

            {/* Alert Summary */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>
                    {alertStats.high}
                  </Text>
                  <Text style={styles.statLabel}>High Priority</Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                    {alertStats.medium}
                  </Text>
                  <Text style={styles.statLabel}>Medium</Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={[styles.statValue, { color: '#10b981' }]}>
                    {alertStats.low}
                  </Text>
                  <Text style={styles.statLabel}>Low Priority</Text>
                </CardContent>
              </Card>
            </View>

            {/* Alert List */}
            <View style={styles.alertList}>
              {alerts.map((alert) => (
                <TouchableOpacity key={alert.id} activeOpacity={0.7}>
                  <Card style={styles.alertCard}>
                    <CardContent>
                      <View style={styles.alertHeader}>
                        <View style={styles.alertHeaderLeft}>
                          <View
                            style={[
                              styles.priorityDot,
                              { backgroundColor: getPriorityDotColor(alert.priority) },
                            ]}
                          />
                          <Text style={styles.alertPatient}>{alert.patient}</Text>
                        </View>
                        <Badge variant={getPriorityBadgeVariant(alert.priority)}>
                          <Text style={styles.badgeText}>{alert.priority}</Text>
                        </Badge>
                      </View>

                      <Text style={styles.alertMessage}>{alert.message}</Text>

                      <View style={styles.alertFooter}>
                        <Text style={styles.alertTime}>⏰ {alert.time}</Text>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </TabsContent>
        </Tabs>
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
  headerIcon: {
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  highPriorityAlert: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  accessAlert: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tabs: {
    padding: 16,
  },
  tabHeader: {
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  searchInput: {
    marginBottom: 16,
  },
  patientList: {
    gap: 12,
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
  badgeText: {
    fontSize: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  vitalItem: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  lastChecked: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lastCheckedText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  medicationList: {
    gap: 12,
  },
  medicationCard: {
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  medicationDetails: {
    gap: 8,
  },
  medicationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicationDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  medicationDetailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  alertList: {
    gap: 12,
  },
  alertCard: {
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  alertPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  alertFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});
