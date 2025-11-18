import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput as RNTextInput,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Alert } from './ui/alert.native';
import { Button } from './ui/button.native';
import { Input } from './ui/input.native';
import { useToast } from './ui/toast.native';
import { Menu, IconButton } from 'react-native-paper';

interface SecureNoteEditorNewProps {
  navigation: any;
  route: any;
}

export function SecureNoteEditorNew({ navigation, route }: SecureNoteEditorNewProps) {
  const { patientId, staffId, role, noteId, isNewNote = true } = route.params || {
    patientId: 'P001',
    staffId: 'STAFF-001',
    role: 'psychiatrist',
    isNewNote: true,
  };

  const { showToast } = useToast();

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState(new Date().toTimeString().slice(0, 5));
  const [sessionType, setSessionType] = useState('');
  const [patientMood, setPatientMood] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [interventions, setInterventions] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [nextSession, setNextSession] = useState('');

  const [autoSaveTimer, setAutoSaveTimer] = useState(300); // 5 minutes
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showEmergencyOverride, setShowEmergencyOverride] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isEmergencyAccess, setIsEmergencyAccess] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const [sessionTypeMenu, setSessionTypeMenu] = useState(false);
  const [moodMenu, setMoodMenu] = useState(false);

  // Mock existing note data
  const existingNote = {
    id: noteId || 'N004',
    version: 2,
    created: '2024-10-02 14:00',
    lastModified: '2024-10-02 14:30',
    author: staffId,
  };

  // Version history
  const versionHistory = [
    {
      version: 2,
      timestamp: '2024-10-02 14:30',
      author: staffId,
      changes: 'Updated treatment plan and next session date',
    },
    {
      version: 1,
      timestamp: '2024-10-02 14:00',
      author: staffId,
      changes: 'Initial note creation',
    },
  ];

  // Auto-save timer
  useEffect(() => {
    if (hasUnsavedChanges && autoSaveTimer > 0) {
      const timer = setTimeout(() => {
        setAutoSaveTimer(autoSaveTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoSaveTimer === 0 && hasUnsavedChanges) {
      handleAutoSave();
    }
  }, [autoSaveTimer, hasUnsavedChanges]);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
    setAutoSaveTimer(300);
  }, [
    sessionDate,
    sessionTime,
    sessionType,
    patientMood,
    symptoms,
    interventions,
    treatmentPlan,
    additionalNotes,
    nextSession,
  ]);

  const handleAutoSave = () => {
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    setAutoSaveTimer(300);
  };

  const handleSave = () => {
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    showToast('Note saved successfully', 'success');
    navigation.goBack();
  };

  const handleEmergencyAccess = () => {
    if (!emergencyReason.trim()) return;

    setIsEmergencyAccess(true);
    setShowEmergencyOverride(false);
    showToast('Emergency access granted - this action has been logged', 'warning');
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showEmergencyOverride) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.emergencyHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowEmergencyOverride(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.emergencyTitle}>Emergency Access Override</Text>
          </View>

          <Alert
            variant="destructive"
            title="WARNING"
            description="Emergency access bypasses security protocols. This action will be logged and flagged for administrator review."
            style={styles.emergencyAlert}
          />

          <Card style={styles.emergencyCard}>
            <CardHeader>
              <CardTitle>Justify Emergency Access</CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={styles.emergencyLabel}>Emergency Reason (Required)</Text>
              <RNTextInput
                value={emergencyReason}
                onChangeText={setEmergencyReason}
                placeholder="Explain the medical emergency or critical situation requiring immediate access..."
                multiline
                numberOfLines={4}
                style={styles.emergencyInput}
                textAlignVertical="top"
              />

              <View style={styles.emergencyDisclaimer}>
                <Text style={styles.disclaimerTitle}>By proceeding, you acknowledge:</Text>
                <Text style={styles.disclaimerItem}>
                  • This action bypasses standard security protocols
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Full audit log will be created and reviewed
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Administrative approval may be required
                </Text>
                <Text style={styles.disclaimerItem}>
                  • Misuse may result in access suspension
                </Text>
              </View>

              <View style={styles.emergencyButtons}>
                <Button
                  variant="outline"
                  onPress={() => setShowEmergencyOverride(false)}
                  style={styles.emergencyCancelButton}
                >
                  <Text style={styles.emergencyCancelText}>Cancel</Text>
                </Button>
                <Button
                  variant="destructive"
                  onPress={handleEmergencyAccess}
                  disabled={!emergencyReason.trim()}
                  style={styles.emergencyGrantButton}
                >
                  <Text style={styles.emergencyGrantText}>⚠️ Grant Emergency Access</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </ScrollView>
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
            <Text style={styles.headerTitle}>
              {isNewNote ? 'New Session Note' : 'Edit Session Note'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {role} • {staffId}
            </Text>
          </View>
          <View style={styles.headerBadges}>
            <Badge variant="outline">
              <Text style={styles.badgeText}>Patient {patientId}</Text>
            </Badge>
            {isEmergencyAccess && (
              <Badge variant="destructive">
                <Text style={styles.emergencyBadgeText}>⚠️ Emergency Access</Text>
              </Badge>
            )}
          </View>
        </View>

        {/* Security Warning */}
        <Alert
          variant="destructive"
          title="Security Notice"
          description={`These notes are encrypted. Do not copy/paste outside this system. Auto-lock in ${formatTimeRemaining(
            autoSaveTimer
          )}.`}
          style={styles.securityAlert}
        />

        {/* Version Info */}
        {!isNewNote && (
          <View style={styles.versionInfo}>
            <View style={styles.versionHeader}>
              <View style={styles.versionLeft}>
                <Text style={styles.versionIcon}>📜</Text>
                <Text style={styles.versionText}>
                  Version {existingNote.version} • Last modified: {existingNote.lastModified}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowVersionHistory(!showVersionHistory)}>
                <Text style={styles.versionButton}>View History</Text>
              </TouchableOpacity>
            </View>

            {showVersionHistory && (
              <View style={styles.versionHistory}>
                {versionHistory.map((version) => (
                  <View key={version.version} style={styles.versionItem}>
                    <View style={styles.versionItemHeader}>
                      <Text style={styles.versionItemVersion}>Version {version.version}</Text>
                      <Text style={styles.versionItemTime}>{version.timestamp}</Text>
                    </View>
                    <Text style={styles.versionItemChanges}>{version.changes}</Text>
                    <Text style={styles.versionItemAuthor}>{version.author}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Session Information */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Text style={styles.inputLabel}>Session Date</Text>
                <Input
                  value={sessionDate}
                  onChangeText={setSessionDate}
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
              </View>
              <View style={styles.dateTimeItem}>
                <Text style={styles.inputLabel}>Session Time</Text>
                <Input
                  value={sessionTime}
                  onChangeText={setSessionTime}
                  placeholder="HH:MM"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Session Type</Text>
            <Menu
              visible={sessionTypeMenu}
              onDismiss={() => setSessionTypeMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSessionTypeMenu(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {sessionType || 'Select session type'}
                  </Text>
                  <Text style={styles.selectButtonArrow}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSessionType('Individual Therapy');
                  setSessionTypeMenu(false);
                }}
                title="Individual Therapy"
              />
              <Menu.Item
                onPress={() => {
                  setSessionType('Group Therapy');
                  setSessionTypeMenu(false);
                }}
                title="Group Therapy"
              />
              <Menu.Item
                onPress={() => {
                  setSessionType('Family Therapy');
                  setSessionTypeMenu(false);
                }}
                title="Family Therapy"
              />
              <Menu.Item
                onPress={() => {
                  setSessionType('Assessment');
                  setSessionTypeMenu(false);
                }}
                title="Assessment"
              />
              <Menu.Item
                onPress={() => {
                  setSessionType('Consultation');
                  setSessionTypeMenu(false);
                }}
                title="Consultation"
              />
            </Menu>
          </CardContent>
        </Card>

        {/* Clinical Assessment */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Clinical Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={styles.inputLabel}>Patient Mood/Affect</Text>
            <Menu
              visible={moodMenu}
              onDismiss={() => setMoodMenu(false)}
              anchor={
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setMoodMenu(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {patientMood || 'Select patient mood'}
                  </Text>
                  <Text style={styles.selectButtonArrow}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={() => { setPatientMood('Stable'); setMoodMenu(false); }} title="Stable" />
              <Menu.Item onPress={() => { setPatientMood('Anxious'); setMoodMenu(false); }} title="Anxious" />
              <Menu.Item onPress={() => { setPatientMood('Depressed'); setMoodMenu(false); }} title="Depressed" />
              <Menu.Item onPress={() => { setPatientMood('Agitated'); setMoodMenu(false); }} title="Agitated" />
              <Menu.Item onPress={() => { setPatientMood('Elevated'); setMoodMenu(false); }} title="Elevated" />
              <Menu.Item onPress={() => { setPatientMood('Withdrawn'); setMoodMenu(false); }} title="Withdrawn" />
            </Menu>

            <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>Current Symptoms</Text>
            <RNTextInput
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Document current symptoms, behaviors, and observations..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              textAlignVertical="top"
            />
          </CardContent>
        </Card>

        {/* Treatment Details */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Treatment & Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={styles.inputLabel}>Interventions Used</Text>
            <RNTextInput
              value={interventions}
              onChangeText={setInterventions}
              placeholder="Describe therapeutic interventions, techniques, and approaches used..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>Treatment Plan Updates</Text>
            <RNTextInput
              value={treatmentPlan}
              onChangeText={setTreatmentPlan}
              placeholder="Document changes to treatment plan, goals, and recommendations..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              textAlignVertical="top"
            />
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={styles.inputLabel}>Session Notes</Text>
            <RNTextInput
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="Additional observations, patient feedback, and clinical notes..."
              multiline
              numberOfLines={5}
              style={styles.textArea}
              textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>Next Session Plan</Text>
            <Input
              value={nextSession}
              onChangeText={setNextSession}
              placeholder="Scheduled date and plan for next session..."
              style={styles.input}
            />
          </CardContent>
        </Card>

        {/* Emergency Override */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencySeparator} />
          <Button
            variant="destructive"
            onPress={() => setShowEmergencyOverride(true)}
            style={styles.emergencyButton}
          >
            <Text style={styles.emergencyButtonText}>⚠️ Emergency Access Override</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={styles.saveStatus}>
          {lastSaved ? (
            <View style={styles.saveStatusRow}>
              <Text style={styles.saveStatusIcon}>✓</Text>
              <Text style={styles.saveStatusText}>
                Last saved: {lastSaved.toLocaleTimeString()}
              </Text>
            </View>
          ) : hasUnsavedChanges ? (
            <View style={styles.saveStatusRow}>
              <Text style={styles.saveStatusIcon}>⏰</Text>
              <Text style={styles.saveStatusText}>
                Auto-save in {formatTimeRemaining(autoSaveTimer)}
              </Text>
            </View>
          ) : (
            <Text style={styles.saveStatusText}>No changes</Text>
          )}

          <Badge variant="outline">
            <Text style={styles.encryptedBadgeText}>🔒 Encrypted</Text>
          </Badge>
        </View>

        <View style={styles.buttonRow}>
          <Button variant="outline" onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Button>
          <Button
            onPress={handleSave}
            disabled={!hasUnsavedChanges}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>💾 Save Note</Text>
          </Button>
        </View>
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
  badgeText: {
    fontSize: 11,
  },
  emergencyBadgeText: {
    fontSize: 11,
    color: '#ffffff',
  },
  securityAlert: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  versionInfo: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  versionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  versionButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  versionHistory: {
    marginTop: 16,
    gap: 12,
  },
  versionItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  versionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  versionItemVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  versionItemTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  versionItemChanges: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  versionItemAuthor: {
    fontSize: 12,
    color: '#9ca3af',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  inputLabelSpaced: {
    marginTop: 16,
  },
  input: {
    marginBottom: 0,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  selectButtonArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  textArea: {
    minHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  emergencySection: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  emergencySeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  emergencyButton: {
    width: '100%',
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  actionButtons: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  saveStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveStatusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  saveStatusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  encryptedBadgeText: {
    fontSize: 11,
  },
  buttonRow: {
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
  // Emergency override styles
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  emergencyAlert: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  emergencyCard: {
    marginHorizontal: 16,
  },
  emergencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emergencyInput: {
    minHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 16,
  },
  emergencyDisclaimer: {
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  disclaimerItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 8,
  },
  emergencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyCancelButton: {
    flex: 1,
  },
  emergencyCancelText: {
    fontSize: 14,
  },
  emergencyGrantButton: {
    flex: 1,
  },
  emergencyGrantText: {
    color: '#ffffff',
    fontSize: 14,
  },
});
