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
import { Alert } from './ui/alert.native';
import { Input } from './ui/input.native';
import { Button } from './ui/button.native';
import { Menu } from 'react-native-paper';

interface SecurityAlertsScreenNewProps {
  navigation: any;
  route: any;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  ipAddress: string;
  location: string;
  patientId: string | null;
  status: string;
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export function SecurityAlertsScreenNew({ navigation, route }: SecurityAlertsScreenNewProps) {
  const { staffId } = route.params || { staffId: 'ADMIN-001' };
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilterVisible, setSeverityFilterVisible] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilterVisible, setStatusFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('unreviewed');

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: 'ALT001',
      type: 'Emergency Override',
      severity: 'high',
      title: 'Emergency MFA Bypass',
      description: 'Dr. Sarah Johnson bypassed MFA for Patient P001 citing medical emergency',
      timestamp: '2024-10-02 15:45:23',
      userId: 'DR001',
      userName: 'Dr. Sarah Johnson',
      ipAddress: '192.168.1.100',
      location: 'Hospital Network',
      patientId: 'P001',
      status: 'unreviewed',
      reason:
        'Patient in critical condition, immediate access required for medication adjustment',
      reviewedBy: null,
      reviewedAt: null,
    },
    {
      id: 'ALT002',
      type: 'Suspicious Location',
      severity: 'medium',
      title: 'Login from Unusual Location',
      description: 'Login attempt from unrecognized IP address',
      timestamp: '2024-10-02 14:22:10',
      userId: 'TH002',
      userName: 'Sarah Wilson',
      ipAddress: '203.0.113.25',
      location: 'External IP - City: Unknown',
      patientId: null,
      status: 'unreviewed',
      reason: null,
      reviewedBy: null,
      reviewedAt: null,
    },
    {
      id: 'ALT003',
      type: 'Failed Login Attempts',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: '5 consecutive failed password attempts in 10 minutes',
      timestamp: '2024-10-02 09:15:30',
      userId: 'DR001',
      userName: 'Dr. Sarah Johnson',
      ipAddress: '203.0.113.45',
      location: 'External IP - Suspicious',
      patientId: null,
      status: 'reviewed',
      reason: null,
      reviewedBy: 'AD001',
      reviewedAt: '2024-10-02 10:30:00',
    },
  ]);

  const filteredAlerts = securityAlerts.filter((alert) => {
    const matchesSearch =
      alert.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.patientId && alert.patientId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleMarkAsReviewed = (alertId: string) => {
    setSecurityAlerts((alerts) =>
      alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'reviewed',
              reviewedBy: staffId,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : alert
      )
    );
  };

  const getSeverityBadgeVariant = (severity: string) => {
    if (severity === 'high') return 'destructive';
    if (severity === 'medium') return 'secondary';
    return 'outline';
  };

  const getAlertIcon = (type: string) => {
    if (type.includes('Override') || type.includes('Emergency')) return '⚠️';
    if (type.includes('Location') || type.includes('Suspicious')) return '📍';
    if (type.includes('Failed') || type.includes('Login')) return '🔐';
    return '🔔';
  };

  const unreviewedCount = securityAlerts.filter((alert) => alert.status === 'unreviewed').length;
  const highSeverityCount = securityAlerts.filter((alert) => alert.severity === 'high').length;

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
              <Text style={styles.headerTitle}>Security Alerts</Text>
            </View>
          </View>
          <View style={styles.headerBottom}>
            <Text style={styles.headerSubtitle}>Administrator • {staffId}</Text>
            {unreviewedCount > 0 && (
              <Badge variant="destructive">
                <Text style={styles.badgeText}>{unreviewedCount} Unreviewed</Text>
              </Badge>
            )}
          </View>
        </View>

        {/* Alert Summary */}
        {(unreviewedCount > 0 || highSeverityCount > 0) && (
          <View style={styles.alertSummary}>
            <Alert
              variant="destructive"
              title="⚠️ Action Required"
              description={`${unreviewedCount} unreviewed alerts, ${highSeverityCount} high severity incidents requiring immediate attention.`}
            />
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Input
            placeholder="Search by user, alert type, or description..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon="🔍"
            style={styles.searchInput}
          />

          <View style={styles.filterRow}>
            <Menu
              visible={severityFilterVisible}
              onDismiss={() => setSeverityFilterVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setSeverityFilterVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterButtonText}>
                    {severityFilter === 'all' ? 'All Levels' : severityFilter}
                  </Text>
                  <Text style={styles.filterButtonIcon}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSeverityFilter('all');
                  setSeverityFilterVisible(false);
                }}
                title="All Levels"
              />
              <Menu.Item
                onPress={() => {
                  setSeverityFilter('high');
                  setSeverityFilterVisible(false);
                }}
                title="High"
              />
              <Menu.Item
                onPress={() => {
                  setSeverityFilter('medium');
                  setSeverityFilterVisible(false);
                }}
                title="Medium"
              />
              <Menu.Item
                onPress={() => {
                  setSeverityFilter('low');
                  setSeverityFilterVisible(false);
                }}
                title="Low"
              />
            </Menu>

            <Menu
              visible={statusFilterVisible}
              onDismiss={() => setStatusFilterVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setStatusFilterVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterButtonText}>
                    {statusFilter === 'all' ? 'All Statuses' : statusFilter}
                  </Text>
                  <Text style={styles.filterButtonIcon}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setStatusFilter('all');
                  setStatusFilterVisible(false);
                }}
                title="All Statuses"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter('unreviewed');
                  setStatusFilterVisible(false);
                }}
                title="Unreviewed"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter('reviewed');
                  setStatusFilterVisible(false);
                }}
                title="Reviewed"
              />
            </Menu>
          </View>
        </View>

        {/* Security Alerts List */}
        <View style={styles.alertsSection}>
          {filteredAlerts.map((alert) => {
            let cardStyle = styles.alertCard;
            if (alert.status === 'unreviewed' && alert.severity === 'high') {
              cardStyle = styles.alertCardUnreviewedHigh;
            } else if (alert.status === 'unreviewed') {
              cardStyle = styles.alertCardUnreviewed;
            } else if (alert.severity === 'high') {
              cardStyle = styles.alertCardHighSeverity;
            }

            return (
              <Card key={alert.id} style={cardStyle}>
                <CardHeader style={styles.alertCardHeader}>
                <View style={styles.alertHeaderTop}>
                  <View style={styles.alertHeaderLeft}>
                    <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                    <View style={styles.alertHeaderInfo}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertMeta}>
                        {alert.type} • {alert.timestamp}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.alertBadges}>
                    <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                      <Text style={styles.badgeText}>{alert.severity}</Text>
                    </Badge>
                    <Text style={styles.statusIcon}>
                      {alert.status === 'reviewed' ? '✅' : '❌'}
                    </Text>
                  </View>
                </View>
              </CardHeader>
              <CardContent>
                <Text style={styles.alertDescription}>{alert.description}</Text>

                <View style={styles.alertDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>User:</Text>
                    <Text style={styles.detailValue}>
                      {alert.userName} ({alert.userId})
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{alert.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>IP Address:</Text>
                    <Text style={styles.detailValue}>{alert.ipAddress}</Text>
                  </View>
                  {alert.patientId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Patient ID:</Text>
                      <Badge variant="outline" style={styles.patientBadge}>
                        <Text style={styles.badgeText}>{alert.patientId}</Text>
                      </Badge>
                    </View>
                  )}
                </View>

                {alert.reason && (
                  <View style={styles.reasonSection}>
                    <Text style={styles.reasonLabel}>Emergency Justification:</Text>
                    <Text style={styles.reasonText}>{alert.reason}</Text>
                  </View>
                )}

                {alert.status === 'reviewed' && (
                  <View style={styles.reviewedSection}>
                    <Text style={styles.reviewedIcon}>✅</Text>
                    <Text style={styles.reviewedText}>
                      Reviewed by {alert.reviewedBy} on {alert.reviewedAt}
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  {alert.status === 'unreviewed' && (
                    <Button
                      onPress={() => handleMarkAsReviewed(alert.id)}
                      variant="default"
                      style={styles.reviewButton}
                    >
                      <Text style={styles.reviewButtonText}>👁️ Mark as Reviewed</Text>
                    </Button>
                  )}
                  <Button variant="outline" style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </Button>
                </View>
              </CardContent>
            </Card>
            );
          })}

          {filteredAlerts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔐</Text>
              <Text style={styles.emptyTitle}>No security alerts found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
            </View>
          )}
        </View>

        {/* Summary Footer */}
        <View style={styles.summarySection}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Alerts</Text>
              <Text style={styles.statValue}>{filteredAlerts.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Unreviewed</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{unreviewedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>High Severity</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{highSeverityCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Overrides</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                {securityAlerts.filter((alert) => alert.type.includes('Override')).length}
              </Text>
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
  alertSummary: {
    padding: 16,
    backgroundColor: '#fef2f2',
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
  alertsSection: {
    padding: 16,
  },
  alertCard: {
    marginBottom: 12,
  },
  alertCardUnreviewed: {
    marginBottom: 12,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  alertCardHighSeverity: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertCardUnreviewedHigh: {
    marginBottom: 12,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertCardHeader: {
    paddingBottom: 12,
  },
  alertHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertHeaderInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  alertDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 12,
    color: '#1f2937',
  },
  patientBadge: {
    marginLeft: 4,
  },
  reasonSection: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#1f2937',
  },
  reviewedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  reviewedText: {
    fontSize: 12,
    color: '#166534',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewButton: {
    flex: 1,
  },
  reviewButtonText: {
    fontSize: 13,
    color: '#ffffff',
  },
  detailsButton: {
    flex: 1,
  },
  detailsButtonText: {
    fontSize: 13,
    color: '#1f2937',
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
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});
