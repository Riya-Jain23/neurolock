import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert as RNAlert,
  TextInput,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Alert } from './ui/alert.native';
import { Separator } from './ui/separator.native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Button } from './ui/button.native';
import { Input } from './ui/input.native';
import { patientAPI, therapyNoteAPI, assessmentAPI } from '../services/api';

interface PatientProfileScreenNewProps {
  navigation: any;
  route: any;
}

interface Patient {
  id: string;
  numericId?: number;
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
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAuthModalVisible, setEditAuthModalVisible] = useState(false);
  const [reAuthModalVisible, setReAuthModalVisible] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [noteAuthModalVisible, setNoteAuthModalVisible] = useState(false);

  // Edit patient form states
  const [editName, setEditName] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editWard, setEditWard] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editPhysician, setEditPhysician] = useState('');
  const [editTherapist, setEditTherapist] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  useEffect(() => {
    loadData();
  }, [patientId]);

  useFocusEffect(
    React.useCallback(() => {
      // Reload data when screen comes into focus
      loadData();
    }, [patientId])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      let patientResponse;
      // Check if patientId is numeric (ID) or string (MRN)
      if (!isNaN(Number(patientId))) {
        try {
          patientResponse = await patientAPI.getById(patientId);
        } catch (e) {
          // If ID fetch fails, try as MRN just in case
          console.log('Fetch by ID failed, trying MRN...');
          patientResponse = await patientAPI.getByMRN(patientId);
        }
      } else {
        patientResponse = await patientAPI.getByMRN(patientId);
      }
      
      const patientData = patientResponse.data || patientResponse;

      // Fetch related data using numeric patient ID
      const numericPatientId = patientData.id;
      
      let notesData = [];
      try {
        const notesResponse = await therapyNoteAPI.getByPatientId(numericPatientId);
        notesData = notesResponse.data || notesResponse || [];
        console.log('Loaded notes for patient:', numericPatientId, notesData);
      } catch (e) {
        console.log('Notes fetch error:', e);
      }

      let assessmentsData = [];
      try {
        const assessmentsResponse = await assessmentAPI.getByPatientId(numericPatientId);
        assessmentsData = assessmentsResponse.data || assessmentsResponse || [];
      } catch (e) {
        console.log('Assessments fetch error:', e);
      }

      // Transform backend data to frontend model
      // Note: Adjust fields based on actual backend response structure
      const dob = new Date(patientData.date_of_birth || Date.now());
      const age = new Date().getFullYear() - dob.getFullYear();

      setPatient({
        id: patientData.mrn || patientData.id,
        numericId: patientData.id,
        name: patientData.full_name || patientData.name,
        dateOfBirth: dob.toISOString().split('T')[0],
        age: age.toString(),
        gender: patientData.gender || 'Unknown',
        admissionDate: patientData.created_at ? new Date(patientData.created_at).toISOString().split('T')[0] : 'Unknown',
        ward: patientData.ward || 'General',
        room: patientData.room || 'N/A',
        status: patientData.status || 'Active',
        priority: patientData.priority || 'Normal',
        primaryDiagnosis: patientData.diagnosis || 'Pending',
        secondaryDiagnosis: patientData.secondary_diagnosis || 'None',
        attendingPhysician: patientData.attending_physician || 'Unassigned',
        assignedTherapist: patientData.assigned_therapist || 'Unassigned',
        emergencyContact: patientData.emergency_contact_name || 'None',
        emergencyPhone: patientData.emergency_contact_phone || 'None',
        insurance: patientData.insurance_provider || 'None',
        allergies: patientData.allergies || 'None',
        currentMedications: patientData.medications || [],
        vitals: patientData.vitals || {
          bloodPressure: 'N/A',
          heartRate: 'N/A',
          temperature: 'N/A',
          lastChecked: 'N/A',
        },
        lastSession: notesData.length > 0 ? new Date(notesData[0].created_at).toISOString().split('T')[0] : 'None',
        nextAppointment: 'Not Scheduled', // This would come from appointments API
      });

      setNotes(Array.isArray(notesData) ? notesData : []);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);

    } catch (error) {
      console.error('Failed to load patient profile:', error);
      // Fallback to mock data or show error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!patient?.numericId) return;
    try {
      await patientAPI.update(patient.numericId, { status: newStatus });
      setPatient(prev => prev ? { ...prev, status: newStatus } : null);
      setEditModalVisible(false);
      RNAlert.alert('Success', 'Patient status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      RNAlert.alert('Error', 'Failed to update status');
    }
  };

  const handleOpenEdit = async () => {
    // Require authentication before opening edit modal
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to edit patient details',
          fallbackLabel: 'Use password',
          disableDeviceFallback: false,
        });

        if (result.success) {
          openEditModal();
        } else {
          setEditAuthModalVisible(true);
        }
      } else {
        setEditAuthModalVisible(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setEditAuthModalVisible(true);
    }
  };

  const openEditModal = () => {
    if (!patient) return;
    setEditName(patient.name || '');
    setEditDOB(patient.dateOfBirth || '');
    setEditGender(patient.gender || '');
    setEditPhone(''); // Phone not in current patient object
    setEditEmail(''); // Email not in current patient object
    setEditDiagnosis(patient.primaryDiagnosis || '');
    setEditWard(patient.ward || '');
    setEditRoom(patient.room || '');
    setEditPhysician(patient.attendingPhysician || '');
    setEditTherapist(patient.assignedTherapist || '');
    setEditStatus(patient.status || 'Active');
    setEditModalVisible(true);
  };

  const handleEditPatient = async () => {
    if (!patient?.numericId) return;

    // Validation
    if (!editName || !editDOB || !editGender) {
      RNAlert.alert('Validation Error', 'Please fill in Name, Date of Birth, and Gender');
      return;
    }

    try {
      const updateData = {
        full_name: editName.trim(),
        dob: editDOB,
        phone: editPhone || '',
        email: editEmail || '',
        gender: editGender,
        diagnosis: editDiagnosis || '',
        ward: editWard || '',
        room: editRoom || '',
        attending_physician: editPhysician || '',
        assigned_therapist: editTherapist || '',
        status: editStatus,
      };

      await patientAPI.update(patient.numericId, updateData);
      
      // Reload patient data
      await loadData();
      
      setEditModalVisible(false);
      RNAlert.alert('Success', 'Patient updated successfully');
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      RNAlert.alert('Error', error?.message || 'Failed to update patient');
    }
  };

  const handleEditAuth = () => {
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      if (authPassword.length >= 6) {
        setEditAuthModalVisible(false);
        setAuthPassword('');
        setIsAuthenticating(false);
        openEditModal();
      } else {
        setAuthError('Invalid password. Please try again.');
        setIsAuthenticating(false);
      }
    }, 500);
  };

  const handleViewSensitiveData = async () => {
    try {
      // Check if biometric is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        // Try biometric first
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to view sensitive patient data',
          fallbackLabel: 'Use password',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setShowSensitiveData(true);
        } else {
          // Biometric failed, show password modal
          setReAuthModalVisible(true);
        }
      } else {
        // No biometric, go straight to password
        setReAuthModalVisible(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setReAuthModalVisible(true);
    }
  };

  const handlePasswordAuth = async () => {
    setAuthError('');
    setIsAuthenticating(true);

    // Simple password validation (in production, verify against backend)
    setTimeout(() => {
      if (authPassword.length >= 6) {
        setShowSensitiveData(true);
        setReAuthModalVisible(false);
        setAuthPassword('');
      } else {
        setAuthError('Invalid password. Password must be at least 6 characters.');
      }
      setIsAuthenticating(false);
    }, 1000);
  };

  const handleViewNote = async (note: any) => {
    setSelectedNote(note);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to view therapy note',
          fallbackLabel: 'Use password',
          disableDeviceFallback: false,
        });

        if (result.success) {
          // Fetch decrypted note
          const decryptedNote = await therapyNoteAPI.getDecrypted(note.id);
          navigation.navigate('TherapyNoteDetail', { note: decryptedNote.data || decryptedNote });
        } else {
          setNoteAuthModalVisible(true);
        }
      } else {
        setNoteAuthModalVisible(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setNoteAuthModalVisible(true);
    }
  };

  const handleNotePasswordAuth = async () => {
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(async () => {
      if (authPassword.length >= 6) {
        try {
          // Fetch decrypted note
          const decryptedNote = await therapyNoteAPI.getDecrypted(selectedNote.id);
          navigation.navigate('TherapyNoteDetail', { note: decryptedNote.data || decryptedNote });
          setNoteAuthModalVisible(false);
          setAuthPassword('');
          setSelectedNote(null);
        } catch (error) {
          setAuthError('Failed to decrypt note. Please try again.');
        }
      } else {
        setAuthError('Invalid password. Password must be at least 6 characters.');
      }
      setIsAuthenticating(false);
    }, 1000);
  };

  const hasRestrictedAccess = role === 'therapist' || role === 'nurse';
  const canViewMedications = role === 'psychiatrist' || role === 'nurse';
  const canEditNotes = role !== 'nurse';

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Active') return 'default';
    if (status === 'Critical') return 'destructive';
    return 'secondary';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading patient profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Patient not found</Text>
          <Button onPress={() => navigation.goBack()}>
            <Text>Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

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
              <TouchableOpacity onPress={handleOpenEdit}>
                <Badge variant={getStatusBadgeVariant(patient.status)}>
                  <Text style={styles.badgeText}>{patient.status} ✏️</Text>
                </Badge>
              </TouchableOpacity>
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
                  onPress={() => {
                    if (showSensitiveData) {
                      setShowSensitiveData(false);
                    } else {
                      handleViewSensitiveData();
                    }
                  }}
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
                <View style={styles.notesHeader}>
                  <Text style={styles.notesHeaderTitle}>📝 Therapy Notes ({notes.length})</Text>
                  <Button
                    size="sm"
                    onPress={() =>
                      navigation.navigate('TherapyNotesNew', {
                        patientId: patient.numericId || patient.id,
                        staffId,
                        role,
                      })
                    }
                  >
                    <Text style={styles.addNoteButtonText}>➕ Add Note</Text>
                  </Button>
                </View>

                {notes.length === 0 ? (
                  <Card style={styles.tabCard}>
                    <CardContent style={styles.notesContent}>
                      <Text style={styles.notesIcon}>📄</Text>
                      <Text style={styles.notesText}>
                        No therapy notes yet. Click "Add Note" to create the first session note.
                      </Text>
                    </CardContent>
                  </Card>
                ) : (
                  <View style={styles.notesList}>
                    {notes.map((note: any) => (
                      <TouchableOpacity
                        key={note.id}
                        onPress={() => handleViewNote(note)}
                      >
                        <Card style={styles.noteCard}>
                          <CardHeader>
                            <View style={styles.noteCardHeader}>
                              <View>
                                <Text style={styles.noteCardTitle}>Session Note</Text>
                                <Text style={styles.noteCardDate}>
                                  {new Date(note.created_at).toLocaleDateString()} at{' '}
                                  {new Date(note.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Text>
                              </View>
                              <Badge variant="outline">
                                <Text style={styles.noteCardBadge}>🔒 Encrypted</Text>
                              </Badge>
                            </View>
                            <Text style={styles.noteCardAuthor}>
                              By: {note.staff_id || note.author || 'Unknown'}
                            </Text>
                          </CardHeader>
                          <CardContent>
                            <Text style={styles.noteCardContent} numberOfLines={3}>
                              {note.note_content || note.content || 'No content'}
                            </Text>
                            <Text style={styles.noteCardFooter}>Tap to view full details →</Text>
                          </CardContent>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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

      {/* Edit Patient Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.editModalContainer}>
          <View style={styles.editModalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.editModalCloseButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.editModalHeaderTitle}>✏️ Edit Patient</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.editModalScrollView}>
            <View style={styles.editFormSection}>
              <Text style={styles.editSectionTitle}>Basic Information</Text>
              
              <Text style={styles.editFieldLabel}>Full Name *</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="Enter patient's full name"
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.editFieldLabel}>Date of Birth *</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="YYYY-MM-DD"
                value={editDOB}
                onChangeText={setEditDOB}
              />

              <Text style={styles.editFieldLabel}>Gender *</Text>
              <View style={styles.editGenderSelector}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.editGenderOption,
                      editGender === gender && styles.editGenderOptionSelected,
                    ]}
                    onPress={() => setEditGender(gender)}
                  >
                    <Text
                      style={[
                        styles.editGenderOptionText,
                        editGender === gender && styles.editGenderOptionTextSelected,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.editFormSection}>
              <Text style={styles.editSectionTitle}>Medical Information</Text>
              
              <Text style={styles.editFieldLabel}>Primary Diagnosis</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="e.g. Major Depressive Disorder"
                value={editDiagnosis}
                onChangeText={setEditDiagnosis}
              />

              <Text style={styles.editFieldLabel}>Ward</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="e.g. Psychiatric Ward A"
                value={editWard}
                onChangeText={setEditWard}
              />

              <Text style={styles.editFieldLabel}>Room Number</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="e.g. 205"
                value={editRoom}
                onChangeText={setEditRoom}
              />

              <Text style={styles.editFieldLabel}>Attending Physician</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="e.g. Dr. Smith"
                value={editPhysician}
                onChangeText={setEditPhysician}
              />

              <Text style={styles.editFieldLabel}>Assigned Therapist</Text>
              <TextInput
                style={styles.editModalInput}
                placeholder="e.g. STAFF-002"
                value={editTherapist}
                onChangeText={setEditTherapist}
              />
            </View>

            <View style={styles.editFormSection}>
              <Text style={styles.editSectionTitle}>Patient Status</Text>
              
              <Text style={styles.editFieldLabel}>Status *</Text>
              <View style={styles.editStatusSelector}>
                {['Active', 'Inactive', 'Discharged', 'Critical'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.editStatusOption,
                      editStatus === status && styles.editStatusOptionSelected,
                    ]}
                    onPress={() => setEditStatus(status)}
                  >
                    <Text
                      style={[
                        styles.editStatusOptionText,
                        editStatus === status && styles.editStatusOptionTextSelected,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.editModalFooter}>
            <TouchableOpacity
              style={styles.editModalCancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.editModalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editModalSaveButton}
              onPress={handleEditPatient}
            >
              <Text style={styles.editModalSaveButtonText}>✓ Update Patient</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Authentication Modal */}
      <Modal
        visible={editAuthModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setEditAuthModalVisible(false);
          setAuthPassword('');
          setAuthError('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Authentication Required</Text>
            <Text style={styles.modalSubtitle}>
              Enter your password to edit patient details
            </Text>
            <Separator />
            <View style={styles.modalBody}>
              {authError ? (
                <Alert variant="destructive" style={styles.authError}>
                  <Text style={styles.authErrorText}>{authError}</Text>
                </Alert>
              ) : null}
              
              <Input
                placeholder="Enter your password"
                value={authPassword}
                onChangeText={(text) => {
                  setAuthPassword(text);
                  setAuthError('');
                }}
                secureTextEntry
                autoFocus
                style={styles.passwordInput}
              />

              <View style={styles.authActions}>
                <Button
                  onPress={handleEditAuth}
                  disabled={isAuthenticating}
                  style={styles.authButton}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.authButtonText}>Verify & Edit</Text>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onPress={() => {
                    setEditAuthModalVisible(false);
                    setAuthPassword('');
                    setAuthError('');
                  }}
                  style={styles.authCancelButton}
                >
                  <Text style={styles.authCancelButtonText}>Cancel</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Re-Authentication Modal for Sensitive Data */}
      <Modal
        visible={reAuthModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setReAuthModalVisible(false);
          setAuthPassword('');
          setAuthError('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Re-Authentication Required</Text>
            <Text style={styles.modalSubtitle}>
              Enter your password to view sensitive patient information
            </Text>
            <Separator />
            <View style={styles.modalBody}>
              {authError ? (
                <Alert variant="destructive" style={styles.authError}>
                  <Text style={styles.authErrorText}>{authError}</Text>
                </Alert>
              ) : null}
              
              <Input
                placeholder="Enter your password"
                value={authPassword}
                onChangeText={(text) => {
                  setAuthPassword(text);
                  setAuthError('');
                }}
                secureTextEntry
                autoFocus
                style={styles.passwordInput}
              />

              <View style={styles.authActions}>
                <Button
                  onPress={handlePasswordAuth}
                  disabled={isAuthenticating}
                  style={styles.authButton}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.authButtonText}>Verify & Continue</Text>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onPress={async () => {
                    setAuthError('');
                    try {
                      const result = await LocalAuthentication.authenticateAsync({
                        promptMessage: 'Verify your identity',
                        fallbackLabel: 'Cancel',
                      });
                      if (result.success) {
                        setShowSensitiveData(true);
                        setReAuthModalVisible(false);
                        setAuthPassword('');
                      }
                    } catch (error) {
                      console.error('Biometric auth error:', error);
                    }
                  }}
                  style={styles.biometricButton}
                >
                  <Text style={styles.biometricButtonText}>🔒 Use Biometric</Text>
                </Button>
              </View>
            </View>
            <Button
              variant="outline"
              onPress={() => {
                setReAuthModalVisible(false);
                setAuthPassword('');
                setAuthError('');
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </Button>
          </View>
        </View>
      </Modal>

      {/* Note Authentication Modal */}
      <Modal
        visible={noteAuthModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setNoteAuthModalVisible(false);
          setAuthPassword('');
          setAuthError('');
          setSelectedNote(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Authentication Required</Text>
            <Text style={styles.modalSubtitle}>
              Enter your password to view this encrypted therapy note
            </Text>
            <Separator />
            <View style={styles.modalBody}>
              {authError ? (
                <Alert variant="destructive" style={styles.authError}>
                  <Text style={styles.authErrorText}>{authError}</Text>
                </Alert>
              ) : null}
              
              <Input
                placeholder="Enter your password"
                value={authPassword}
                onChangeText={(text) => {
                  setAuthPassword(text);
                  setAuthError('');
                }}
                secureTextEntry
                autoFocus
                style={styles.passwordInput}
              />

              <View style={styles.authActions}>
                <Button
                  onPress={handleNotePasswordAuth}
                  disabled={isAuthenticating}
                  style={styles.authButton}
                >
                  {isAuthenticating ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.authButtonText}>Verify & View Note</Text>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onPress={async () => {
                    setAuthError('');
                    try {
                      const result = await LocalAuthentication.authenticateAsync({
                        promptMessage: 'Verify your identity',
                        fallbackLabel: 'Cancel',
                      });
                      if (result.success && selectedNote) {
                        navigation.navigate('TherapyNoteDetail', { note: selectedNote });
                        setNoteAuthModalVisible(false);
                        setAuthPassword('');
                        setSelectedNote(null);
                      }
                    } catch (error) {
                      console.error('Biometric auth error:', error);
                    }
                  }}
                  style={styles.biometricButton}
                >
                  <Text style={styles.biometricButtonText}>🔒 Use Biometric</Text>
                </Button>
              </View>
            </View>
            <Button
              variant="outline"
              onPress={() => {
                setNoteAuthModalVisible(false);
                setAuthPassword('');
                setAuthError('');
                setSelectedNote(null);
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </Button>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  modalBody: {
    marginBottom: 16,
  },
  statusButton: {
    marginBottom: 12,
  },
  statusButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalCloseButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  authError: {
    marginBottom: 16,
  },
  authErrorText: {
    fontSize: 13,
    color: '#ef4444',
  },
  passwordInput: {
    marginBottom: 16,
  },
  authActions: {
    gap: 12,
  },
  authButton: {
    width: '100%',
    paddingVertical: 12,
  },
  authButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  biometricButton: {
    width: '100%',
    paddingVertical: 12,
  },
  biometricButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  addNoteButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    marginBottom: 12,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  noteCardDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  noteCardBadge: {
    fontSize: 10,
  },
  noteCardAuthor: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  noteCardContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteCardFooter: {
    fontSize: 12,
    color: '#3b82f6',
    fontStyle: 'italic',
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  editModalCloseButton: {
    fontSize: 28,
    color: '#3b82f6',
    fontWeight: '600',
  },
  editModalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  editModalScrollView: {
    flex: 1,
    padding: 16,
  },
  editFormSection: {
    marginBottom: 24,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  editFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 8,
  },
  editModalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  editGenderSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  editGenderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  editGenderOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  editGenderOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  editGenderOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  editStatusSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  editStatusOption: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  editStatusOptionSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  editStatusOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  editStatusOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  editModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  editModalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  editModalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  editModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  authCancelButton: {
    width: '100%',
    paddingVertical: 12,
  },
  authCancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});
