import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Menu, Divider } from 'react-native-paper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  Input,
  Button,
  Separator,
  useToast,
} from './ui';
import { patientAPI } from '../services/api';

interface Patient {
  id: number;
  mrn: string;
  full_name: string;
  dob?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  status?: string;
  gender?: string;
  diagnosis?: string;
  ward?: string;
  room?: string;
  attending_physician?: string;
  assigned_therapist?: string;
  admission_date?: string;
}

interface PatientListScreenNewProps {
  navigation: any;
  route: any;
}

export function PatientListScreenNew({ navigation, route }: PatientListScreenNewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const { showToast } = useToast();

  const userRole = route.params?.role || 'psychiatrist';
  const staffId = route.params?.staffId || 'DR001';

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getAll();
      setPatients(response.data || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to load patients', 'error');
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients
    .filter((patient) => {
      const matchesSearch =
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'recent' && a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'name') {
        return a.full_name.localeCompare(b.full_name);
      }
      return 0;
    });

  const wards = ['all'];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPatients();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getPriorityBadgeVariant = (priority: string): 'destructive' | 'warning' | 'success' => {
    return 'default' as any;
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'warning' | 'success' => {
    return 'success';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IconButton icon="arrow-left" size={24} iconColor="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Patient Records</Text>
            <Text style={styles.headerSubtitle}>Secure patient management</Text>
          </View>
        </View>

        <View style={styles.headerBadges}>
          <View style={styles.leftBadges}>
            <Badge variant="secondary" style={styles.headerBadge}>
              {userRole}
            </Badge>
            <Badge variant="secondary" style={styles.headerBadge}>
              {staffId}
            </Badge>
          </View>
          <Badge variant="success">{filteredPatients.length} Patient(s)</Badge>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Search by name or MRN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<IconButton icon="magnify" size={20} />}
          containerStyle={styles.searchInput}
        />

        <View style={styles.filterRow}>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                variant="outline"
                size="sm"
                onPress={() => setSortMenuVisible(true)}
                style={styles.filterButton}
              >
                <IconButton icon="sort" size={16} />
                <Text style={styles.filterText}>
                  {sortBy === 'recent' ? 'Recent' : 'Name'}
                </Text>
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSortBy('recent'); setSortMenuVisible(false); }} title="Recent" />
            <Menu.Item onPress={() => { setSortBy('name'); setSortMenuVisible(false); }} title="Name" />
          </Menu>
        </View>
      </View>

      {/* Add New Patient Button */}
      <View style={styles.actionSection}>
        <Button onPress={() => navigation.navigate('PatientProfileNew', { patientId: 'new' })} style={styles.addButton}>
          <IconButton icon="plus" size={20} iconColor="#ffffff" />
          <Text style={styles.addButtonText}>Add New Patient Record</Text>
        </Button>
      </View>

      <Separator />

      {/* Patient List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContent}>
          {filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              onPress={() => navigation.navigate('PatientProfileNew', { patientId: patient.id })}
            >
              <Card style={styles.patientCard}>
                <CardHeader style={styles.patientCardHeader}>
                  <View style={styles.patientHeaderRow}>
                    <View style={styles.patientHeaderLeft}>
                      <Avatar size="md" fallback={patient.full_name.split(' ').map((n) => n[0]).join('')} />
                      <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{patient.full_name}</Text>
                        <Text style={styles.patientId}>MRN: {patient.mrn}</Text>
                      </View>
                    </View>
                    <Badge variant="outline">{patient.gender || 'N/A'}</Badge>
                  </View>
                </CardHeader>
                <CardContent>
                  <View style={styles.patientDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <IconButton icon="map-marker" size={14} iconColor="#3b82f6" />
                        <View>
                          <Text style={styles.detailLabel}>Ward</Text>
                          <Text style={styles.detailValue}>{patient.ward || 'N/A'}</Text>
                        </View>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Room</Text>
                        <Text style={styles.detailValue}>{patient.room || 'N/A'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <IconButton icon="calendar" size={14} iconColor="#10b981" />
                        <View>
                          <Text style={styles.detailLabel}>Admitted</Text>
                          <Text style={styles.detailValue}>{patient.admission_date ? new Date(patient.admission_date).toLocaleDateString() : 'N/A'}</Text>
                        </View>
                      </View>
                      <View style={styles.detailItem}>
                        <IconButton icon="account-heart" size={14} iconColor="#64748b" />
                        <View>
                          <Text style={styles.detailLabel}>Therapist</Text>
                          <Text style={styles.detailValue}>{patient.assigned_therapist?.split(' ')[0] || 'Unassigned'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Separator style={styles.cardSeparator} />

                  <View style={styles.patientFooter}>
                    <Text style={styles.conditionText}>{patient.diagnosis || 'No diagnosis'}</Text>
                    <Badge variant={getStatusBadgeVariant(patient.status || 'Active')}>{patient.status || 'Active'}</Badge>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}

          {filteredPatients.length === 0 && (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                <View style={styles.emptyIcon}>
                  <IconButton icon="account-multiple" size={48} iconColor="#3b82f6" />
                </View>
                <Text style={styles.emptyTitle}>No Patients Found</Text>
                <Text style={styles.emptyText}>Try adjusting your search criteria or filters</Text>
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Badge variant="outline" style={styles.footerBadge}>
            {filteredPatients.length} / {patients.length}
          </Badge>
          <Text style={styles.footerText}>Records Displayed</Text>
        </View>
        <View style={styles.footerRight}>
          <IconButton icon="shield-check" size={16} iconColor="#10b981" />
          <Text style={styles.hipaaText}>HIPAA Compliant</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleContainer: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#e0f2fe',
  },
  searchInput: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    marginLeft: 4,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  patientCard: {
    marginBottom: 16,
  },
  patientCardHeader: {
    paddingBottom: 12,
    backgroundColor: 'rgba(241, 245, 249, 0.3)',
  },
  patientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientInfo: {
    marginLeft: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  patientId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  patientDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 2,
  },
  cardSeparator: {
    marginVertical: 12,
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: '#e0f2fe',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerBadge: {
    borderColor: '#3b82f6',
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hipaaText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
});
