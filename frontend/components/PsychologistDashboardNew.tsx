import React, { useState, useEffect } from 'react';
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
} from 'react-native';
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
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [newAssessmentModalVisible, setNewAssessmentModalVisible] = useState(false);

  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDOB, setNewPatientDOB] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('');
  const [newPatientContact, setNewPatientContact] = useState('');
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState('');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePatientId, setNewNotePatientId] = useState('');

  const [assessmentType, setAssessmentType] = useState('');
  const [assessmentPatientId, setAssessmentPatientId] = useState('');
  const [assessmentNotes, setAssessmentNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

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
    if (!newPatientName || !newPatientDOB || !newPatientGender) {
      RNAlert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newPatient = await patientAPI.create({
        mrn: `MRN${Date.now()}`,
        full_name: newPatientName,
        dob: newPatientDOB,
        phone: newPatientContact,
        email: '',
      });

      setPatients([
        ...patients,
        {
          id: newPatient.mrn,
          name: newPatient.name,
          condition: newPatient.diagnosis || 'No diagnosis',
          lastSession: new Date().toISOString().split('T')[0],
          assessment: 'N/A',
        },
      ]);

      setNewPatientModalVisible(false);
      setNewPatientName('');
      setNewPatientDOB('');
      setNewPatientGender('');
      setNewPatientContact('');
      setNewPatientDiagnosis('');

      RNAlert.alert('Success', 'Patient added successfully');
    } catch (error) {
      console.error('Failed to add patient:', error);
      RNAlert.alert('Error', 'Failed to add patient');
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent || !newNotePatientId) {
      RNAlert.alert('Validation Error', 'Please select a patient and enter note content');
      return;
    }

    try {
      const newNote = await therapyNoteAPI.create({
        patient_mrn: newNotePatientId,
        staff_id: staffId,
        note_content: newNoteContent,
      });

      setNotes([newNote, ...notes]);
      setNewNoteModalVisible(false);
      setNewNoteContent('');
      setNewNotePatientId('');

      RNAlert.alert('Success', 'Therapy note created successfully');
    } catch (error) {
      console.error('Failed to create note:', error);
      RNAlert.alert('Error', 'Failed to create therapy note');
    }
  };

  const handleAddAssessment = async () => {
    if (!assessmentType || !assessmentPatientId) {
      RNAlert.alert('Validation Error', 'Please select assessment type and patient');
      return;
    }

    try {
      const newAssessment = await assessmentAPI.create({
        patient_id: parseInt(assessmentPatientId),
        assessment_type: assessmentType,
        notes: assessmentNotes,
        status: 'scheduled',
      });

      setAssessments([newAssessment.data || newAssessment, ...assessments]);
      setNewAssessmentModalVisible(false);
      setAssessmentType('');
      setAssessmentPatientId('');
      setAssessmentNotes('');

      RNAlert.alert('Success', 'Assessment scheduled successfully');
    } catch (error) {
      console.error('Failed to create assessment:', error);
      RNAlert.alert('Error', 'Failed to schedule assessment');
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
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SettingsNew')}
                activeOpacity={0.7}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonIcon}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('WelcomeNew')}
                activeOpacity={0.7}
                style={styles.headerButton}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>{staffId}</Text>
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
              leftIcon="🔍"
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
                onPress={() => setNewNoteModalVisible(true)}
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
                    notes.slice(0, 5).map((note) => (
                      <View key={note.id} style={styles.noteItem}>
                        <View style={styles.noteHeader}>
                          <Text style={styles.noteTitle}>
                            Note - {patients.find((p) => p.id === note.patient_mrn)?.name || note.patient_mrn}
                          </Text>
                          <Text style={styles.noteDate}>
                            {new Date(note.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.noteContent} numberOfLines={2}>
                          {note.note_content}
                        </Text>
                      </View>
                    ))
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

            <View style={styles.assessmentList}>
              {assessments.map((assessment: any) => {
                const patient = patients.find(p => String(p.id) === String(assessment.patient_id));
                return (
                  <TouchableOpacity key={assessment.id} activeOpacity={0.7}>
                    <Card style={styles.assessmentCard}>
                      <CardContent style={styles.assessmentContent}>
                        <View style={styles.assessmentInfo}>
                          <Text style={styles.assessmentType}>{assessment.assessment_type}</Text>
                          <Text style={styles.assessmentPatient}>
                            {patient?.name || `Patient ${assessment.patient_id}`}
                          </Text>
                          <Text style={styles.assessmentDate}>
                            {assessment.scheduled_date || new Date(assessment.created_at).toLocaleDateString()}
                          </Text>
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

            <Card style={styles.toolsCard}>
              <CardHeader>
                <CardTitle>Available Assessment Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.toolsGrid}>
                  {assessmentTools.map((tool, index) => (
                    <Badge key={index} variant="outline" style={styles.toolBadge}>
                      {tool}
                    </Badge>
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
        transparent={true}
        onRequestClose={() => setNewPatientModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Patient</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Patient Name *"
              value={newPatientName}
              onChangeText={setNewPatientName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Date of Birth (YYYY-MM-DD) *"
              value={newPatientDOB}
              onChangeText={setNewPatientDOB}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Gender (M/F/Other) *"
              value={newPatientGender}
              onChangeText={setNewPatientGender}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Contact Number"
              value={newPatientContact}
              onChangeText={setNewPatientContact}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Diagnosis"
              value={newPatientDiagnosis}
              onChangeText={setNewPatientDiagnosis}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewPatientModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddPatient}
              >
                <Text style={styles.saveButtonText}>Add Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Note Modal */}
      <Modal
        visible={newNoteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Therapy Note</Text>

            <Text style={styles.modalLabel}>Select Patient *</Text>
            <ScrollView style={styles.patientSelector}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientOption,
                    newNotePatientId === patient.id && styles.patientOptionSelected,
                  ]}
                  onPress={() => setNewNotePatientId(patient.id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      newNotePatientId === patient.id && styles.patientOptionTextSelected,
                    ]}
                  >
                    {patient.name} ({patient.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.modalInput, styles.noteTextArea]}
              placeholder="Note Content *"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewNoteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddNote}
              >
                <Text style={styles.saveButtonText}>Create Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Assessment Modal */}
      <Modal
        visible={newAssessmentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewAssessmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Assessment</Text>

            <Text style={styles.modalLabel}>Assessment Type *</Text>
            <ScrollView style={styles.assessmentSelector}>
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

            <Text style={styles.modalLabel}>Select Patient *</Text>
            <ScrollView style={styles.patientSelector}>
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

            <TextInput
              style={[styles.modalInput, styles.noteTextArea]}
              placeholder="Assessment Notes (optional)"
              value={assessmentNotes}
              onChangeText={setAssessmentNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonIcon: {
    fontSize: 20,
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
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  noteContent: {
    fontSize: 14,
    color: '#6b7280',
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
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
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
    height: 120,
    textAlignVertical: 'top',
  },
  patientSelector: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  patientOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  patientOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  patientOptionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  patientOptionTextSelected: {
    fontWeight: '600',
    color: '#1e40af',
  },
  assessmentSelector: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  assessmentOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  assessmentOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  assessmentOptionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  assessmentOptionTextSelected: {
    fontWeight: '600',
    color: '#1e40af',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
});
