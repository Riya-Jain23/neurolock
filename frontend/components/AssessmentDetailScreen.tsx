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

interface AssessmentDetailScreenProps {
  navigation: any;
  route: any;
}

export function AssessmentDetailScreen({ navigation, route }: AssessmentDetailScreenProps) {
  const { assessment } = route.params;

  if (!assessment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Assessment not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'completed') return 'default';
    if (status === 'scheduled') return 'secondary';
    return 'outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.headerRow}>
              <CardTitle>{assessment.assessment_type}</CardTitle>
              <Badge variant={getStatusBadgeVariant(assessment.status)}>
                <Text style={styles.badgeText}>{assessment.status}</Text>
              </Badge>
            </View>
            <Text style={styles.dateText}>
              Date: {new Date(assessment.created_at).toLocaleDateString()}
            </Text>
          </CardHeader>
          <CardContent>
            <View style={styles.section}>
              <Text style={styles.label}>Patient ID</Text>
              <Text style={styles.value}>{assessment.patient_id}</Text>
            </View>
            
            {assessment.scheduled_date && (
              <View style={styles.section}>
                <Text style={styles.label}>Scheduled Date</Text>
                <Text style={styles.value}>
                  {new Date(assessment.scheduled_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.notesText}>
                {assessment.notes || assessment.assessment_notes || 'No notes available.'}
              </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
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
});
