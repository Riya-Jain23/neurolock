import React, { useState } from 'react';
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
import { Input } from './ui/input.native';
import { Button } from './ui/button.native';
import { Menu } from 'react-native-paper';

interface StaffActivityLogsScreenNewProps {
  navigation: any;
  route: any;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  accessType: string;
  ipAddress: string;
  device: string;
  patientId: string | null;
  status: string;
}

export function StaffActivityLogsScreenNew({ navigation, route }: StaffActivityLogsScreenNewProps) {
  const { staffId } = route.params || { staffId: 'ADMIN-001' };
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilterVisible, setUserFilterVisible] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [accessTypeFilterVisible, setAccessTypeFilterVisible] = useState(false);
  const [accessTypeFilter, setAccessTypeFilter] = useState('all');

  const activityLogs: ActivityLog[] = [
    {
      id: 'LOG001',
      userId: 'DR001',
      userName: 'Dr. Sarah Johnson',
      action: 'Emergency Override Access',
      details: 'Bypassed MFA for Patient P001 - Medical Emergency',
      timestamp: '2024-10-02 15:45:23',
      accessType: 'override',
      ipAddress: '192.168.1.100',
      device: 'Desktop - Chrome',
      patientId: 'P001',
      status: 'flagged',
    },
    {
      id: 'LOG002',
      userId: 'TH002',
      userName: 'Sarah Wilson',
      action: 'Patient Record Access',
      details: 'Viewed Patient P001 therapy notes',
      timestamp: '2024-10-02 14:30:15',
      accessType: 'normal',
      ipAddress: '192.168.1.105',
      device: 'Mobile - Safari',
      patientId: 'P001',
      status: 'normal',
    },
    {
      id: 'LOG003',
      userId: 'NU003',
      userName: 'Mike Chen',
      action: 'Login Attempt',
      details: 'Successful login after MFA verification',
      timestamp: '2024-10-02 14:15:42',
      accessType: 'normal',
      ipAddress: '192.168.1.110',
      device: 'Tablet - Edge',
      patientId: null,
      status: 'normal',
    },
    {
      id: 'LOG004',
      userId: 'AD001',
      userName: 'Admin User',
      action: 'Staff Account Created',
      details: 'Created new account for Jane Smith (Nurse)',
      timestamp: '2024-10-02 13:20:18',
      accessType: 'normal',
      ipAddress: '192.168.1.101',
      device: 'Desktop - Firefox',
      patientId: null,
      status: 'normal',
    },
    {
      id: 'LOG005',
      userId: 'DR001',
      userName: 'Dr. Sarah Johnson',
      action: 'Failed Login',
      details: 'Invalid password - 3rd attempt',
      timestamp: '2024-10-02 09:15:30',
      accessType: 'failed',
      ipAddress: '203.0.113.45',
      device: 'Mobile - Chrome',
      patientId: null,
      status: 'suspicious',
    },
  ];

  const staffMembers = ['all', ...Array.from(new Set(activityLogs.map((log) => log.userId)))];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.patientId && log.patientId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUser = userFilter === 'all' || log.userId === userFilter;
    const matchesAccessType =
      accessTypeFilter === 'all' || log.accessType === accessTypeFilter;

    return matchesSearch && matchesUser && matchesAccessType;
  });

  const getStatusBadge = (status: string, accessType: string) => {
    if (accessType === 'override') return 'destructive';
    if (status === 'suspicious') return 'destructive';
    if (status === 'flagged') return 'destructive';
    if (accessType === 'failed') return 'secondary';
    return 'outline';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Emergency') || action.includes('Override')) return '⚠️';
    if (action.includes('Login') || action.includes('Failed')) return '🔐';
    if (action.includes('Patient') || action.includes('Record')) return '👤';
    return '💻';
  };

  const overrideCount = filteredLogs.filter((log) => log.accessType === 'override').length;
  const failedCount = filteredLogs.filter((log) => log.accessType === 'failed').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Staff Activity Logs</Text>
            </View>
          </View>
          <View style={styles.headerBottom}>
            <Text style={styles.headerSubtitle}>Administrator • {staffId}</Text>
            <Badge variant="outline">
              <Text style={styles.badgeText}>{filteredLogs.length} Entries</Text>
            </Badge>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <Input
            placeholder="Search by user, action, or patient ID..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon="🔍"
            style={styles.searchInput}
          />

          <View style={styles.filterRow}>
            <Menu
              visible={userFilterVisible}
              onDismiss={() => setUserFilterVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setUserFilterVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterButtonText}>
                    {userFilter === 'all' ? 'All Staff' : userFilter}
                  </Text>
                  <Text style={styles.filterButtonIcon}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setUserFilter('all');
                  setUserFilterVisible(false);
                }}
                title="All Staff"
              />
              {staffMembers.slice(1).map((userId) => (
                <Menu.Item
                  key={userId}
                  onPress={() => {
                    setUserFilter(userId);
                    setUserFilterVisible(false);
                  }}
                  title={userId}
                />
              ))}
            </Menu>

            <Menu
              visible={accessTypeFilterVisible}
              onDismiss={() => setAccessTypeFilterVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setAccessTypeFilterVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterButtonText}>
                    {accessTypeFilter === 'all' ? 'All Types' : accessTypeFilter}
                  </Text>
                  <Text style={styles.filterButtonIcon}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setAccessTypeFilter('all');
                  setAccessTypeFilterVisible(false);
                }}
                title="All Types"
              />
              <Menu.Item
                onPress={() => {
                  setAccessTypeFilter('normal');
                  setAccessTypeFilterVisible(false);
                }}
                title="Normal"
              />
              <Menu.Item
                onPress={() => {
                  setAccessTypeFilter('override');
                  setAccessTypeFilterVisible(false);
                }}
                title="Override"
              />
              <Menu.Item
                onPress={() => {
                  setAccessTypeFilter('failed');
                  setAccessTypeFilterVisible(false);
                }}
                title="Failed"
              />
            </Menu>
          </View>

          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton} activeOpacity={0.7}>
              <Text style={styles.exportButtonText}>📥 Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} activeOpacity={0.7}>
              <Text style={styles.exportButtonText}>📅 Schedule Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Logs */}
        <View style={styles.logsSection}>
          {filteredLogs.map((log) => (
            <TouchableOpacity key={log.id} activeOpacity={0.7}>
              <Card style={styles.logCard}>
                <CardContent>
                  <View style={styles.logHeader}>
                    <View style={styles.logHeaderLeft}>
                      <Text style={styles.logIcon}>{getActionIcon(log.action)}</Text>
                      <View style={styles.logHeaderInfo}>
                        <Text style={styles.logAction}>{log.action}</Text>
                        <Text style={styles.logUser}>
                          {log.userName} ({log.userId})
                        </Text>
                      </View>
                    </View>
                    <Badge variant={getStatusBadge(log.status, log.accessType)}>
                      <Text style={styles.badgeText}>
                        {log.accessType === 'override'
                          ? 'Override'
                          : log.status === 'suspicious'
                          ? 'Suspicious'
                          : log.status === 'flagged'
                          ? 'Flagged'
                          : log.accessType === 'failed'
                          ? 'Failed'
                          : 'Normal'}
                      </Text>
                    </Badge>
                  </View>

                  <Text style={styles.logDetails}>{log.details}</Text>

                  <View style={styles.logMeta}>
                    <View style={styles.logMetaItem}>
                      <Text style={styles.logMetaLabel}>Timestamp:</Text>
                      <Text style={styles.logMetaValue}>{log.timestamp}</Text>
                    </View>
                    <View style={styles.logMetaItem}>
                      <Text style={styles.logMetaLabel}>Device:</Text>
                      <Text style={styles.logMetaValue}>{log.device}</Text>
                    </View>
                    <View style={styles.logMetaItem}>
                      <Text style={styles.logMetaLabel}>IP Address:</Text>
                      <Text style={styles.logMetaValue}>{log.ipAddress}</Text>
                    </View>
                    {log.patientId && (
                      <View style={styles.logMetaItem}>
                        <Text style={styles.logMetaLabel}>Patient:</Text>
                        <Badge variant="outline" style={styles.patientBadge}>
                          <Text style={styles.badgeText}>{log.patientId}</Text>
                        </Badge>
                      </View>
                    )}
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}

          {filteredLogs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💻</Text>
              <Text style={styles.emptyTitle}>No activity logs found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
            </View>
          )}
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Entries</Text>
              <Text style={styles.statValue}>{filteredLogs.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Override Actions</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{overrideCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Failed Attempts</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{failedCount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1f2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  badgeText: {
    fontSize: 12,
  },
  filtersSection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  filterButtonIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 13,
    color: '#1f2937',
  },
  logsSection: {
    padding: 16,
  },
  logCard: {
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  logIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logHeaderInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  logUser: {
    fontSize: 12,
    color: '#6b7280',
  },
  logDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  logMeta: {
    gap: 8,
  },
  logMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logMetaLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  logMetaValue: {
    fontSize: 12,
    color: '#1f2937',
  },
  patientBadge: {
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  summarySection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});
