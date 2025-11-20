import React from 'react';
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

interface TherapyNoteDetailScreenProps {
  navigation: any;
  route: any;
}

export function TherapyNoteDetailScreen({ navigation, route }: TherapyNoteDetailScreenProps) {
  const { note } = route.params || {};

  console.log('TherapyNoteDetailScreen received note:', note);

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Note not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Parse metadata from note content
  const noteContent = note.note_content || note.content || '';
  console.log('Note content to display:', noteContent);
  
  const parseMetadata = (content: string) => {
    const sessionTypeMatch = content.match(/\[Session Type: (.+?)\]/);
    const moodMatch = content.match(/\[Mood: (.+?)\]/);
    const progressMatch = content.match(/\[Progress: (.+?)\]/);
    
    return {
      sessionType: sessionTypeMatch ? sessionTypeMatch[1] : null,
      mood: moodMatch ? moodMatch[1] : null,
      progress: progressMatch ? progressMatch[1] : null,
      cleanContent: content.replace(/\[Session Type: .+?\]|\[Mood: .+?\]|\[Progress: .+?\]/g, '').trim(),
    };
  };

  const { sessionType, mood, progress, cleanContent } = parseMetadata(noteContent);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Therapy Note</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.noteHeader}>
              <CardTitle>📝 Session Note</CardTitle>
              <Badge variant="outline">
                <Text style={styles.badgeText}>{new Date(note.created_at).toLocaleDateString()}</Text>
              </Badge>
            </View>
            <Text style={styles.metaInfo}>
              🕒 {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.patientName}>
              Patient ID: {note.patient_id || note.patient_mrn || 'Unknown'}
            </Text>
            <Text style={styles.staffName}>
              Provider: {note.staff_id || note.author || 'Unknown'}
            </Text>
          </CardHeader>
          <CardContent>
            {/* Session Metadata */}
            {(sessionType || mood || progress) && (
              <View style={styles.metadataSection}>
                <Text style={styles.sectionTitle}>Session Information</Text>
                <View style={styles.metadataGrid}>
                  {sessionType && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>Session Type</Text>
                      <Badge variant="outline" style={styles.metadataBadge}>
                        <Text style={styles.metadataBadgeText}>{sessionType}</Text>
                      </Badge>
                    </View>
                  )}
                  {mood && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>Patient Mood</Text>
                      <Badge variant="outline" style={styles.metadataBadge as any}>
                        <Text style={styles.metadataBadgeText}>{mood}</Text>
                      </Badge>
                    </View>
                  )}
                  {progress && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataLabel}>Progress</Text>
                      <Badge variant="outline" style={styles.metadataBadge as any}>
                        <Text style={styles.metadataBadgeText}>{progress}</Text>
                      </Badge>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Session Notes</Text>
              <Text style={styles.noteContent}>
                {cleanContent || 'No content available'}
              </Text>
            </View>
            
            <View style={styles.securityBadge}>
              <Text style={styles.securityText}>🔒 This note is encrypted and HIPAA compliant</Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  headerBackButtonText: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 12,
    color: '#6b7280',
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
    marginTop: 16,
  },
  metaInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  contentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  securityBadge: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#065f46',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  metadataSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metadataItem: {
    flex: 1,
    minWidth: '45%',
  },
  metadataLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metadataBadge: {
    alignSelf: 'flex-start',
  },
  metadataBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  moodBadge: {
    borderColor: '#8b5cf6',
  },
  progressBadge: {
    borderColor: '#10b981',
  },
});
