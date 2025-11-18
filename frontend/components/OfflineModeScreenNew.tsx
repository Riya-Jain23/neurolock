import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert } from './ui/alert';

interface OfflineModeScreenNewProps {
  route?: {
    params?: {
      staffId?: string;
      userRole?: string;
    };
  };
}

interface CachedPatient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  condition: string;
  priority: 'high' | 'medium' | 'low';
  cached: boolean;
}

export default function OfflineModeScreenNew({ route }: OfflineModeScreenNewProps) {
  const navigation = useNavigation();
  const staffId = route?.params?.staffId || 'STAFF001';
  const userRole = route?.params?.userRole || 'psychiatrist';

  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastSync] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
  const [searchTerm, setSearchTerm] = useState('');
  const [needsReAuth, setNeedsReAuth] = useState(false);

  // Mock cached patient data - limited subset
  const cachedPatients: CachedPatient[] = [
    {
      id: 'P001',
      name: 'John Smith',
      age: 45,
      lastVisit: '2024-10-01',
      condition: 'Anxiety Disorder',
      priority: 'medium',
      cached: true,
    },
    {
      id: 'P002',
      name: 'Mary Johnson',
      age: 38,
      lastVisit: '2024-09-30',
      condition: 'Depression',
      priority: 'high',
      cached: true,
    },
    {
      id: 'P003',
      name: 'Robert Wilson',
      age: 52,
      lastVisit: '2024-09-28',
      condition: 'Bipolar Disorder',
      priority: 'medium',
      cached: true,
    },
  ];

  const filteredPatients = cachedPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReconnect = () => {
    setIsReconnecting(true);

    setTimeout(() => {
      setIsReconnecting(false);
      setNeedsReAuth(true);
    }, 2000);
  };

  const handleReAuthenticate = () => {
    navigation.navigate('MFASelectionNew' as never);
  };

  const handlePatientView = (patientId: string) => {
    navigation.navigate('PatientProfileNew' as never, { patientId } as never);
  };

  const getOfflineCapabilities = () => {
    const capabilities: Record<string, string[]> = {
      psychiatrist: ['View cached patient list', 'View basic patient info', 'Emergency contact info'],
      psychologist: ['View cached patient list', 'View therapy notes (cached)', 'Assessment history'],
      therapist: ['View cached patient list', 'View therapy notes (cached)', 'Session schedules'],
      nurse: ['View cached patient list', 'Basic patient info', 'Medication schedules'],
      admin: ['View cached logs', 'Emergency contacts', 'System status'],
    };

    return capabilities[userRole] || [];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Offline Status Header */}
      <View style={styles.offlineHeader}>
        <Alert variant="destructive">
          <View style={styles.offlineAlertContent}>
            <View style={styles.offlineInfo}>
              <Text style={styles.wifiOffIcon}>📵</Text>
              <View style={styles.offlineText}>
                <Text style={styles.offlineTitle}>Offline Mode Active</Text>
                <Text style={styles.offlineSubtitle}>
                  Limited functionality available • Last sync: {lastSync.toLocaleString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleReconnect}
              disabled={isReconnecting}
              style={styles.reconnectButton}
            >
              <Text style={styles.reconnectIcon}>{isReconnecting ? '🔄' : '📡'}</Text>
            </TouchableOpacity>
          </View>
        </Alert>
      </View>

      {/* Reconnection Required Alert */}
      {needsReAuth && (
        <View style={styles.reAuthHeader}>
          <Alert>
            <View style={styles.reAuthContent}>
              <View style={styles.reAuthInfo}>
                <Text style={styles.shieldIcon}>🛡️</Text>
                <View style={styles.reAuthText}>
                  <Text style={styles.reAuthTitle}>Network Reconnected</Text>
                  <Text style={styles.reAuthSubtitle}>
                    Re-authentication required to access full functionality
                  </Text>
                </View>
              </View>
              <Button onPress={handleReAuthenticate} style={styles.reAuthButton}>
                Re-authenticate
              </Button>
            </View>
          </Alert>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Offline Mode</Text>
          <Badge variant="secondary" style={styles.cachedBadge}>
            <Text style={styles.databaseIcon}>💾</Text>
            <Text>Cached Data</Text>
          </Badge>
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.userInfo}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} • {staffId}
          </Text>
          <Badge variant="outline" style={styles.offlineBadge}>
            <Text style={styles.wifiOffSmallIcon}>📵</Text>
            <Text>Offline</Text>
          </Badge>
        </View>
      </View>

      {/* Available Capabilities */}
      <View style={styles.capabilitiesSection}>
        <Text style={styles.capabilitiesTitle}>Available in Offline Mode</Text>
        <View style={styles.capabilitiesList}>
          {getOfflineCapabilities().map((capability, index) => (
            <View key={index} style={styles.capabilityItem}>
              <View style={styles.capabilityDot} />
              <Text style={styles.capabilityText}>{capability}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isReconnecting}
            onRefresh={handleReconnect}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Cached Patient Records</Text>
          <Badge variant="outline">
            {filteredPatients.length} of {cachedPatients.length}
          </Badge>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Input
            placeholder="Search cached patients..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {/* Patient Cards */}
        <View style={styles.patientList}>
          {filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              onPress={() => handlePatientView(patient.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.patientCard}>
                <View style={styles.patientCardContent}>
                  <View style={styles.patientInfo}>
                    <View style={styles.patientHeader}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Badge variant="outline" style={styles.patientIdBadge}>
                        {patient.id}
                      </Badge>
                      <Badge variant="secondary">Cached</Badge>
                    </View>
                    <Text style={styles.patientCondition}>{patient.condition}</Text>
                    <Text style={styles.patientLastVisit}>Last visit: {patient.lastVisit}</Text>
                  </View>
                  <View style={styles.patientMeta}>
                    <Badge variant={patient.priority === 'high' ? 'destructive' : 'outline'}>
                      {patient.priority}
                    </Badge>
                    <Text style={styles.patientAge}>Age: {patient.age}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {filteredPatients.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💾</Text>
            <Text style={styles.emptyTitle}>No cached patients found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>

      {/* Limitations Notice */}
      <View style={styles.limitationsFooter}>
        <View style={styles.limitationsContent}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.limitationsText}>
            <Text style={styles.limitationsTitle}>Offline Limitations:</Text>
            <Text style={styles.limitationsItem}>• Cannot create new records or notes</Text>
            <Text style={styles.limitationsItem}>• No real-time updates or sync</Text>
            <Text style={styles.limitationsItem}>• Limited to cached data only</Text>
            <Text style={styles.limitationsItem}>• Some features may be unavailable</Text>
            <Text style={styles.limitationsItem}>
              • Emergency actions require network connection
            </Text>
          </View>
        </View>
      </View>

      {/* Connection Status */}
      <View style={styles.statusFooter}>
        <View style={styles.statusInfo}>
          <Text style={styles.clockIcon}>⏰</Text>
          <Text style={styles.statusText}>Last sync: {lastSync.toLocaleString()}</Text>
        </View>
        <Button
          variant="outline"
          onPress={handleReconnect}
          disabled={isReconnecting}
          style={styles.checkConnectionButton}
        >
          {isReconnecting ? '🔄 Connecting...' : '📡 Check Connection'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  offlineHeader: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  offlineAlertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wifiOffIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  offlineText: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 2,
  },
  offlineSubtitle: {
    fontSize: 12,
    color: '#991b1b',
  },
  reconnectButton: {
    padding: 8,
  },
  reconnectIcon: {
    fontSize: 20,
  },
  reAuthHeader: {
    padding: 16,
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fcd34d',
  },
  reAuthContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reAuthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shieldIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  reAuthText: {
    flex: 1,
  },
  reAuthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  reAuthSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  reAuthButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  cachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  databaseIcon: {
    fontSize: 14,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wifiOffSmallIcon: {
    fontSize: 12,
  },
  capabilitiesSection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  capabilitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  capabilitiesList: {
    gap: 8,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  capabilityText: {
    fontSize: 14,
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 16,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 36,
  },
  patientList: {
    gap: 12,
  },
  patientCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  patientCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  patientIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  patientCondition: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  patientLastVisit: {
    fontSize: 12,
    color: '#6b7280',
  },
  patientMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  patientAge: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  limitationsFooter: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  limitationsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  limitationsText: {
    flex: 1,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  limitationsItem: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 2,
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  checkConnectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
