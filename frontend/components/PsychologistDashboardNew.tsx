import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert as RNAlert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as LocalAuthentication from 'expo-local-authentication';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Alert } from './ui/alert.native';
import { Input } from './ui/input.native';
import { Button } from './ui/button.native';
import { patientAPI, therapyNoteAPI, assessmentAPI } from '../services/api';

interface PsychologistDashboardNewProps {
  navigation: any;
  route: any;
}

interface Patient {
  id: string;
  numericId?: number;
  name: string;
  condition: string;
  lastSession: string;
  assessment: string;
}

interface Assessment {
  patient: string;
  type: string;
  date: string;
  status: string;
}

export function PsychologistDashboardNew({ navigation, route }: PsychologistDashboardNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-002' };
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [newPatientModalVisible, setNewPatientModalVisible] = useState(false);
  const [editPatientModalVisible, setEditPatientModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [newAssessmentModalVisible, setNewAssessmentModalVisible] = useState(false);

  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDOB, setNewPatientDOB] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('');
  const [newPatientContact, setNewPatientContact] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState('');
  const [newPatientWard, setNewPatientWard] = useState('');
  const [newPatientRoom, setNewPatientRoom] = useState('');
  const [newPatientPhysician, setNewPatientPhysician] = useState('');
  const [newPatientTherapist, setNewPatientTherapist] = useState('');
  const [newPatientStatus, setNewPatientStatus] = useState('Active');

  // Edit patient fields
  const [editPatientName, setEditPatientName] = useState('');
  const [editPatientDOB, setEditPatientDOB] = useState('');
  const [editPatientGender, setEditPatientGender] = useState('');
  const [editPatientContact, setEditPatientContact] = useState('');
  const [editPatientEmail, setEditPatientEmail] = useState('');
  const [editPatientDiagnosis, setEditPatientDiagnosis] = useState('');
  const [editPatientWard, setEditPatientWard] = useState('');
  const [editPatientRoom, setEditPatientRoom] = useState('');
  const [editPatientPhysician, setEditPatientPhysician] = useState('');
  const [editPatientTherapist, setEditPatientTherapist] = useState('');
  const [editPatientStatus, setEditPatientStatus] = useState('Active');


  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [assessmentType, setAssessmentType] = useState('');
  const [assessmentPatientId, setAssessmentPatientId] = useState('');
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [assessmentDate, setAssessmentDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reload data when screen comes into focus
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const patientsResponse = await patientAPI.getAll();
      const notesResponse = await therapyNoteAPI.getAll();
      const assessmentsResponse = await assessmentAPI.getAll();
      
      const patientsData = patientsResponse?.data || patientsResponse || [];
      const notesData = notesResponse?.data || notesResponse || [];
      const assessmentsData = assessmentsResponse?.data || assessmentsResponse || [];
      
      setPatients(
        (Array.isArray(patientsData) ? patientsData : []).map((p: any) => ({
          id: p.mrn || p.id,
          numericId: p.id,
          name: p.full_name || p.name,
          condition: p.diagnosis || 'No diagnosis',
          lastSession: new Date(p.created_at || Date.now()).toISOString().split('T')[0],
          assessment: 'N/A',
        }))
      );
      setNotes(Array.isArray(notesData) ? notesData : []);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      RNAlert.alert('Error', 'Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddPatient = async () => {
    // Validate required fields
    if (!newPatientName || !newPatientDOB || !newPatientGender) {
      RNAlert.alert('Validation Error', 'Please fill in Name, Date of Birth, and Gender');
      return;
    }

    // Validate name (at least 2 characters)
    if (newPatientName.trim().length < 2) {
      RNAlert.alert('Validation Error', 'Patient name must be at least 2 characters');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(newPatientDOB)) {
      RNAlert.alert('Validation Error', 'Date of Birth must be in YYYY-MM-DD format');
      return;
    }

    // Validate date is not in future
    const dob = new Date(newPatientDOB);
    if (dob > new Date()) {
      RNAlert.alert('Validation Error', 'Date of Birth cannot be in the future');
      return;
    }

    // Validate email format if provided
    if (newPatientEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newPatientEmail)) {
        RNAlert.alert('Validation Error', 'Please enter a valid email address (e.g., patient@gmail.com)');
        return;
      }
    }

    // Validate phone format if provided (10 digits)
    if (newPatientContact) {
      const phoneDigits = newPatientContact.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        RNAlert.alert('Validation Error', 'Phone number must be exactly 10 digits');
        return;
      }
    }

    try {
      // Generate MRN in PAT-XXXXX format to match existing patients
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
      const mrn = `PAT-${randomNum}`;
      
      const patientData = {
        mrn,
        full_name: newPatientName.trim(),
        dob: newPatientDOB,
        phone: newPatientContact ? newPatientContact.replace(/\D/g, '') : null,
        email: newPatientEmail ? newPatientEmail.toLowerCase().trim() : null,
        gender: newPatientGender,
        diagnosis: newPatientDiagnosis ? newPatientDiagnosis.trim() : null,
        ward: newPatientWard ? newPatientWard.trim() : null,
        room: newPatientRoom ? newPatientRoom.trim() : null,
        attending_physician: newPatientPhysician ? newPatientPhysician.trim() : null,
        assigned_therapist: newPatientTherapist ? newPatientTherapist.trim() : staffId,
        status: 'Active',
        admission_date: new Date().toISOString().split('T')[0],
      };

      const response = await patientAPI.create(patientData);
      const createdPatient = response?.data || response;

      // Reload all data to get fresh patient list
      await loadData();

      setNewPatientModalVisible(false);
      setNewPatientName('');
      setNewPatientDOB('');
      setNewPatientGender('');
      setNewPatientContact('');
      setNewPatientEmail('');
      setNewPatientDiagnosis('');
      setNewPatientWard('');
      setNewPatientRoom('');
      setNewPatientPhysician('');
      setNewPatientTherapist('');

      RNAlert.alert('Success', `Patient ${newPatientName} added successfully with ID: ${mrn}`);
    } catch (error: any) {
      console.error('Failed to add patient:', error);
      RNAlert.alert('Error', error?.message || 'Failed to add patient. Please try again.');
    }
  };

  const handleOpenEditPatient = async (patient: any) => {
    try {
      // Fetch full patient details
      const response = await patientAPI.getById(patient.numericId);
      const fullPatient = response?.data || response;
      
      setSelectedPatient(fullPatient);
      setEditPatientName(fullPatient.full_name || '');
      setEditPatientDOB(fullPatient.dob || '');
      setEditPatientGender(fullPatient.gender || '');
      setEditPatientContact(fullPatient.phone || '');
      setEditPatientEmail(fullPatient.email || '');
      setEditPatientDiagnosis(fullPatient.diagnosis || '');
      setEditPatientWard(fullPatient.ward || '');
      setEditPatientRoom(fullPatient.room || '');
      setEditPatientPhysician(fullPatient.attending_physician || '');
      setEditPatientTherapist(fullPatient.assigned_therapist || '');
      setEditPatientStatus(fullPatient.status || 'Active');
      setEditPatientModalVisible(true);
    } catch (error) {
      console.error('Failed to load patient details:', error);
      RNAlert.alert('Error', 'Failed to load patient details');
    }
  };

  const handleEditPatient = async () => {
    if (!selectedPatient) return;

    // Validate required fields
    if (!editPatientName || !editPatientDOB || !editPatientGender) {
      RNAlert.alert('Validation Error', 'Please fill in Name, Date of Birth, and Gender');
      return;
    }

    // Validate name (at least 2 characters)
    if (editPatientName.trim().length < 2) {
      RNAlert.alert('Validation Error', 'Patient name must be at least 2 characters');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(editPatientDOB)) {
      RNAlert.alert('Validation Error', 'Date of Birth must be in YYYY-MM-DD format');
      return;
    }

    // Validate date is not in future
    const dob = new Date(editPatientDOB);
    if (dob > new Date()) {
      RNAlert.alert('Validation Error', 'Date of Birth cannot be in the future');
      return;
    }

    // Validate email format if provided
    if (editPatientEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editPatientEmail)) {
        RNAlert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }
    }

    // Validate phone format if provided (10 digits)
    if (editPatientContact) {
      const phoneDigits = editPatientContact.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        RNAlert.alert('Validation Error', 'Phone number must be exactly 10 digits');
        return;
      }
    }

    try {
      const updateData = {
        full_name: editPatientName.trim(),
        dob: editPatientDOB,
        phone: editPatientContact ? editPatientContact.replace(/\D/g, '') : '',
        email: editPatientEmail ? editPatientEmail.toLowerCase().trim() : '',
        gender: editPatientGender,
        diagnosis: editPatientDiagnosis ? editPatientDiagnosis.trim() : '',
        ward: editPatientWard ? editPatientWard.trim() : '',
        room: editPatientRoom ? editPatientRoom.trim() : '',
        attending_physician: editPatientPhysician ? editPatientPhysician.trim() : '',
        assigned_therapist: editPatientTherapist ? editPatientTherapist.trim() : '',
        status: editPatientStatus,
      };

      await patientAPI.update(selectedPatient.id, updateData);
      
      // Reload all data
      await loadData();
      
      setEditPatientModalVisible(false);
      setSelectedPatient(null);
      
      RNAlert.alert('Success', `Patient ${editPatientName} updated successfully`);
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      RNAlert.alert('Error', error?.message || 'Failed to update patient. Please try again.');
    }
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
          console.log('Fetching decrypted note for ID:', note.id);
          const decryptedNote = await therapyNoteAPI.getDecrypted(note.id);
          console.log('Decrypted note received:', decryptedNote);
          navigation.navigate('TherapyNoteDetail', { note: decryptedNote.data || decryptedNote });
        } else {
          setAuthModalVisible(true);
        }
      } else {
        setAuthModalVisible(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthModalVisible(true);
    }
  };

  const handlePasswordAuth = async () => {
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(async () => {
      if (authPassword.length >= 6) {
        try {
          // Fetch decrypted note
          const decryptedNote = await therapyNoteAPI.getDecrypted(selectedNote.id);
          navigation.navigate('TherapyNoteDetail', { note: decryptedNote.data || decryptedNote });
          setAuthModalVisible(false);
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



  const handleAddAssessment = async () => {
    if (!assessmentType || !assessmentPatientId || !assessmentDate) {
      RNAlert.alert('Validation Error', 'Please select assessment type, patient, and date');
      return;
    }

    const selectedPatient = patients.find(p => p.id === assessmentPatientId);
    const patientIdToSend = selectedPatient?.numericId || parseInt(assessmentPatientId) || assessmentPatientId;

    try {
      await assessmentAPI.create({
        patient_id: typeof patientIdToSend === 'number' ? patientIdToSend : undefined,
        patient_mrn: typeof patientIdToSend === 'string' ? patientIdToSend : undefined,
        assessment_type: assessmentType,
        scheduled_by: staffId,
        scheduled_date: assessmentDate,
        notes: assessmentNotes,
        status: 'scheduled',
      });

      await loadData(); // Reload to get fresh data
      setNewAssessmentModalVisible(false);
      setAssessmentType('');
      setAssessmentPatientId('');
      setAssessmentNotes('');
      setAssessmentDate('');
      setSelectedDate(new Date());

      RNAlert.alert('Success', `Assessment scheduled for ${assessmentDate}`);
    } catch (error) {
      console.error('Failed to create assessment:', error);
      RNAlert.alert('Error', 'Failed to schedule assessment');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      setAssessmentDate(formattedDate);
    }
  };

  const assessmentTools = [
    'Beck Depression Inventory',
    'GAD-7',
    'MMPI-2',
    'Rorschach Test',
    'WAIS-IV',
    'PCL-5',
  ];

  const getAssessmentToolDescription = (tool: string): string => {
    const descriptions: { [key: string]: string } = {
      'Beck Depression Inventory': 'A 21-question multiple-choice self-report inventory for measuring the severity of depression. Widely used for both clinical and research purposes.',
      'GAD-7': 'Generalized Anxiety Disorder 7-item scale. A brief clinical measure for assessing generalized anxiety disorder severity.',
      'MMPI-2': 'Minnesota Multiphasic Personality Inventory-2. A standardized psychometric test of adult personality and psychopathology with 567 true/false questions.',
      'Rorschach Test': 'A projective psychological test consisting of 10 inkblot images. Used to examine personality characteristics and emotional functioning.',
      'WAIS-IV': 'Wechsler Adult Intelligence Scale, Fourth Edition. An IQ test designed to measure intelligence and cognitive ability in adults and older adolescents.',
      'PCL-5': 'PTSD Checklist for DSM-5. A 20-item self-report measure assessing the 20 DSM-5 symptoms of PTSD.',
    };
    return descriptions[tool] || 'No description available.';
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Completed') return 'default';
    if (status === 'Scheduled') return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>🧠</Text>
              <Text style={styles.headerTitle}>Psychologist Dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WelcomeNew')}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Dr. {staffId}</Text>
        </View>

        {/* Access Restrictions Notice */}
        <Alert
          variant="default"
          title="Access Level: Psychologist"
          description="No prescription access. Limited to therapy records and assessments."
          style={styles.accessAlert}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="patients" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Patient List</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setNewPatientModalVisible(true)}
              >
                <Text style={styles.addButtonText}>➕ New Patient</Text>
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              leftIcon={<Text>🔍</Text>}
              style={styles.searchInput}
            />

            <View style={styles.patientList}>
              {filteredPatients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  onPress={() =>
                    navigation.navigate('PatientProfileNew', {
                      patientId: patient.id,
                      staffId,
                      role: 'psychologist',
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Card style={styles.patientCard}>
                    <CardHeader style={styles.patientCardHeader}>
                      <View style={styles.patientCardTitleRow}>
                        <CardTitle>{patient.name}</CardTitle>
                        <Badge variant="outline" textStyle={styles.badgeText}>
                          {patient.id}
                        </Badge>
                      </View>
                    </CardHeader>
                  <CardContent>
                    <View style={styles.patientDetails}>
                      <View style={styles.patientDetailItem}>
                        <Text style={styles.detailLabel}>Condition</Text>
                        <Text style={styles.detailValue}>{patient.condition}</Text>
                      </View>
                      <View style={styles.patientDetailItem}>
                        <Text style={styles.detailLabel}>Last Session</Text>
                        <Text style={styles.detailValue}>{patient.lastSession}</Text>
                      </View>
                      <View style={styles.patientDetailFull}>
                        <Text style={styles.detailLabel}>Recent Assessment</Text>
                        <Text style={styles.detailValue}>{patient.assessment}</Text>
                      </View>
                    </View>

                    <View style={styles.restrictedNotice}>
                      <Text style={styles.restrictedIcon}>🔒</Text>
                      <Text style={styles.restrictedText}>
                        Prescription information restricted
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
              ))}
            </View>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Therapy Notes</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TherapyNotesNew', {
                  staffId,
                  role: 'psychologist',
                })}
              >
                <Text style={styles.addButtonText}>📄 New Note</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.notesCard}>
              <CardContent>
                <Text style={styles.notesDescription}>
                  Access to therapy session notes, treatment plans, and psychological
                  observations.
                </Text>

                <View style={styles.notesList}>
                  {notes.length === 0 ? (
                    <Text style={styles.emptyText}>No therapy notes yet</Text>
                  ) : (
                    notes.slice(0, 10).map((note) => {
                      // Find patient by either numeric ID or MRN
                      const patient = patients.find((p) => 
                        p.numericId === note.patient_id || 
                        p.id === note.patient_mrn ||
                        String(p.numericId) === String(note.patient_id)
                      );
                      
                      return (
                        <TouchableOpacity 
                          key={note.id} 
                          style={styles.noteItem}
                          onPress={() => handleViewNote(note)}
                        >
                          <View style={styles.noteHeader}>
                            <View style={styles.noteHeaderLeft}>
                              <Text style={styles.noteTitle}>
                                📝 {patient?.name || 'Unknown Patient'}
                              </Text>
                              <Text style={styles.noteAuthor}>
                                By: {note.staff_id || note.author || 'Unknown'}
                              </Text>
                            </View>
                            <Text style={styles.noteDate}>
                              {new Date(note.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                          <Text style={styles.noteContent} numberOfLines={3}>
                            {note.note_content || note.content || 'No content'}
                          </Text>
                          <View style={styles.noteFooter}>
                            <Text style={styles.noteTime}>
                              🕒 {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text style={styles.noteEncrypted}>🔒 Encrypted</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Psychological Assessments</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setNewAssessmentModalVisible(true)}
              >
                <Text style={styles.addButtonText}>📋 New Assessment</Text>
              </TouchableOpacity>
            </View>

            {/* Scheduled Assessments List */}
            <Card style={styles.scheduledCard}>
              <CardHeader>
                <CardTitle>Scheduled Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                {assessments.length > 0 ? (
                  <View style={styles.assessmentList}>
                    {assessments.map((assessment: any) => {
                      const patient = patients.find(p => p.numericId === assessment.patient_id);
                      return (
                        <TouchableOpacity 
                          key={assessment.id} 
                          activeOpacity={0.7}
                        >
                          <Card style={styles.assessmentCard}>
                            <CardContent style={styles.assessmentContent}>
                              <View style={styles.assessmentInfo}>
                                <Text style={styles.assessmentType}>📋 {assessment.assessment_type}</Text>
                                <Text style={styles.assessmentPatient}>
                                  Patient: {patient?.name || `ID: ${assessment.patient_id}`}
                                </Text>
                                <Text style={styles.assessmentDate}>
                                  📅 {assessment.scheduled_date || new Date(assessment.created_at).toLocaleDateString()}
                                </Text>
                                {assessment.scheduled_by && (
                                  <Text style={styles.assessmentScheduledBy}>
                                    Scheduled by: {assessment.scheduled_by}
                                  </Text>
                                )}
                                {assessment.notes && (
                                  <Text style={styles.assessmentNotes}>
                                    Notes: {assessment.notes}
                                  </Text>
                                )}
                              </View>
                              <Badge variant={getStatusBadgeVariant(assessment.status)} textStyle={styles.statusBadgeText}>
                                {assessment.status}
                              </Badge>
                            </CardContent>
                          </Card>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.emptyListText}>No assessments scheduled yet. Click "New Assessment" to schedule one.</Text>
                )}
              </CardContent>
            </Card>

            {/* Available Assessment Tools */}
            <Card style={styles.toolsCard}>
              <CardHeader>
                <CardTitle>Available Assessment Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Text style={styles.toolsDescription}>
                  Click on any assessment tool below to learn more about it
                </Text>
                <View style={styles.toolsGrid}>
                  {assessmentTools.map((tool, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.toolCard}
                      onPress={() => RNAlert.alert(
                        tool,
                        getAssessmentToolDescription(tool),
                        [{ text: 'OK' }]
                      )}
                    >
                      <Text style={styles.toolCardIcon}>📊</Text>
                      <Text style={styles.toolCardName}>{tool}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollView>

      {/* New Patient Modal */}
      <Modal
        visible={newPatientModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setNewPatientModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setNewPatientModalVisible(false)}>
              <Text style={styles.modalCloseButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>🏥 Add New Patient</Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView 
                style={styles.modalScrollView} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter patient's full name"
                value={newPatientName}
                onChangeText={setNewPatientName}
              />

              <Text style={styles.fieldLabel}>Date of Birth *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={newPatientDOB}
                onChangeText={setNewPatientDOB}
              />

              <Text style={styles.fieldLabel}>Gender *</Text>
              <View style={styles.genderSelector}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      newPatientGender === gender && styles.genderOptionSelected,
                    ]}
                    onPress={() => setNewPatientGender(gender)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        newPatientGender === gender && styles.genderOptionTextSelected,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <Text style={styles.fieldLabel}>Phone Number (10 digits)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 1234567890"
                value={newPatientContact}
                onChangeText={setNewPatientContact}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. patient@gmail.com"
                value={newPatientEmail}
                onChangeText={setNewPatientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              
              <Text style={styles.fieldLabel}>Primary Diagnosis</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Major Depressive Disorder"
                value={newPatientDiagnosis}
                onChangeText={setNewPatientDiagnosis}
              />

              <Text style={styles.fieldLabel}>Ward</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Psychiatric Ward A"
                value={newPatientWard}
                onChangeText={setNewPatientWard}
              />

              <Text style={styles.fieldLabel}>Room Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 205"
                value={newPatientRoom}
                onChangeText={setNewPatientRoom}
              />

              <Text style={styles.fieldLabel}>Attending Physician</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Dr. Smith"
                value={newPatientPhysician}
                onChangeText={setNewPatientPhysician}
              />

              <Text style={styles.fieldLabel}>Assigned Therapist</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Leave blank to auto-assign to you"
                value={newPatientTherapist}
                onChangeText={setNewPatientTherapist}
              />
            </View>

            <View style={styles.formNote}>
              <Text style={styles.formNoteText}>
                ℹ️ Patient ID will be auto-generated (PAT-XXXXX format). Status will be set to Active and admission date to today.
              </Text>
              <Text style={styles.formNoteText}>
                • Email must include @ symbol (e.g., @gmail.com)
              </Text>
              <Text style={styles.formNoteText}>
                • Phone number must be exactly 10 digits
              </Text>
              <Text style={styles.formNoteText}>
                • Date format: YYYY-MM-DD
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setNewPatientModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddPatient}
            >
              <Text style={styles.modalSaveButtonText}>✓ Add Patient</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        visible={editPatientModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditPatientModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditPatientModalVisible(false)}>
              <Text style={styles.modalCloseButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>✏️ Edit Patient</Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView 
                style={styles.modalScrollView} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter patient's full name"
                value={editPatientName}
                onChangeText={setEditPatientName}
              />

              <Text style={styles.fieldLabel}>Date of Birth *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={editPatientDOB}
                onChangeText={setEditPatientDOB}
              />

              <Text style={styles.fieldLabel}>Gender *</Text>
              <View style={styles.genderSelector}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      editPatientGender === gender && styles.genderOptionSelected,
                    ]}
                    onPress={() => setEditPatientGender(gender)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        editPatientGender === gender && styles.genderOptionTextSelected,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <Text style={styles.fieldLabel}>Phone Number (10 digits)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 1234567890"
                value={editPatientContact}
                onChangeText={setEditPatientContact}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. patient@gmail.com"
                value={editPatientEmail}
                onChangeText={setEditPatientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              
              <Text style={styles.fieldLabel}>Primary Diagnosis</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Major Depressive Disorder"
                value={editPatientDiagnosis}
                onChangeText={setEditPatientDiagnosis}
              />

              <Text style={styles.fieldLabel}>Ward</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Psychiatric Ward A"
                value={editPatientWard}
                onChangeText={setEditPatientWard}
              />

              <Text style={styles.fieldLabel}>Room Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 205"
                value={editPatientRoom}
                onChangeText={setEditPatientRoom}
              />

              <Text style={styles.fieldLabel}>Attending Physician</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Dr. Smith"
                value={editPatientPhysician}
                onChangeText={setEditPatientPhysician}
              />

              <Text style={styles.fieldLabel}>Assigned Therapist</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. STAFF-002"
                value={editPatientTherapist}
                onChangeText={setEditPatientTherapist}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Patient Status</Text>
              
              <Text style={styles.fieldLabel}>Status *</Text>
              <View style={styles.statusSelector}>
                {['Active', 'Inactive', 'Discharged'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      editPatientStatus === status && styles.statusOptionSelected,
                    ]}
                    onPress={() => setEditPatientStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        editPatientStatus === status && styles.statusOptionTextSelected,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formNote}>
              <Text style={styles.formNoteText}>
                ℹ️ Update patient information and status
              </Text>
              <Text style={styles.formNoteText}>
                • Email must include @ symbol
              </Text>
              <Text style={styles.formNoteText}>
                • Phone number must be exactly 10 digits
              </Text>
              <Text style={styles.formNoteText}>
                • Date format: YYYY-MM-DD
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setEditPatientModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleEditPatient}
            >
              <Text style={styles.modalSaveButtonText}>✓ Update Patient</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* New Assessment Modal */}
      <Modal
        visible={newAssessmentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewAssessmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Assessment</Text>
              <TouchableOpacity onPress={() => setNewAssessmentModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <Text style={styles.modalLabel}>Assessment Type *</Text>
              <View style={styles.assessmentSelector}>
                <ScrollView nestedScrollEnabled={true}>
              {assessmentTools.map((tool) => (
                <TouchableOpacity
                  key={tool}
                  style={[
                    styles.assessmentOption,
                    assessmentType === tool && styles.assessmentOptionSelected,
                  ]}
                  onPress={() => setAssessmentType(tool)}
                >
                  <Text
                    style={[
                      styles.assessmentOptionText,
                      assessmentType === tool && styles.assessmentOptionTextSelected,
                    ]}
                  >
                    {tool}
                  </Text>
                </TouchableOpacity>
              ))}
                </ScrollView>
              </View>

              <Text style={styles.modalLabel}>Select Patient *</Text>
              <View style={styles.patientSelector}>
                <ScrollView nestedScrollEnabled={true}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientOption,
                    assessmentPatientId === patient.id && styles.patientOptionSelected,
                  ]}
                  onPress={() => setAssessmentPatientId(patient.id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      assessmentPatientId === patient.id && styles.patientOptionTextSelected,
                    ]}
                  >
                    {patient.name} ({patient.id})
                  </Text>
                </TouchableOpacity>
              ))}
                </ScrollView>
              </View>

              <Text style={styles.modalLabel}>Scheduled Date *</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                {assessmentDate || 'Select Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    themeVariant="light"
                    textColor="#000000"
                  />
                </View>
              )}

              <Text style={styles.modalLabel}>Assessment Notes</Text>
              <TextInput
                style={styles.noteTextArea}
                placeholder="Enter notes (optional)"
                value={assessmentNotes}
                onChangeText={setAssessmentNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewAssessmentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddAssessment}
              >
                <Text style={styles.saveButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Authentication Modal for Viewing Notes */}
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setAuthModalVisible(false);
          setAuthPassword('');
          setAuthError('');
          setSelectedNote(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Authentication Required</Text>
            <Text style={styles.authSubtitle}>
              Enter your password to view this encrypted therapy note
            </Text>
            
            {authError ? (
              <View style={styles.authErrorContainer}>
                <Text style={styles.authErrorText}>{authError}</Text>
              </View>
            ) : null}
            
            <TextInput
              style={styles.authPasswordInput}
              placeholder="Enter your password"
              value={authPassword}
              onChangeText={(text) => {
                setAuthPassword(text);
                setAuthError('');
              }}
              secureTextEntry
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAuthModalVisible(false);
                  setAuthPassword('');
                  setAuthError('');
                  setSelectedNote(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePasswordAuth}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Verify & View</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.biometricRetryButton}
              onPress={async () => {
                setAuthError('');
                try {
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Verify your identity',
                    fallbackLabel: 'Cancel',
                  });
                  if (result.success && selectedNote) {
                    navigation.navigate('TherapyNoteDetail', { note: selectedNote });
                    setAuthModalVisible(false);
                    setAuthPassword('');
                    setSelectedNote(null);
                  }
                } catch (error) {
                  console.error('Biometric auth error:', error);
                }
              }}
            >
              <Text style={styles.biometricRetryText}>🔒 Try Biometric Again</Text>
            </TouchableOpacity>
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
  accessAlert: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tabs: {
    padding: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
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
  patientDetails: {
    marginBottom: 12,
  },
  patientDetailItem: {
    marginBottom: 12,
  },
  patientDetailFull: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  restrictedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  restrictedIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  restrictedText: {
    fontSize: 12,
    color: '#6b7280',
  },
  notesCard: {
    marginBottom: 16,
  },
  notesDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteHeaderLeft: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  noteAuthor: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  noteDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  noteTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  noteEncrypted: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  assessmentList: {
    marginBottom: 16,
  },
  assessmentCard: {
    marginBottom: 12,
  },
  assessmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  assessmentPatient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  assessmentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadgeText: {
    fontSize: 12,
  },
  toolsCard: {
    marginTop: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  toolText: {
    fontSize: 12,
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
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 22,
    color: '#6b7280',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  noteTextArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
  },
  patientSelector: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  patientOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  patientOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  patientOptionText: {
    fontSize: 15,
    color: '#1f2937',
  },
  patientOptionTextSelected: {
    fontWeight: '600',
    color: '#1e40af',
  },
  assessmentSelector: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  assessmentOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  assessmentOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  assessmentOptionText: {
    fontSize: 15,
    color: '#1f2937',
  },
  assessmentOptionTextSelected: {
    fontWeight: '600',
    color: '#1e40af',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  noteModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '600',
  },
  noteFormScroll: {
    padding: 16,
    maxHeight: '75%',
  },
  patientSelectorCompact: {
    maxHeight: 60,
    marginBottom: 16,
  },
  patientChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  patientChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  patientChipText: {
    fontSize: 14,
    color: '#1f2937',
  },
  patientChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sessionTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sessionTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  sessionTypeSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  sessionTypeText: {
    fontSize: 13,
    color: '#6b7280',
  },
  sessionTypeTextSelected: {
    color: '#1e40af',
    fontWeight: '600',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  moodSelected: {
    backgroundColor: '#fbbf24',
  },
  moodText: {
    fontSize: 13,
    color: '#92400e',
  },
  moodTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  progressOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  progressSelected: {
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 13,
    color: '#065f46',
  },
  progressTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  noteTextAreaImproved: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 150,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  noteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  noteInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  authSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  authErrorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 16,
  },
  authErrorText: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
  },
  authPasswordInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 16,
  },
  biometricRetryButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  biometricRetryText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  // New Patient Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  modalCloseButton: {
    fontSize: 28,
    color: '#6b7280',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalScrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 8,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  formNote: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 16,
  },
  formNoteText: {
    fontSize: 12,
    color: '#1e40af',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statusOption: {
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
  statusOptionSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  scheduledCard: {
    marginBottom: 16,
  },
  toolsDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  toolCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toolCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toolCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  assessmentNotes: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyListText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  assessmentScheduledBy: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  datePickerButtonText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  calendarIcon: {
    fontSize: 24,
  },
});
