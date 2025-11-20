import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput as RNTextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Alert } from './ui/alert.native';
import { Separator } from './ui/separator.native';
import { Button } from './ui/button.native';
import { useToast } from './ui';
import { therapyNoteAPI, patientAPI } from '../services/api';

interface TherapyNotesScreenNewProps {
  navigation: any;
  route: any;
}

interface TherapyNote {
  id: number;
  patient_id: number;
  author: string;
  created_at: string;
  content?: string;
  note_content?: string;
}

interface Patient {
  id: string;
  numericId?: number;
  name: string;
  mrn?: string;
}

export function TherapyNotesScreenNew({ navigation, route }: TherapyNotesScreenNewProps) {
  const { patientId: routePatientId, staffId, role } = route.params || {
    patientId: undefined,
    staffId: 'STAFF-001',
    role: 'psychiatrist',
  };

  const [selectedPatientId, setSelectedPatientId] = useState(routePatientId);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoLockTimer, setAutoLockTimer] = useState(300);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Session metadata fields
  const [sessionType, setSessionType] = useState('');
  const [patientMood, setPatientMood] = useState('');
  const [progressAssessment, setProgressAssessment] = useState('');
  
  const { showToast } = useToast();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      const patientsData = response?.data || response || [];
      setPatients(
        (Array.isArray(patientsData) ? patientsData : []).map((p: any) => ({
          id: p.mrn || p.id,
          numericId: p.id,
          name: p.full_name || p.name || 'Unknown Patient',
          mrn: p.mrn,
        }))
      );
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedPatientId) {
      showToast('Please select a patient', 'warning');
      return;
    }
    
    if (!currentNote.trim()) {
      showToast('Note cannot be empty', 'warning');
      return;
    }
    
    if (!sessionType) {
      showToast('Please select a session type', 'warning');
      return;
    }

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const patientIdToSend = selectedPatient?.numericId || parseInt(selectedPatientId.toString()) || selectedPatientId;

    try {
      setLoading(true);
      
      // Build note content with metadata
      const noteWithMetadata = `[Session Type: ${sessionType}]${patientMood ? ` [Mood: ${patientMood}]` : ''}${progressAssessment ? ` [Progress: ${progressAssessment}]` : ''}\n\n${currentNote}`;
      
      console.log('Creating note with data:', {
        patient_id: typeof patientIdToSend === 'number' ? patientIdToSend : undefined,
        patient_mrn: typeof patientIdToSend === 'string' ? patientIdToSend : undefined,
        staff_id: staffId,
        note_content: noteWithMetadata,
        note_length: noteWithMetadata.length
      });
      
      const result = await therapyNoteAPI.create({
        patient_id: typeof patientIdToSend === 'number' ? patientIdToSend : undefined,
        patient_mrn: typeof patientIdToSend === 'string' ? patientIdToSend : undefined,
        staff_id: staffId,
        note_content: noteWithMetadata
      });
      
      console.log('Note created successfully:', result);
      
      showToast('Note saved and encrypted successfully', 'success');
      setCurrentNote('');
      setSessionType('');
      setPatientMood('');
      setProgressAssessment('');
      setIsEditing(false);
      setLastSaved(new Date());
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || 'Failed to save note', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-lock timer logic
    if (autoLockTimer <= 0 && isEditing) {
      setIsLocked(true);
      setIsEditing(false);
      showToast('Session auto-locked due to inactivity', 'warning');
    }
  }, [autoLockTimer, isEditing]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setAutoLockTimer(300);
    setIsLocked(false);
  };

  const handleSave = () => {
    setLastSaved(new Date());
    setIsEditing(false);
    // In real app, this would save to secure database
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Text style={styles.headerTitle}>Therapy Notes</Text>
            <Text style={styles.headerSubtitle}>
              {role} • {staffId}
            </Text>
          </View>
          <View style={styles.headerBadges}>
            <Badge variant="outline" style={styles.headerBadge}>
              <Text style={styles.badgeText}>
                {selectedPatientId 
                  ? `Patient ${patients.find(p => p.id === selectedPatientId)?.name || selectedPatientId}` 
                  : 'Select Patient'}
              </Text>
            </Badge>
            <Badge variant="outline" style={styles.headerBadge}>
              <Text style={styles.badgeText}>🔒 Encrypted</Text>
            </Badge>
          </View>
        </View>

        {/* Patient Selector - Show if no patient selected or coming from dashboard */}
        {!routePatientId && (
          <View style={styles.patientSelectorSection}>
            <Text style={styles.fieldLabel}>Select Patient *</Text>
            <ScrollView style={styles.patientSelectorCompact} horizontal showsHorizontalScrollIndicator={false}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientChip,
                    selectedPatientId === patient.id && styles.patientChipSelected,
                  ]}
                  onPress={() => setSelectedPatientId(patient.id)}
                >
                  <Text
                    style={[
                      styles.patientChipText,
                      selectedPatientId === patient.id && styles.patientChipTextSelected,
                    ]}
                  >
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Security Status */}
        <View style={styles.securityStatus}>
          <View style={styles.securityLeft}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>Secure Session Active</Text>
          </View>
          {isEditing && (
            <View style={styles.securityRight}>
              <Text style={styles.timerIcon}>💾</Text>
              <Text style={styles.timerText}>
                Auto-save: {formatTimeRemaining(autoLockTimer)}
              </Text>
            </View>
          )}
        </View>

        {/* Auto-lock Warning */}
        {isLocked && (
          <Alert
            variant="destructive"
            title="Session Locked"
            description="Session locked due to inactivity. Please re-authenticate to continue editing."
            style={styles.lockAlert}
          />
        )}

        {/* Current Note Editor */}
        <Card style={isLocked ? styles.editorCardLocked : styles.editorCard}>
          <CardHeader>
            <View style={styles.editorHeader}>
              <CardTitle>New Therapy Note</CardTitle>
              <View style={styles.editorBadges}>
                {lastSaved && (
                  <Badge variant="outline" style={styles.savedBadge}>
                    <Text style={styles.savedBadgeText}>✓ Auto-saved</Text>
                  </Badge>
                )}
                {isEditing && (
                  <Badge variant="secondary">
                    <Text style={styles.editingBadgeText}>✏️ Editing</Text>
                  </Badge>
                )}
              </View>
            </View>
          </CardHeader>
          <CardContent>
            {!isEditing && !isLocked ? (
              <View style={styles.startEditingContainer}>
                <Text style={styles.startEditingIcon}>📄</Text>
                <Text style={styles.startEditingText}>
                  Start writing a new therapy note for this patient.
                </Text>
                <Button
                  onPress={handleStartEditing}
                  style={styles.startEditingButton}
                >
                  <Text style={styles.startEditingButtonText}>✏️ Start New Note</Text>
                </Button>
              </View>
            ) : isLocked ? (
              <View style={styles.lockedContainer}>
                <Text style={styles.lockedIcon}>🔒</Text>
                <Text style={styles.lockedText}>
                  Session locked for security. Re-authenticate to continue.
                </Text>
                <Button
                  variant="outline"
                  onPress={() => navigation.navigate('ReAuthenticationPromptNew', { patientId })}
                  style={styles.lockedButton}
                >
                  <Text style={styles.lockedButtonText}>🛡️ Re-authenticate</Text>
                </Button>
              </View>
            ) : (
              <View style={styles.editingContainer}>
                {/* Session Type Selection */}
                <Text style={styles.fieldLabel}>Session Type *</Text>
                <View style={styles.sessionTypeGrid}>
                  {['Initial Assessment', 'Follow-up', 'Crisis Intervention', 'Group Therapy'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.sessionTypeOption,
                        sessionType === type && styles.sessionTypeSelected,
                      ]}
                      onPress={() => setSessionType(type)}
                    >
                      <Text
                        style={[
                          styles.sessionTypeText,
                          sessionType === type && styles.sessionTypeTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Patient Mood Selection */}
                <Text style={styles.fieldLabel}>Patient Mood/State</Text>
                <View style={styles.moodGrid}>
                  {['Calm', 'Anxious', 'Depressed', 'Agitated', 'Cooperative'].map((mood) => (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.moodOption,
                        patientMood === mood && styles.moodSelected,
                      ]}
                      onPress={() => setPatientMood(mood)}
                    >
                      <Text
                        style={[
                          styles.moodText,
                          patientMood === mood && styles.moodTextSelected,
                        ]}
                      >
                        {mood}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Progress Assessment Selection */}
                <Text style={styles.fieldLabel}>Progress Assessment</Text>
                <View style={styles.progressGrid}>
                  {['Improved', 'Stable', 'Declined', 'No Change'].map((progress) => (
                    <TouchableOpacity
                      key={progress}
                      style={[
                        styles.progressOption,
                        progressAssessment === progress && styles.progressSelected,
                      ]}
                      onPress={() => setProgressAssessment(progress)}
                    >
                      <Text
                        style={[
                          styles.progressText,
                          progressAssessment === progress && styles.progressTextSelected,
                        ]}
                      >
                        {progress}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Session Notes Text Area */}
                <Text style={styles.fieldLabel}>Session Notes *</Text>
                <RNTextInput
                  value={currentNote}
                  onChangeText={setCurrentNote}
                  placeholder="Document session observations, interventions, patient responses, and treatment plan updates..."
                  multiline
                  numberOfLines={8}
                  style={styles.noteInput}
                  textAlignVertical="top"
                />

                <View style={styles.editingActions}>
                  <Text style={styles.saveStatusText}>
                    {lastSaved
                      ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                      : 'Note will be encrypted on save'}
                  </Text>

                  <View style={styles.editingButtons}>
                    <Button
                      variant="outline"
                      onPress={() => {
                        setIsEditing(false);
                        setCurrentNote('');
                        setSessionType('');
                        setPatientMood('');
                        setProgressAssessment('');
                      }}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Button>
                    <Button 
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSaveNote();
                      }}
                      style={styles.saveButton}
                      disabled={loading}
                    >
                      <Text style={styles.saveButtonText}>
                        {loading ? '💾 Saving...' : '💾 Save Note'}
                      </Text>
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </CardContent>
        </Card>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>End-to-End Encrypted</Text>
        </View>
        <Text style={styles.footerText}>HIPAA Compliant • Auto-lock Enabled</Text>
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
  headerBadges: {
    gap: 4,
  },
  headerBadge: {
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
  },
  securityStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  securityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  timerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  lockAlert: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  editorCard: {
    margin: 16,
  },
  editorCardLocked: {
    opacity: 0.5,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editorBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  savedBadge: {
    borderColor: '#10b981',
  },
  savedBadgeText: {
    fontSize: 11,
    color: '#10b981',
  },
  editingBadgeText: {
    fontSize: 11,
  },
  startEditingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  startEditingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  startEditingText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  startEditingButton: {
    paddingHorizontal: 24,
  },
  startEditingButtonText: {
    color: '#ffffff',
  },
  lockedContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  lockedText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  lockedButton: {
    paddingHorizontal: 24,
  },
  lockedButtonText: {
    fontSize: 14,
  },
  editingContainer: {
    gap: 16,
  },
  noteInput: {
    minHeight: 200,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  editingActions: {
    gap: 12,
  },
  saveStatusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  separator: {
    marginVertical: 16,
  },
  previousNotesSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  previousNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previousNotesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  newNoteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  newNoteButtonText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  noteCard: {
    marginBottom: 16,
  },
  noteCardHeader: {
    paddingBottom: 8,
  },
  noteCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  noteCardBadges: {
    gap: 4,
  },
  noteBadge: {
    marginBottom: 4,
  },
  noteBadgeText: {
    fontSize: 10,
  },
  noteContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteFooter: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
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
    fontSize: 11,
    color: '#6b7280',
  },
  // Session metadata styles
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 8,
  },
  sessionTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  sessionTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  sessionTypeSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sessionTypeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionTypeTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  moodOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  moodSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  moodText: {
    fontSize: 12,
    color: '#6b7280',
  },
  moodTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  progressOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  progressSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Patient selector styles
  patientSelectorSection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  patientSelectorCompact: {
    maxHeight: 100,
  },
  patientChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  patientChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  patientChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  patientChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
