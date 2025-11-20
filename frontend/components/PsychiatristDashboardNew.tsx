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

interface PsychiatristDashboardNewProps {
  navigation: any;
  route: any;
}

interface Patient {
  id: string;
  name: string;
  diagnosis: string;
  lastVisit: string;
  medication: string;
}

interface Medication {
  patient: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: string;
}

interface Report {
  id: string;
  patient: string;
  type: string;
  date: string;
  status: string;
}

export function PsychiatristDashboardNew({ navigation, route }: PsychiatristDashboardNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-001' };
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [newPatientModalVisible, setNewPatientModalVisible] = useState(false);
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [newMedicationModalVisible, setNewMedicationModalVisible] = useState(false);

  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDOB, setNewPatientDOB] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('');
  const [newPatientContact, setNewPatientContact] = useState('');
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState('');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePatientId, setNewNotePatientId] = useState('');

  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [medicationPatientId, setMedicationPatientId] = useState('');

  const [newAppointmentModalVisible, setNewAppointmentModalVisible] = useState(false);
  const [appointmentPatientId, setAppointmentPatientId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');

  const [reportType, setReportType] = useState('clinical-summary');
  const [reportPatientId, setReportPatientId] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    setLoading(true);
    const patientsResponse = await patientAPI.getAll();
    const notesResponse = await therapyNoteAPI.getAll();

    const patientsData = patientsResponse?.data || patientsResponse || [];
    const notesData = notesResponse?.data || notesResponse || [];

    const patientsArray = Array.isArray(patientsData) ? patientsData : [];
    const notesArray = Array.isArray(notesData) ? notesData : [];

    // Map patient_id -> MRN so notes can show "Note - <patient name>"
    const patientIdToMrn = new Map<number, string>();
    patientsArray.forEach((p: any) => {
      if (p && p.id != null && p.mrn) {
        patientIdToMrn.set(p.id, p.mrn);
      }
    });

    setPatients(
      patientsArray.map((p: any) => ({
        id: p.mrn || p.id, // keep MRN as the external id used in the UI
        mrn: p.mrn,
        name: p.full_name || p.name,
        diagnosis: p.diagnosis || 'No diagnosis',
        lastVisit: new Date(p.created_at || Date.now())
          .toISOString()
          .split('T')[0],
        medication: p.current_medication || 'None prescribed',
      }))
    );

    setNotes(
      notesArray.map((n: any) => ({
        ...n,
        // ensure patient_mrn is always present for the UI
        patient_mrn:
          n.patient_mrn ||
          (n.patient_id != null ? patientIdToMrn.get(n.patient_id) : undefined) ||
          n.patient_id,
      }))
    );

    // Medications + reports still local state for now
    setMedications([]);
    setReports([]);
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
    const mrn = `MRN${Date.now()}`;

    const response = await patientAPI.create({
      mrn,
      full_name: newPatientName,
      dob: newPatientDOB,
      phone: newPatientContact,
      email: `patient${Date.now()}@hospital.local`,
    });

    const created = response?.data || response;

    // re-fetch from backend so list is dynamic
    await loadData();

    setNewPatientModalVisible(false);
    setNewPatientName('');
    setNewPatientDOB('');
    setNewPatientGender('');
    setNewPatientContact('');
    setNewPatientDiagnosis('');

    RNAlert.alert(
      'Success',
      `Patient ${(created && (created.full_name || created.name)) || newPatientName} added successfully`
    );
  } catch (error: any) {
    console.error('Failed to add patient:', error);
    RNAlert.alert('Error', error.message || 'Failed to add patient');
  }
};



  const handleAddNote = async () => {
  if (!newNoteContent || !newNotePatientId) {
    RNAlert.alert(
      'Validation Error',
      'Please select a patient and enter note content'
    );
    return;
  }

  try {
    // Send MRN as identifier – backend now resolves it to real patient_id
    const response = await therapyNoteAPI.create({
      patient_mrn: newNotePatientId,
      staff_id: staffId,
      note_content: newNoteContent,
    });

    const created = response?.data || response;

    // Reload everything from server so notes list is always up-to-date
    await loadData();

    setNewNoteModalVisible(false);
    setNewNoteContent('');
    setNewNotePatientId('');

    RNAlert.alert(
      'Success',
      created?.id
        ? 'Clinical note created & stored securely'
        : 'Clinical note created successfully'
    );
  } catch (error: any) {
    console.error('Failed to create note:', error);
    RNAlert.alert(
      'Error',
      error.message || 'Failed to create clinical note'
    );
  }
};


  const handleAddMedication = async () => {
    if (!medicationName || !medicationDosage || !medicationFrequency || !medicationPatientId) {
      RNAlert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newMed: Medication = {
        patient: medicationPatientId,
        name: medicationName,
        dosage: medicationDosage,
        frequency: medicationFrequency,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
      };

      setMedications([newMed, ...medications]);
      setNewMedicationModalVisible(false);
      setMedicationName('');
      setMedicationDosage('');
      setMedicationFrequency('');
      setMedicationPatientId('');

      RNAlert.alert('Success', 'Medication prescribed successfully');
    } catch (error) {
      console.error('Failed to prescribe medication:', error);
      RNAlert.alert('Error', 'Failed to prescribe medication');
    }
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentPatientId || !appointmentDate || !appointmentTime) {
      RNAlert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Schedule appointment with API or local state
      // For now, just show success and close modal
      setNewAppointmentModalVisible(false);
      setAppointmentPatientId('');
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentReason('');

      RNAlert.alert('Success', 'Appointment scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      RNAlert.alert('Error', 'Failed to schedule appointment');
    }
  };

  const handleGenerateReport = async () => {
    if (!reportPatientId) {
      RNAlert.alert('Validation Error', 'Please select a patient');
      return;
    }

    try {
      setGeneratingReport(true);
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newReport: Report = {
        id: `RPT${Date.now()}`,
        patient: reportPatientId,
        type: reportType,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
      };

      setReports([newReport, ...reports]);
      setReportPatientId('');
      setReportType('clinical-summary');
      setGeneratingReport(false);

      RNAlert.alert('Success', 'Report generated successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      setGeneratingReport(false);
      RNAlert.alert('Error', 'Failed to generate report');
    }
  };

  const getPatientStatistics = () => {
    return {
      totalPatients: patients.length,
      totalNotes: notes.length,
      totalReports: reports.length,
      activeMedications: medications.filter(m => m.status === 'active').length,
    };
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'inactive') return 'secondary';
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
              <Text style={styles.headerIcon}>🏥</Text>
              <Text style={styles.headerTitle}>Psychiatrist Dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('SettingsNew')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Dr. {staffId}</Text>
        </View>

        {/* Security Alert */}
        <Alert
          variant="default"
          title="2 suspicious activity alert(s) require your attention"
          style={styles.alertBanner}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="patients" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Patient Records</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setNewPatientModalVisible(true)}
              >
                <Text style={styles.addButtonText}>+ New Patient</Text>
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
              {filteredPatients.length === 0 ? (
                <Text style={styles.emptyText}>No patients found</Text>
              ) : (
                filteredPatients.map((patient) => (
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
                          <CardTitle>{patient.name}</CardTitle>
                          <Badge variant="outline" textStyle={styles.badgeText}>
                            {patient.id}
                          </Badge>
                        </View>
                      </CardHeader>
                      <CardContent>
                        <View style={styles.patientDetails}>
                          <View style={styles.patientDetailRow}>
                            <View style={styles.patientDetailItem}>
                              <Text style={styles.detailLabel}>Diagnosis</Text>
                              <Text style={styles.detailValue}>{patient.diagnosis}</Text>
                            </View>
                            <View style={styles.patientDetailItem}>
                              <Text style={styles.detailLabel}>Last Visit</Text>
                              <Text style={styles.detailValue}>{patient.lastVisit}</Text>
                            </View>
                          </View>
                          <View style={styles.patientDetailFull}>
                            <Text style={styles.detailLabel}>Current Medication</Text>
                            <Text style={styles.detailValue}>{patient.medication}</Text>
                          </View>
                        </View>
                      </CardContent>
                    </Card>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Appointments</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setNewAppointmentModalVisible(true)}
              >
                <Text style={styles.addButtonText}>📅 Schedule</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.notesCard}>
              <CardContent>
                <Text style={styles.notesDescription}>
                  View and manage upcoming and past appointments with patients.
                </Text>
                <Text style={styles.emptyText}>No appointments scheduled</Text>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Clinical Notes</Text>
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
                  Access to clinical assessment notes, treatment plans, and patient observations.
                </Text>

                <View style={styles.notesList}>
                  {notes.length === 0 ? (
                    <Text style={styles.emptyText}>No clinical notes yet</Text>
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

          {/* Medications Tab */}
          <TabsContent value="medications">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Prescriptions</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setNewMedicationModalVisible(true)}
              >
                <Text style={styles.addButtonText}>💊 New Rx</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.medicationList}>
              {medications.length === 0 ? (
                <Card style={styles.notesCard}>
                  <CardContent>
                    <Text style={styles.emptyText}>No active prescriptions</Text>
                  </CardContent>
                </Card>
              ) : (
                medications.map((medication, index) => (
                  <Card key={index} style={styles.medicationCard}>
                    <CardContent style={styles.medicationContent}>
                      <View style={styles.medicationInfo}>
                        <Text style={styles.medicationName}>{medication.name}</Text>
                        <Text style={styles.medicationPatient}>
                          Patient: {patients.find((p) => p.id === medication.patient)?.name || medication.patient}
                        </Text>
                        <View style={styles.medicationDetails}>
                          <Text style={styles.medicationDetail}>
                            Dosage: {medication.dosage}
                          </Text>
                          <Text style={styles.medicationDetail}>
                            Frequency: {medication.frequency}
                          </Text>
                        </View>
                      </View>
                      <Badge variant={getStatusBadgeVariant(medication.status)} textStyle={styles.statusBadgeText}>
                        {medication.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </View>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Reports</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setReportPatientId('')}
              >
                <Text style={styles.addButtonText}>📊 Generate</Text>
              </TouchableOpacity>
            </View>

            {/* Patient Statistics Cards */}
            <View style={styles.statisticsGrid}>
              <Card style={styles.statisticCard}>
                <CardContent style={styles.statisticContent}>
                  <Text style={styles.statisticIcon}>👥</Text>
                  <Text style={styles.statisticValue}>{getPatientStatistics().totalPatients}</Text>
                  <Text style={styles.statisticLabel}>Total Patients</Text>
                </CardContent>
              </Card>
              <Card style={styles.statisticCard}>
                <CardContent style={styles.statisticContent}>
                  <Text style={styles.statisticIcon}>📝</Text>
                  <Text style={styles.statisticValue}>{getPatientStatistics().totalNotes}</Text>
                  <Text style={styles.statisticLabel}>Clinical Notes</Text>
                </CardContent>
              </Card>
              <Card style={styles.statisticCard}>
                <CardContent style={styles.statisticContent}>
                  <Text style={styles.statisticIcon}>💊</Text>
                  <Text style={styles.statisticValue}>{getPatientStatistics().activeMedications}</Text>
                  <Text style={styles.statisticLabel}>Active Meds</Text>
                </CardContent>
              </Card>
              <Card style={styles.statisticCard}>
                <CardContent style={styles.statisticContent}>
                  <Text style={styles.statisticIcon}>📊</Text>
                  <Text style={styles.statisticValue}>{getPatientStatistics().totalReports}</Text>
                  <Text style={styles.statisticLabel}>Reports</Text>
                </CardContent>
              </Card>
            </View>

            <Card style={styles.notesCard}>
              <CardContent>
                <Text style={styles.notesDescription}>
                  Clinical summaries, diagnosis reports, and treatment progress documentation.
                </Text>

                <View style={styles.reportsList}>
                  {reports.length === 0 ? (
                    <Text style={styles.emptyText}>No reports generated yet</Text>
                  ) : (
                    reports.map((report) => (
                      <View key={report.id} style={styles.reportItem}>
                        <View style={styles.reportHeader}>
                          <Text style={styles.reportTitle}>
                            {report.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                          <Badge variant="outline" textStyle={styles.badgeText}>
                            {report.status}
                          </Badge>
                        </View>
                        <Text style={styles.reportDate}>{report.date}</Text>
                        <Text style={styles.reportPatient}>
                          Patient: {patients.find((p) => p.id === report.patient)?.name || report.patient}
                        </Text>
                      </View>
                    ))
                  )}
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
            <Text style={styles.modalTitle}>Create Clinical Note</Text>

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
              placeholder="Clinical Note *"
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

      {/* New Medication Modal */}
      <Modal
        visible={newMedicationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewMedicationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Prescribe Medication</Text>

            <Text style={styles.modalLabel}>Select Patient *</Text>
            <ScrollView style={styles.patientSelector}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientOption,
                    medicationPatientId === patient.id && styles.patientOptionSelected,
                  ]}
                  onPress={() => setMedicationPatientId(patient.id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      medicationPatientId === patient.id && styles.patientOptionTextSelected,
                    ]}
                  >
                    {patient.name} ({patient.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.modalInput}
              placeholder="Medication Name *"
              value={medicationName}
              onChangeText={setMedicationName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Dosage (e.g., 50mg) *"
              value={medicationDosage}
              onChangeText={setMedicationDosage}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Frequency (e.g., Twice daily) *"
              value={medicationFrequency}
              onChangeText={setMedicationFrequency}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewMedicationModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMedication}
              >
                <Text style={styles.saveButtonText}>Prescribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Appointment Modal */}
      <Modal
        visible={newAppointmentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewAppointmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Appointment</Text>

            <Text style={styles.modalLabel}>Select Patient *</Text>
            <ScrollView style={styles.patientSelector}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientOption,
                    appointmentPatientId === patient.id && styles.patientOptionSelected,
                  ]}
                  onPress={() => setAppointmentPatientId(patient.id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      appointmentPatientId === patient.id && styles.patientOptionTextSelected,
                    ]}
                  >
                    {patient.name} ({patient.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.modalInput}
              placeholder="Date (YYYY-MM-DD) *"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Time (HH:MM) *"
              value={appointmentTime}
              onChangeText={setAppointmentTime}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for Appointment"
              value={appointmentReason}
              onChangeText={setAppointmentReason}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewAppointmentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleScheduleAppointment}
              >
                <Text style={styles.saveButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        visible={reportPatientId !== undefined && reportPatientId !== ''}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportPatientId('')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Report</Text>

            <Text style={styles.modalLabel}>Select Patient *</Text>
            <ScrollView style={styles.patientSelector}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientOption,
                    reportPatientId === patient.id && styles.patientOptionSelected,
                  ]}
                  onPress={() => setReportPatientId(patient.id)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      reportPatientId === patient.id && styles.patientOptionTextSelected,
                    ]}
                  >
                    {patient.name} ({patient.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Report Type *</Text>
            <ScrollView style={styles.patientSelector}>
              {['clinical-summary', 'diagnosis-report', 'treatment-progress', 'medication-review'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.patientOption,
                    reportType === type && styles.patientOptionSelected,
                  ]}
                  onPress={() => setReportType(type)}
                >
                  <Text
                    style={[
                      styles.patientOptionText,
                      reportType === type && styles.patientOptionTextSelected,
                    ]}
                  >
                    {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setReportPatientId('')}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleGenerateReport}
                disabled={generatingReport}
              >
                <Text style={styles.saveButtonText}>
                  {generatingReport ? 'Generating...' : 'Generate'}
                </Text>
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
  settingsIcon: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  alertBanner: {
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
    backgroundColor: '#1f2937',
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 13,
    color: '#ffffff',
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
    marginBottom: 0,
  },
  patientDetailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  patientDetailItem: {
    flex: 1,
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
    fontWeight: '500',
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
  medicationList: {
    marginBottom: 16,
  },
  medicationCard: {
    marginBottom: 12,
  },
  medicationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  medicationPatient: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  medicationDetails: {
    gap: 4,
  },
  medicationDetail: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadgeText: {
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
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statisticCard: {
    width: '48%',
    marginBottom: 12,
  },
  statisticContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statisticIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statisticValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statisticLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  reportsList: {
    gap: 12,
  },
  reportItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  reportDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  reportPatient: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
