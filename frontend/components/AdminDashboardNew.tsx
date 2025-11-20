import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert as RNAlert,
  Share,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.native';
import { Badge } from './ui/badge.native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs.native';
import { Alert } from './ui/alert.native';
import { Input } from './ui/input.native';
import { Button } from './ui/button.native';
import { Menu } from 'react-native-paper';
import { staffAPI, authAPI, getUser } from '../services/api';

interface AdminDashboardNewProps {
  navigation: any;
  route: any;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: string;
  description: string;
  timestamp: string;
}

export function AdminDashboardNew({ navigation, route }: AdminDashboardNewProps) {
  const { staffId } = route.params || { staffId: 'ADMIN-001' };
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMenus, setVisibleMenus] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit staff modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => Promise<void>) | null>(null);
  const [criticalAlertsDismissed, setCriticalAlertsDismissed] = useState(false);

  // Staff data state (fetched from backend)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  // Load staff from backend
  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      setLoading(true);
      const response = await staffAPI.getAll();
      if (response.success) {
        // Map backend data to frontend format
        const mappedStaff = response.data.map((staff: any) => ({
          id: staff.id.toString(),
          name: staff.name,
          email: staff.email,
          role: staff.role.charAt(0).toUpperCase() + staff.role.slice(1),
          status: staff.status.charAt(0).toUpperCase() + staff.status.slice(1),
          lastActive: staff.last_login_at || 'Never',
        }));
        setStaffMembers(mappedStaff);
      }
    } catch (error: any) {
      console.error('Failed to load staff:', error);
      RNAlert.alert('Error', 'Failed to load staff members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handler functions
  const handleAddStaff = () => {
    RNAlert.alert(
      'Add New Staff',
      'This feature will open a form to add new staff members.',
      [{ text: 'OK' }]
    );
  };

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditName(staff.name);
    setEditEmail(staff.email);
    setEditRole(staff.role);
    setEditStatus(staff.status);
    setEditModalVisible(true);
  };

  const handleSaveStaffEdit = async () => {
    if (!selectedStaff) return;

    try {
      const response = await staffAPI.update(parseInt(selectedStaff.id), {
        name: editName,
        email: editEmail,
        role: editRole.toLowerCase(),
        status: editStatus.toLowerCase(),
      });

      if (response.success) {
        // Update local state
        setStaffMembers((prev) =>
          prev.map((staff) =>
            staff.id === selectedStaff.id
              ? {
                  ...staff,
                  name: editName,
                  email: editEmail,
                  role: editRole,
                  status: editStatus,
                }
              : staff
          )
        );

        setEditModalVisible(false);
        RNAlert.alert('Success', `Updated ${editName}'s information`);
      }
    } catch (error: any) {
      console.error('Failed to update staff:', error);
      RNAlert.alert('Error', error.message || 'Failed to update staff member');
    }
  };

  const handleViewStaff = (staff: StaffMember) => {
    RNAlert.alert(
      'Staff Details',
      `Name: ${staff.name}\nID: ${staff.id}\nEmail: ${staff.email}\nRole: ${staff.role}\nStatus: ${staff.status}\nLast Active: ${staff.lastActive}`,
      [{ text: 'OK' }]
    );
  };

  const handleChangeRole = async (staff: StaffMember, newRole: string) => {
    // Password required when changing admin status
    const changingToAdmin = newRole.toLowerCase() === 'admin' && staff.role.toLowerCase() !== 'admin';
    const removingAdmin = newRole.toLowerCase() !== 'admin' && staff.role.toLowerCase() === 'admin';
    const requiresPassword = changingToAdmin || removingAdmin;

    if (requiresPassword) {
      // Store the pending action as an async function
      setPendingAdminAction(() => async () => {
        await performRoleChange(staff, newRole);
      });
      setPasswordModalVisible(true);
    } else {
      await performRoleChange(staff, newRole);
    }
  };

  const performRoleChange = async (staff: StaffMember, newRole: string) => {
    try {
      const response = await staffAPI.update(parseInt(staff.id), {
        role: newRole.toLowerCase(),
      });

      if (response.success) {
        setStaffMembers((prev) =>
          prev.map((s) =>
            s.id === staff.id ? { ...s, role: newRole } : s
          )
        );
        const message = newRole.toLowerCase() === 'admin' 
          ? `${staff.name} now has admin privileges`
          : `${staff.name}'s admin privileges have been revoked`;
        RNAlert.alert('Success', message);
      }
    } catch (error: any) {
      console.error('Failed to update role:', error);
      RNAlert.alert('Error', error.message || 'Failed to update admin status');
    }
  };

  const handleExportAuditLogs = async () => {
    const csvContent = auditLogs.map(log => 
      `${log.id},${log.user},${log.action},${log.timestamp},${log.ipAddress}`
    ).join('\n');
    
    const header = 'ID,User,Action,Timestamp,IP Address\n';
    const fullContent = header + csvContent;

    try {
      await Share.share({
        message: fullContent,
        title: 'Audit Logs Export',
      });
    } catch (error) {
      RNAlert.alert('Export Failed', 'Could not export audit logs');
    }
  };

  const handleVerifyPassword = async () => {
    if (!verificationPassword.trim()) {
      RNAlert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      const user = await getUser();
      if (!user?.email) {
        RNAlert.alert('Error', 'User session not found');
        setPasswordModalVisible(false);
        return;
      }

      // Verify password
      await authAPI.login(user.email, verificationPassword);
      
      // Close modal first
      setPasswordModalVisible(false);
      const action = pendingAdminAction;
      setVerificationPassword('');
      setPendingAdminAction(null);
      
      // Then execute the pending action
      if (action) {
        await action();
      }
    } catch (error: any) {
      console.error('Password verification failed:', error);
      RNAlert.alert('Verification Failed', 'Incorrect password. Please try again.');
      setVerificationPassword('');
    }
  };

  const handleViewSecurityAlert = (alert: SecurityAlert) => {
    RNAlert.alert(
      `Security Alert: ${alert.severity}`,
      `Type: ${alert.type}\n\n${alert.description}\n\nTime: ${alert.timestamp}`,
      [
        { text: 'Dismiss', style: 'cancel' },
        { 
          text: 'Investigate', 
          onPress: () => {
            RNAlert.alert(
              'Investigation Started',
              `Investigating alert: ${alert.type}\n\nActions taken:\n• IP address blocked\n• User notified\n• Security team alerted\n• Incident logged`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const auditLogs: AuditLog[] = [
    {
      id: 'LOG-001',
      user: 'Dr. Smith',
      action: 'Accessed patient record P001',
      timestamp: '2024-10-01 14:30:22',
      ipAddress: '192.168.1.100',
    },
    {
      id: 'LOG-002',
      user: 'Dr. Johnson',
      action: 'Modified therapy notes',
      timestamp: '2024-10-01 13:45:10',
      ipAddress: '192.168.1.101',
    },
    {
      id: 'LOG-003',
      user: 'Sarah Williams',
      action: 'Created new session log',
      timestamp: '2024-10-01 15:00:05',
      ipAddress: '192.168.1.102',
    },
  ];

  const securityAlerts: SecurityAlert[] = [
    {
      id: 'SEC-001',
      type: 'Multiple failed login attempts',
      severity: 'Critical',
      description: '5 failed login attempts for user Dr. Smith from IP 203.0.113.5',
      timestamp: '2024-10-01 10:15',
    },
    {
      id: 'SEC-002',
      type: 'Unusual access pattern',
      severity: 'High',
      description: 'Dr. Johnson accessed 15 patient records in 10 minutes',
      timestamp: '2024-10-01 11:30',
    },
    {
      id: 'SEC-003',
      type: 'Session timeout warning',
      severity: 'Medium',
      description: 'Mike Brown session timed out after 30 minutes of inactivity',
      timestamp: '2024-10-01 09:45',
    },
  ];

  const roles = ['Psychiatrist', 'Psychologist', 'Therapist', 'Nurse', 'Admin'];
  const permissions = [
    'View Records',
    'Edit Records',
    'Prescribe',
    'View Therapy Notes',
    'Admin Access',
    'Manage Staff',
  ];

  const rolePermissions: { [key: string]: boolean[] } = {
    Psychiatrist: [true, true, true, true, false, false],
    Psychologist: [true, true, false, true, false, false],
    Therapist: [true, false, false, true, false, false],
    Nurse: [true, false, false, false, false, false],
    Admin: [true, true, true, true, true, true],
  };

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const getSeverityBadgeVariant = (severity: string) => {
    if (severity === 'Critical') return 'destructive';
    if (severity === 'High') return 'secondary';
    return 'outline';
  };

  const toggleMenu = (menuId: string) => {
    setVisibleMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const criticalAlerts = securityAlerts.filter((a) => a.severity === 'Critical');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>🔐</Text>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WelcomeNew')}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>{staffId}</Text>
        </View>

        {/* Critical Security Alerts */}
        {criticalAlerts.length > 0 && !criticalAlertsDismissed && (
          <View>
            <TouchableOpacity onPress={() => setCriticalAlertsDismissed(true)} activeOpacity={0.9}>
              <Alert
                variant="destructive"
                title="🚨 Critical Security Alerts"
                description={`${criticalAlerts.length} critical security issues detected. Tap to dismiss.`}
                style={styles.criticalAlert}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="staff" style={styles.tabs}>
          <TabsList>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Staff Accounts Tab */}
          <TabsContent value="staff">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Staff Accounts</Text>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={handleAddStaff}>
                <Text style={styles.addButtonText}>➕ Add Staff</Text>
              </TouchableOpacity>
            </View>

            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              leftIcon={<Text>🔍</Text>}
              style={styles.searchInput}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading staff members...</Text>
              </View>
            ) : (
              <View style={styles.staffList}>
                {filteredStaff.map((staff) => (
                  <Card key={staff.id} style={styles.staffCard}>
                    <CardContent>
                      <View style={styles.staffHeader}>
                        <View style={styles.staffInfo}>
                          <Text style={styles.staffName}>{staff.name}</Text>
                          <Text style={styles.staffId}>{staff.id}</Text>
                          <Text style={styles.staffEmail}>{staff.email}</Text>
                        </View>
                        <View style={styles.staffBadges}>
                          <Badge variant="outline" style={styles.roleBadge}>
                            <Text style={styles.badgeText}>{staff.role}</Text>
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(staff.status)}>
                            <Text style={styles.badgeText}>{staff.status}</Text>
                          </Badge>
                        </View>
                      </View>

                      <View style={styles.staffFooter}>
                        <Text style={styles.lastActive}>Last active: {staff.lastActive}</Text>
                        <View style={styles.staffActions}>
                          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={() => handleEditStaff(staff)}>
                            <Text style={styles.actionButtonText}>✏️ Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={() => handleViewStaff(staff)}>
                            <Text style={styles.actionButtonText}>👁️ View</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            )}
          </TabsContent>

          {/* Role Assignment Tab */}
          <TabsContent value="roles">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Role Permissions Matrix</Text>
            </View>

            <Card style={styles.permissionsCard}>
              <CardContent>
                {/* Permissions Header */}
                <View style={styles.permissionsTable}>
                  <View style={styles.permissionsHeaderRow}>
                    <Text style={styles.permissionsHeaderCell}>Role</Text>
                    {permissions.map((perm, idx) => (
                      <Text key={idx} style={styles.permissionsHeaderCellSmall}>
                        {perm.split(' ')[0]}
                      </Text>
                    ))}
                  </View>

                  {/* Permissions Rows */}
                  {roles.map((role) => (
                    <View key={role} style={styles.permissionsRow}>
                      <Text style={styles.roleCell}>{role}</Text>
                      {rolePermissions[role].map((hasPermission, idx) => (
                        <View key={idx} style={styles.permissionCell}>
                          <Text style={styles.permissionIcon}>
                            {hasPermission ? '✅' : '❌'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>

            {/* Role Change Section */}
            <Card style={styles.roleChangeCard}>
              <CardHeader>
                <CardTitle>Manage Admin Access</CardTitle>
              </CardHeader>
              <CardContent>
                <Text style={styles.sectionDescription}>
                  Grant or revoke admin privileges. All other roles can be managed in the Staff tab.
                </Text>
                {staffMembers.slice(0, 4).map((staff) => {
                  const isCurrentUser = staff.email === 'admin@neurolock.com'; // Or use actual logged in user email
                  return (
                    <View key={staff.id} style={styles.roleChangeItem}>
                      <View style={styles.roleChangeInfo}>
                        <Text style={styles.roleChangeName}>
                          {staff.name}{isCurrentUser && ' (You)'}
                        </Text>
                        <Text style={styles.roleChangeRole}>{staff.role}</Text>
                      </View>
                      {isCurrentUser ? (
                        <View style={styles.adminToggleButtonDisabled}>
                          <Text style={styles.adminToggleTextDisabled}>Can't modify self</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.adminToggleButton,
                            staff.role.toLowerCase() === 'admin' && styles.adminToggleButtonActive,
                          ]}
                          onPress={() => {
                            const newRole = staff.role.toLowerCase() === 'admin' ? 'Nurse' : 'Admin';
                            handleChangeRole(staff, newRole);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.adminToggleText,
                              staff.role.toLowerCase() === 'admin' && styles.adminToggleTextActive,
                            ]}
                          >
                            {staff.role.toLowerCase() === 'admin' ? '✓ Admin' : 'Make Admin'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>System Audit Logs</Text>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={handleExportAuditLogs}>
                <Text style={styles.addButtonText}>📥 Export</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.auditList}>
              {auditLogs.map((log) => (
                <Card key={log.id} style={styles.auditCard}>
                  <CardContent>
                    <View style={styles.auditHeader}>
                      <Text style={styles.auditUser}>{log.user}</Text>
                      <Text style={styles.auditTimestamp}>{log.timestamp}</Text>
                    </View>
                    <Text style={styles.auditAction}>{log.action}</Text>
                    <Text style={styles.auditIp}>IP: {log.ipAddress}</Text>
                  </CardContent>
                </Card>
              ))}
            </View>
          </TabsContent>

          {/* Security Reports Tab */}
          <TabsContent value="security">
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Security Reports</Text>
            </View>

            {/* Security Metrics */}
            <View style={styles.metricsGrid}>
              <Card style={styles.metricCard}>
                <CardContent style={styles.metricContent}>
                  <Text style={styles.metricValue}>12</Text>
                  <Text style={styles.metricLabel}>Failed Logins</Text>
                </CardContent>
              </Card>
              <Card style={styles.metricCard}>
                <CardContent style={styles.metricContent}>
                  <Text style={styles.metricValue}>3</Text>
                  <Text style={styles.metricLabel}>Blocked IPs</Text>
                </CardContent>
              </Card>
              <Card style={styles.metricCard}>
                <CardContent style={styles.metricContent}>
                  <Text style={styles.metricValue}>5</Text>
                  <Text style={styles.metricLabel}>MFA Bypass</Text>
                </CardContent>
              </Card>
            </View>

            {/* Security Alerts */}
            <View style={styles.securityList}>
              {securityAlerts.map((alert) => (
                <TouchableOpacity key={alert.id} activeOpacity={0.7} onPress={() => handleViewSecurityAlert(alert)}>
                  <Card style={styles.securityCard}>
                    <CardContent>
                    <View style={styles.securityHeader}>
                      <Text style={styles.securityType}>{alert.type}</Text>
                      <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                        <Text style={styles.badgeText}>{alert.severity}</Text>
                      </Badge>
                    </View>
                    <Text style={styles.securityDescription}>{alert.description}</Text>
                    <Text style={styles.securityTimestamp}>⏰ {alert.timestamp}</Text>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            {/* System Health */}
            <Card style={styles.systemHealthCard}>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>🔐 Active Sessions</Text>
                  <Text style={styles.healthValue}>24</Text>
                </View>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>💾 Database Status</Text>
                  <Text style={[styles.healthValue, { color: '#10b981' }]}>Healthy</Text>
                </View>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>💿 Last Backup</Text>
                  <Text style={styles.healthValue}>2 hours ago</Text>
                </View>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>🔒 Encryption</Text>
                  <Text style={[styles.healthValue, { color: '#10b981' }]}>Active</Text>
                </View>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollView>

      {/* Edit Staff Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Staff Member</Text>
            
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter name"
            />

            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Role</Text>
            <View style={styles.rolePickerContainer}>
              {['Psychiatrist', 'Psychologist', 'Therapist', 'Nurse', 'Admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.rolePill,
                    editRole === role && styles.rolePillActive,
                  ]}
                  onPress={() => setEditRole(role)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      editRole === role && styles.rolePillTextActive,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  editStatus === 'Active' && styles.statusButtonActive,
                ]}
                onPress={() => setEditStatus('Active')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    editStatus === 'Active' && styles.statusButtonTextActive,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  editStatus === 'Inactive' && styles.statusButtonInactive,
                ]}
                onPress={() => setEditStatus('Inactive')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    editStatus === 'Inactive' && styles.statusButtonTextInactive,
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={handleSaveStaffEdit}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Verification Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setPasswordModalVisible(false);
          setVerificationPassword('');
          setPendingAdminAction(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 400 }]}>
            <Text style={styles.modalTitle}>🔐 Admin Verification Required</Text>
            <Text style={styles.verificationText}>
              Changing admin roles requires password verification for security.
            </Text>
            
            <Text style={styles.modalLabel}>Enter Your Password</Text>
            <TextInput
              style={styles.modalInput}
              value={verificationPassword}
              onChangeText={setVerificationPassword}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setVerificationPassword('');
                  setPendingAdminAction(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={handleVerifyPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonSaveText}>Verify & Continue</Text>
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
  criticalAlert: {
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
  staffList: {
    gap: 12,
  },
  staffCard: {
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  staffId: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  staffEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  staffBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  roleBadge: {
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  staffFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lastActive: {
    fontSize: 12,
    color: '#6b7280',
  },
  staffActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1f2937',
  },
  permissionsCard: {
    marginBottom: 16,
  },
  permissionsTable: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  permissionsHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  permissionsHeaderCell: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 8,
  },
  permissionsHeaderCellSmall: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  permissionsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  roleCell: {
    width: 100,
    fontSize: 12,
    color: '#1f2937',
    paddingHorizontal: 8,
  },
  permissionCell: {
    flex: 1,
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 14,
  },
  roleChangeCard: {
    marginTop: 16,
  },
  roleChangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  roleChangeInfo: {
    flex: 1,
  },
  roleChangeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  roleChangeRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleChangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  roleChangeButtonText: {
    fontSize: 12,
    color: '#1f2937',
  },
  auditList: {
    gap: 12,
  },
  auditCard: {
    marginBottom: 12,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  auditUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  auditTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  auditAction: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 6,
  },
  auditIp: {
    fontSize: 12,
    color: '#6b7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  securityList: {
    gap: 12,
    marginBottom: 16,
  },
  securityCard: {
    marginBottom: 12,
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  securityDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  securityTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  systemHealthCard: {
    marginTop: 8,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  healthLabel: {
    fontSize: 14,
    color: '#1f2937',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  rolePickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  rolePillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  rolePillText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  rolePillTextActive: {
    color: '#ffffff',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  statusButtonInactive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
  statusButtonTextInactive: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalButtonSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  modalButtonSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  verificationText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  adminToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 110,
    alignItems: 'center',
  },
  adminToggleButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  adminToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  adminToggleTextActive: {
    color: '#ffffff',
  },
  adminToggleButtonDisabled: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 110,
    alignItems: 'center',
  },
  adminToggleTextDisabled: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
});
