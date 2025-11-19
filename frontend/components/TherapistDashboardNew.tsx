import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert as RNAlert,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Alert } from './ui/alert.native';
import { Input } from './ui/input.native';
import { Progress } from './ui/progress.native';

interface TherapistDashboardNewProps {
  navigation: any;
  route: any;
}

interface Client {
  id: string;
  name: string;
  sessionCount: number;
  lastSession: string;
  progress: number;
  nextSession: string;
}

interface SessionLog {
  id: string;
  client: string;
  date: string;
  duration: number;
  type: string;
  notes: string;
}

export function TherapistDashboardNew({ navigation, route }: TherapistDashboardNewProps) {
  const { staffId } = route.params || { staffId: 'STAFF-003' };
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'C001',
      name: 'Client A',
      sessionCount: 12,
      lastSession: '2024-10-01',
      progress: 75,
      nextSession: '2024-10-08',
    },
    {
      id: 'C002',
      name: 'Client B',
      sessionCount: 8,
      lastSession: '2024-09-29',
      progress: 60,
      nextSession: '2024-10-06',
    },
    {
      id: 'C003',
      name: 'Client C',
      sessionCount: 15,
      lastSession: '2024-09-30',
      progress: 85,
      nextSession: '2024-10-07',
    },
  ]);

  const [updateProgressModalVisible, setUpdateProgressModalVisible] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [progressValue, setProgressValue] = useState('');

  const sessionLogs: SessionLog[] = [
    {
      id: 'SL001',
      client: 'Client A',
      date: '2024-10-01',
      duration: 50,
      type: 'Individual',
      notes: 'Good progress on anxiety management',
    },
    {
      id: 'SL002',
      client: 'Client B',
      date: '2024-09-29',
      duration: 60,
      type: 'Group',
      notes: 'Participated actively in group discussion',
    },
    {
      id: 'SL003',
      client: 'Client C',
      date: '2024-09-30',
      duration: 45,
      type: 'Individual',
      notes: 'Continued work on coping strategies',
    },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSessions = sessionLogs.length;
  const activeClients = clients.length;
  const avgProgress =
    clients.reduce((sum, client) => sum + client.progress, 0) / clients.length;

  const getSessionTypeBadgeVariant = (type: string) => {
    if (type === 'Individual') return 'default';
    if (type === 'Group') return 'secondary';
    return 'outline';
  };

  const handleUpdateProgress = () => {
    if (!selectedClientId || !progressValue) {
      RNAlert.alert('Validation Error', 'Please select a client and enter progress value');
      return;
    }

    const progressNum = parseInt(progressValue, 10);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      RNAlert.alert('Validation Error', 'Progress must be between 0 and 100');
      return;
    }

    try {
      const updatedClients = clients.map((client) =>
        client.id === selectedClientId
          ? { ...client, progress: progressNum }
          : client
      );
      setClients(updatedClients);
      setUpdateProgressModalVisible(false);
      setSelectedClientId('');
      setProgressValue('');
      RNAlert.alert('Success', 'Client progress updated successfully');
    } catch (error) {
      console.error('Failed to update progress:', error);
      RNAlert.alert('Error', 'Failed to update progress');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>💬</Text>
              <Text style={styles.headerTitle}>Therapist Dashboard</Text>
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
          title="Access Level: Therapist"
          description="Limited to therapy session logs and progress tracking only."
          style={styles.accessAlert}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="clients" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="clients">
              <Text>Clients</Text>
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Text>Sessions</Text>
            </TabsTrigger>
            <TabsTrigger value="progress">
              <Text>Progress</Text>
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Client List</Text>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                <Text style={styles.addButtonText}>➕ New Client</Text>
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              leftIcon="🔍"
              style={styles.searchInput}
            />

            <View style={styles.clientList}>
              {filteredClients.map((client) => (
                <TouchableOpacity key={client.id} activeOpacity={0.7}>
                  <Card style={styles.clientCard}>
                    <CardHeader style={styles.clientCardHeader}>
                      <View style={styles.clientCardTitleRow}>
                        <CardTitle>{client.name}</CardTitle>
                        <Badge variant="outline">
                          <Text style={styles.badgeText}>{client.id}</Text>
                        </Badge>
                      </View>
                    </CardHeader>
                    <CardContent>
                      <View style={styles.clientInfo}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Sessions:</Text>
                          <Text style={styles.infoValue}>{client.sessionCount}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Last Session:</Text>
                          <Text style={styles.infoValue}>{client.lastSession}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Next Session:</Text>
                          <Text style={styles.infoValue}>{client.nextSession}</Text>
                        </View>
                      </View>

                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={styles.progressValue}>{client.progress}%</Text>
                        </View>
                        <Progress value={client.progress} style={styles.progressBar} />
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </TabsContent>

          {/* Session Logs Tab */}
          <TabsContent value="sessions">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Session Logs</Text>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                <Text style={styles.addButtonText}>📄 New Log</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sessionList}>
              {sessionLogs.map((session) => (
                <TouchableOpacity key={session.id} activeOpacity={0.7}>
                  <Card style={styles.sessionCard}>
                    <CardContent>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionClient}>{session.client}</Text>
                        <Badge variant={getSessionTypeBadgeVariant(session.type)}>
                          <Text style={styles.badgeText}>{session.type}</Text>
                        </Badge>
                      </View>

                      <View style={styles.sessionDetails}>
                        <View style={styles.sessionDetailItem}>
                          <Text style={styles.sessionDetailLabel}>📅 Date</Text>
                          <Text style={styles.sessionDetailValue}>{session.date}</Text>
                        </View>
                        <View style={styles.sessionDetailItem}>
                          <Text style={styles.sessionDetailLabel}>⏱️ Duration</Text>
                          <Text style={styles.sessionDetailValue}>{session.duration} min</Text>
                        </View>
                      </View>

                      <View style={styles.notesSection}>
                        <Text style={styles.notesLabel}>Notes</Text>
                        <Text style={styles.notesText}>{session.notes}</Text>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Progress Tracking</Text>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => setUpdateProgressModalVisible(true)}
              >
                <Text style={styles.addButtonText}>📈 Update</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Stats */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>{activeClients}</Text>
                  <Text style={styles.statLabel}>Active Clients</Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>{totalSessions}</Text>
                  <Text style={styles.statLabel}>Total Sessions</Text>
                </CardContent>
              </Card>
              <Card style={styles.statCard}>
                <CardContent style={styles.statCardContent}>
                  <Text style={styles.statValue}>{avgProgress.toFixed(0)}%</Text>
                  <Text style={styles.statLabel}>Avg Progress</Text>
                </CardContent>
              </Card>
            </View>

            {/* Per-Client Progress */}
            <Card style={styles.progressCard}>
              <CardHeader>
                <CardTitle>Client Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {clients.map((client) => (
                  <View key={client.id} style={styles.progressItem}>
                    <View style={styles.progressItemHeader}>
                      <Text style={styles.progressItemName}>{client.name}</Text>
                      <Text style={styles.progressItemValue}>{client.progress}%</Text>
                    </View>
                    <Progress value={client.progress} style={styles.progressItemBar} />
                    <Text style={styles.progressItemSessions}>
                      {client.sessionCount} sessions completed
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollView>

      {/* Update Progress Modal */}
      <Modal
        visible={updateProgressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUpdateProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Client Progress</Text>

            <Text style={styles.modalLabel}>Select Client *</Text>
            <ScrollView style={styles.clientSelector}>
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.clientOption,
                    selectedClientId === client.id && styles.clientOptionSelected,
                  ]}
                  onPress={() => setSelectedClientId(client.id)}
                >
                  <Text
                    style={[
                      styles.clientOptionText,
                      selectedClientId === client.id && styles.clientOptionTextSelected,
                    ]}
                  >
                    {client.name} (Current: {client.progress}%)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.modalInput}
              placeholder="Progress Value (0-100) *"
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="number-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setUpdateProgressModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateProgress}
              >
                <Text style={styles.saveButtonText}>Update</Text>
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
  clientList: {
    gap: 12,
  },
  clientCard: {
    marginBottom: 12,
  },
  clientCardHeader: {
    paddingBottom: 8,
  },
  clientCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
  },
  clientInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  progressBar: {
    marginTop: 4,
  },
  sessionList: {
    gap: 12,
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  sessionDetailItem: {
    flex: 1,
  },
  sessionDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  sessionDetailValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  notesSection: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressCard: {
    marginTop: 8,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  progressItemBar: {
    marginBottom: 6,
  },
  progressItemSessions: {
    fontSize: 12,
    color: '#6b7280',
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
  clientSelector: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  clientOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  clientOptionSelected: {
    backgroundColor: '#dbeafe',
  },
  clientOptionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  clientOptionTextSelected: {
    fontWeight: '600',
    color: '#1e40af',
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
