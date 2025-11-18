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
import { Alert } from './ui/alert.native';
import { Separator } from './ui/separator.native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Button } from './ui/button.native';

interface PatientProfileScreenNewProps {
  navigation: any;
  route: any;
}

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  admissionDate: string;
  ward: string;
  room: string;
  status: string;
  priority: string;
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  attendingPhysician: string;
  assignedTherapist: string;
  emergencyContact: string;
  emergencyPhone: string;
  insurance: string;
  allergies: string;
  currentMedications: Array<{
    name: string;
    dose: string;
    frequency: string;
    prescriber: string;
  }>;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    lastChecked: string;
  };
  lastSession: string;
  nextAppointment: string;
}

export function PatientProfileScreenNew({ navigation, route }: PatientProfileScreenNewProps) {
  const { patientId, staffId, role } = route.params || {
    patientId: 'P001',
    staffId: 'STAFF-001',
    role: 'psychiatrist',
  };

  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Mock patient data
  const patient: Patient = {
    id: patientId,
    name: 'Anonymous Patient A',
    dateOfBirth: '1985-03-15',
    age: '39',
    gender: 'Male',
    admissionDate: '2024-09-15',
    ward: 'Ward A',
    room: 'A-101',
    status: 'Active',
    priority: 'High',
    primaryDiagnosis: 'Major Depressive Disorder',
    secondaryDiagnosis: 'Generalized Anxiety Disorder',
    attendingPhysician: 'Dr. Smith',
    assignedTherapist: 'Sarah Wilson',
    emergencyContact: 'John Doe (Brother)',
    emergencyPhone: '••• ••• 1234',
    insurance: 'Blue Cross Blue Shield',
    allergies: 'Penicillin, Latex',
    currentMedications: [
      { name: 'Sertraline', dose: '50mg', frequency: 'Daily', prescriber: 'Dr. Smith' },
      { name: 'Lorazepam', dose: '1mg', frequency: 'As needed', prescriber: 'Dr. Smith' },
    ],
    vitals: {
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      lastChecked: '2024-10-02 08:00',
    },
    lastSession: '2024-10-01 14:00',
    nextAppointment: '2024-10-03 10:00',
  };

  const hasRestrictedAccess = role === 'therapist' || role === 'nurse';
  const canViewMedications = role === 'psychiatrist' || role === 'nurse';
  const canEditNotes = role !== 'nurse';

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Active') return 'default';
    if (status === 'Critical') return 'destructive';
    return 'secondary';
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
            <Text style={styles.headerTitle}>Patient Profile</Text>
            <Text style={styles.headerSubtitle}>
              {role} • {staffId}
            </Text>
          </View>
          <Badge variant="outline" style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{patient.id}</Text>
          </Badge>
        </View>

        {/* Security Warning */}
        <Alert
          variant="destructive"
          title="Security Notice"
          description="This record contains highly sensitive data. Please re-authenticate before accessing therapy notes."
          style={styles.securityAlert}
        />

        {/* Patient Summary */}
        <Card style={styles.summaryCard}>
          <CardHeader>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryTitleRow}>
                <Text style={styles.summaryIcon}>👤</Text>
                <CardTitle style={styles.summaryTitle}>{patient.name}</CardTitle>
              </View>
              <Badge variant={getStatusBadgeVariant(patient.status)}>
                <Text style={styles.badgeText}>{patient.status}</Text>
              </Badge>
            </View>
          </CardHeader>
          <CardContent>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Age</Text>
                <Text style={styles.summaryValue}>{patient.age}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gender</Text>
                <Text style={styles.summaryValue}>{patient.gender}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ward</Text>
                <Text style={styles.summaryValue}>
                  {patient.ward} - {patient.room}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Admission</Text>
                <Text style={styles.summaryValue}>{patient.admissionDate}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="overview">
              <Text>Overview</Text>
            </TabsTrigger>
            <TabsTrigger value="medical">
              <Text>Medical</Text>
            </TabsTrigger>
            <TabsTrigger value="therapy">
              <Text>Therapy</Text>
            </TabsTrigger>
            <TabsTrigger value="notes">
              <Text>Notes</Text>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card style={styles.tabCard}>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.demographicsGrid}>
                  <View style={styles.demographicItem}>
                    <Text style={styles.demographicLabel}>Date of Birth</Text>
                    <Text style={styles.demographicValue}>
                      {showSensitiveData ? patient.dateOfBirth : '••• •• ••••'}
                    </Text>
                  </View>
                  <View style={styles.demographicItem}>
                    <Text style={styles.demographicLabel}>Emergency Contact</Text>
                    <Text style={styles.demographicValue}>
                      {showSensitiveData ? patient.emergencyContact : '•••••••••••'}
                    </Text>
                  </View>
                  <View style={styles.demographicItem}>
                    <Text style={styles.demographicLabel}>Emergency Phone</Text>
                    <Text style={styles.demographicValue}>{patient.emergencyPhone}</Text>
                  </View>
                  <View style={styles.demographicItem}>
                    <Text style={styles.demographicLabel}>Insurance</Text>
                    <Text style={styles.demographicValue}>
                      {showSensitiveData ? patient.insurance : '•••••••••••'}
                    </Text>
                  </View>
                </View>

                <Button
                  variant="outline"
                  onPress={() => setShowSensitiveData(!showSensitiveData)}
                  style={styles.toggleButton}
                >
                  <Text style={styles.toggleButtonText}>
                    👁️ {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
                  </Text>
                </Button>
              </CardContent>
            </Card>

            <Card style={styles.tabCard}>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.statusList}>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Primary Diagnosis</Text>
                    <Text style={styles.statusValue}>{patient.primaryDiagnosis}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Secondary Diagnosis</Text>
                    <Text style={styles.statusValue}>{patient.secondaryDiagnosis}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Attending Physician</Text>
                    <Text style={styles.statusValue}>{patient.attendingPhysician}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Assigned Therapist</Text>
                    <Text style={styles.statusValue}>{patient.assignedTherapist}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Tab */}
          <TabsContent value="medical">
            {canViewMedications ? (
              <View>
                <Card style={styles.tabCard}>
                  <CardHeader>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardHeaderIcon}>💊</Text>
                      <CardTitle>Current Medications</CardTitle>
                    </View>
                  </CardHeader>
                  <CardContent>
                    {patient.currentMedications.map((med, index) => (
                      <View key={index} style={styles.medicationItem}>
                        <View style={styles.medicationHeader}>
                          <View>
                            <Text style={styles.medicationName}>
                              {med.name} {med.dose}
                            </Text>
                            <Text style={styles.medicationFrequency}>{med.frequency}</Text>
                          </View>
                          <Text style={styles.medicationPrescriber}>{med.prescriber}</Text>
                        </View>
                      </View>
                    ))}
                  </CardContent>
                </Card>

                <Card style={styles.tabCard}>
                  <CardHeader>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardHeaderIcon}>📊</Text>
                      <CardTitle>Vital Signs</CardTitle>
                    </View>
                  </CardHeader>
                  <CardContent>
                    <View style={styles.vitalsGrid}>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Blood Pressure</Text>
                        <Text style={styles.vitalValue}>{patient.vitals.bloodPressure}</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Heart Rate</Text>
                        <Text style={styles.vitalValue}>{patient.vitals.heartRate}</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Temperature</Text>
                        <Text style={styles.vitalValue}>{patient.vitals.temperature}</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Last Checked</Text>
                        <Text style={styles.vitalValue}>{patient.vitals.lastChecked}</Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </View>
            ) : (
              <Card style={styles.tabCard}>
                <CardContent style={styles.restrictedContent}>
                  <Text style={styles.restrictedIcon}>🔒</Text>
                  <Text style={styles.restrictedText}>
                    Medical information access restricted for your role.
                  </Text>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Therapy Tab */}
          <TabsContent value="therapy">
            <Card style={styles.tabCard}>
              <CardHeader>
                <CardTitle>Therapy Information</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.therapyList}>
                  <View style={styles.therapyItem}>
                    <Text style={styles.therapyLabel}>Last Session</Text>
                    <Text style={styles.therapyValue}>{patient.lastSession}</Text>
                  </View>
                  <View style={styles.therapyItem}>
                    <Text style={styles.therapyLabel}>Next Appointment</Text>
                    <Text style={styles.therapyValue}>{patient.nextAppointment}</Text>
                  </View>
                  <View style={styles.therapyItem}>
                    <Text style={styles.therapyLabel}>Assigned Therapist</Text>
                    <Text style={styles.therapyValue}>{patient.assignedTherapist}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {hasRestrictedAccess && role === 'nurse' && (
              <Card style={styles.tabCard}>
                <CardContent style={styles.restrictedContent}>
                  <Text style={styles.restrictedIcon}>🔒</Text>
                  <Text style={styles.restrictedText}>
                    Therapy details access restricted for nursing staff.
                  </Text>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            {canEditNotes ? (
              <View>
                <Alert
                  variant="default"
                  title="Authentication Required"
                  description="Access to therapy notes requires additional authentication. Click below to securely access patient notes."
                  style={styles.notesAlert}
                />

                <Button
                  onPress={() =>
                    navigation.navigate('TherapyNotesNew', {
                      patientId: patient.id,
                      staffId,
                      role,
                    })
                  }
                  style={styles.notesButton}
                >
                  <Text style={styles.notesButtonText}>
                    🛡️ Access Therapy Notes (Requires Re-authentication)
                  </Text>
                </Button>

                <Card style={styles.tabCard}>
                  <CardContent style={styles.notesContent}>
                    <Text style={styles.notesIcon}>📄</Text>
                    <Text style={styles.notesText}>
                      Notes are encrypted and require additional verification to access.
                    </Text>
                  </CardContent>
                </Card>
              </View>
            ) : (
              <Card style={styles.tabCard}>
                <CardContent style={styles.restrictedContent}>
                  <Text style={styles.restrictedIcon}>🔒</Text>
                  <Text style={styles.restrictedText}>
                    Therapy notes access restricted for your role.
                  </Text>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>Encrypted Session</Text>
        </View>
        <Text style={styles.footerText}>Last Updated: 2 min ago</Text>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerBadge: {
    marginLeft: 8,
  },
  headerBadgeText: {
    fontSize: 12,
  },
  securityAlert: {
    margin: 16,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 18,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  tabs: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabCard: {
    marginTop: 16,
  },
  demographicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  demographicItem: {
    width: '50%',
    marginBottom: 16,
  },
  demographicLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  demographicValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  toggleButton: {
    marginTop: 16,
  },
  toggleButtonText: {
    fontSize: 14,
  },
  statusList: {
    gap: 12,
  },
  statusItem: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  medicationItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  medicationFrequency: {
    fontSize: 14,
    color: '#6b7280',
  },
  medicationPrescriber: {
    fontSize: 12,
    color: '#6b7280',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vitalItem: {
    width: '50%',
    marginBottom: 16,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  restrictedContent: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  restrictedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  restrictedText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  therapyList: {
    gap: 12,
  },
  therapyItem: {
    marginBottom: 12,
  },
  therapyLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  therapyValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  notesAlert: {
    marginBottom: 16,
  },
  notesButton: {
    marginBottom: 16,
  },
  notesButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  notesContent: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  notesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
