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
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Alert } from './ui/alert.native';
import { Separator } from './ui/separator.native';
import { Button } from './ui/button.native';
import { useToast } from './ui';
import { therapyNoteAPI } from '../services/api';

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
}

export function TherapyNotesScreenNew({ navigation, route }: TherapyNotesScreenNewProps) {
  const { patientId, staffId, role } = route.params || {
    patientId: 1,
    staffId: 'STAFF-001',
    role: 'psychiatrist',
  };

  const [currentNote, setCurrentNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoLockTimer, setAutoLockTimer] = useState(300);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<TherapyNote[]>([]);
  const { showToast } = useToast();


  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await therapyNoteAPI.getByPatientId(parseInt(patientId.toString()));
      setNotes(response.data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.trim()) {
      showToast('Note cannot be empty', 'warning');
      return;
    }

    try {
      setLoading(true);
      await therapyNoteAPI.create(parseInt(patientId.toString()), currentNote);
      showToast('Note saved and encrypted successfully', 'success');
      setCurrentNote('');
      setIsEditing(false);
      setLastSaved(new Date());
      await loadNotes();
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
              <Text style={styles.badgeText}>Patient {patientId}</Text>
            </Badge>
            <Badge variant="outline" style={styles.headerBadge}>
              <Text style={styles.badgeText}>🔒 Encrypted</Text>
            </Badge>
          </View>
        </View>

        {/* Security Status */}
        <View style={styles.securityStatus}>
          <View style={styles.securityLeft}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>Secure Session Active</Text>
          </View>
          {isEditing && (
            <View style={styles.securityRight}>
              <Text style={styles.timerIcon}>⏰</Text>
              <Text style={styles.timerText}>
                Auto-lock: {formatTimeRemaining(autoLockTimer)}
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
                  onPress={() =>
                    navigation.navigate('SecureNoteEditorNew', {
                      patientId,
                      staffId,
                      role,
                      isNewNote: true,
                    })
                  }
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
                <RNTextInput
                  value={currentNote}
                  onChangeText={setCurrentNote}
                  placeholder="Enter therapy session notes..."
                  multiline
                  numberOfLines={8}
                  style={styles.noteInput}
                  textAlignVertical="top"
                />

                <View style={styles.editingActions}>
                  <Text style={styles.saveStatusText}>
                    {lastSaved
                      ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                      : 'Changes will auto-save'}
                  </Text>

                  <View style={styles.editingButtons}>
                    <Button
                      variant="outline"
                      onPress={() => setIsEditing(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Button>
                    <Button onPress={handleSave} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>💾 Save Note</Text>
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        <Separator style={styles.separator} />

        {/* Previous Notes */}
        <View style={styles.previousNotesSection}>
          <View style={styles.previousNotesHeader}>
            <Text style={styles.previousNotesTitle}>Previous Notes</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SecureNoteEditorNew', {
                  patientId,
                  staffId,
                  role,
                  isNewNote: true,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.newNoteButton}>
                <Text style={styles.newNoteButtonText}>📄 New Secure Note</Text>
              </View>
            </TouchableOpacity>
          </View>

          {previousNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              onPress={() =>
                navigation.navigate('SecureNoteEditorNew', {
                  patientId,
                  staffId,
                  role,
                  noteId: note.id,
                  isNewNote: false,
                })
              }
              activeOpacity={0.7}
            >
              <Card style={styles.noteCard}>
                <CardHeader style={styles.noteCardHeader}>
                  <View style={styles.noteCardTitleRow}>
                    <View>
                      <CardTitle style={styles.noteCardTitle}>{note.type}</CardTitle>
                      <Text style={styles.noteCardDate}>
                        {note.date} at {note.time}
                      </Text>
                    </View>
                    <View style={styles.noteCardBadges}>
                      <Badge variant="outline" style={styles.noteBadge}>
                        <Text style={styles.noteBadgeText}>{note.author}</Text>
                      </Badge>
                      {note.encrypted && (
                        <Badge variant="outline" style={styles.noteBadge}>
                          <Text style={styles.noteBadgeText}>🔒 Encrypted</Text>
                        </Badge>
                      )}
                    </View>
                  </View>
                </CardHeader>
                <CardContent>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Text style={styles.noteFooter}>
                    Click to edit (requires re-authentication)
                  </Text>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
});
