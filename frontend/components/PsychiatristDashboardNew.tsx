import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  Input,
  Alert,
  Skeleton,
} from './ui';

interface PsychiatristDashboardProps {
  navigation: any;
  route: any;
}

export function PsychiatristDashboardNew({ navigation, route }: PsychiatristDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const stats = [
    { title: 'Patients', value: '24', icon: 'account-group', color: '#3b82f6' },
    { title: 'Today', value: '8', icon: 'calendar-today', color: '#10b981' },
    { title: 'Pending', value: '3', icon: 'clock-outline', color: '#f59e0b' },
    { title: 'Critical', value: '1', icon: 'alert-circle', color: '#ef4444' },
  ];

  const todaysAppointments = [
    { id: '1', name: 'Sarah Johnson', time: '09:00 AM', status: 'Scheduled', type: 'Follow-up', priority: 'normal' },
    { id: '2', name: 'Michael Chen', time: '10:30 AM', status: 'In Progress', type: 'Initial Assessment', priority: 'high' },
    { id: '3', name: 'Emily Rodriguez', time: '02:00 PM', status: 'Scheduled', type: 'Medication Review', priority: 'normal' },
    { id: '4', name: 'David Kim', time: '03:30 PM', status: 'Scheduled', type: 'Crisis Intervention', priority: 'urgent' },
  ];

  const recentAlerts = [
    { id: '1', patient: 'John Doe', message: 'Missed medication dose', time: '2h ago', severity: 'warning' },
    { id: '2', patient: 'Jane Smith', message: 'Emergency contact requested', time: '4h ago', severity: 'urgent' },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const getPriorityBadgeVariant = (priority: string): 'success' | 'warning' | 'destructive' => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      default: return 'success';
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'secondary' => {
    switch (status) {
      case 'In Progress': return 'success';
      case 'Completed': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning, Dr.</Text>
            <Text style={styles.subtitle}>You have 8 appointments today</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('SettingsNew')}>
            <Avatar size="md" fallback="DR" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<IconButton icon="magnify" size={20} />}
          containerStyle={styles.searchContainer}
        />

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {loading ? (
            // Loading skeletons
            <>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.statCard}>
                  <Skeleton width="100%" height={80} borderRadius={12} />
                </View>
              ))}
            </>
          ) : (
            stats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <View style={[styles.statBorder, { backgroundColor: stat.color }]} />
                <CardContent style={styles.statContent}>
                  <IconButton icon={stat.icon} size={28} iconColor={stat.color} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </CardContent>
              </Card>
            ))
          )}
        </View>

        {/* Alerts */}
        {recentAlerts.length > 0 && (
          <Card style={styles.section}>
            <CardHeader style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <CardTitle>Recent Alerts</CardTitle>
                <IconButton
                  icon="bell-outline"
                  size={20}
                  onPress={() => navigation.navigate('SecurityAlertsNew')}
                />
              </View>
            </CardHeader>
            <CardContent>
              {recentAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === 'urgent' ? 'destructive' : 'warning'}
                  title={alert.patient}
                  description={`${alert.message} • ${alert.time}`}
                  style={styles.alertItem}
                  icon={<IconButton icon="alert-circle" size={20} />}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Today's Appointments */}
        <Card style={styles.section}>
          <CardHeader style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <CardTitle>Today's Appointments</CardTitle>
              <Badge variant="default">{todaysAppointments.length}</Badge>
            </View>
          </CardHeader>
          <CardContent>
            {todaysAppointments.map((appointment, index) => (
              <TouchableOpacity
                key={appointment.id}
                style={[styles.appointmentCard, index !== 0 && styles.appointmentCardBorder]}
                onPress={() => navigation.navigate('PatientProfileNew', { patientId: appointment.id })}
              >
                <View style={styles.appointmentLeft}>
                  <Avatar size="md" fallback={appointment.name.split(' ').map(n => n[0]).join('')} />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentName}>{appointment.name}</Text>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                    <View style={styles.appointmentMeta}>
                      <IconButton icon="clock-outline" size={14} iconColor="#64748b" />
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.appointmentRight}>
                  <Badge variant={getPriorityBadgeVariant(appointment.priority)}>
                    {appointment.priority}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(appointment.status)} style={{ marginTop: 4 }}>
                    {appointment.status}
                  </Badge>
                </View>
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('PatientListNew')}
              >
                <IconButton icon="account-multiple" size={32} iconColor="#3b82f6" />
                <Text style={styles.actionText}>Patient List</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('TherapyNotesNew')}
              >
                <IconButton icon="note-text" size={32} iconColor="#10b981" />
                <Text style={styles.actionText}>Notes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('SecureNoteEditorNew')}
              >
                <IconButton icon="file-document-edit" size={32} iconColor="#8b5cf6" />
                <Text style={styles.actionText}>New Prescription</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('SettingsNew')}
              >
                <IconButton icon="cog" size={32} iconColor="#64748b" />
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
        >
          <IconButton icon="logout" iconColor="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    margin: 8,
    overflow: 'hidden',
  },
  statBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cardHeader: {
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  alertItem: {
    marginBottom: 12,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  appointmentCardBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  appointmentLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  appointmentTime: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  appointmentRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
});
