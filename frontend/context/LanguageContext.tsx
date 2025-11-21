import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on app start
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        console.log('🌐 Loaded app language from storage:', savedLanguage);
        setLanguageState(savedLanguage);
      } else {
        console.log('🌐 No saved language, using default: en');
      }
    } catch (error) {
      console.error('❌ Error loading language:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLanguage = async (lang: string) => {
    console.log('🌐 [LanguageContext] setLanguage() called with:', lang);
    console.log('🌐 [LanguageContext] Current language before change:', language);
    setLanguageState(lang);
    console.log('🌐 [LanguageContext] Language state updated to:', lang);
    try {
      await AsyncStorage.setItem('app_language', lang);
      console.log('✅ [LanguageContext] Language saved to storage:', lang);
    } catch (error) {
      console.error('❌ [LanguageContext] Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        // Settings
        settings: 'Settings',
        general: 'General',
        language: 'Language',
        timezone: 'Timezone',
        dateFormat: 'Date Format',
        save: 'Save Settings',
        saved: '✓ Settings saved successfully',
        error: '✗ Failed to save settings',
        mfa: '🔐 Multi-Factor Authentication',
        preferredMFA: 'Preferred MFA Method',
        backupMFA: 'Backup MFA Methods',
        biometric: 'Biometric Authentication',
        security: 'Security',
        session: 'Session Security',
        autoLock: 'Auto-lock Timeout',
        trustDevices: 'Remember Trusted Devices',
        devices: 'Devices',
        notifications: 'Alerts',
        emailNotifications: 'Email Notifications',
        securityAlerts: 'Security Alerts',
        sessionReminders: 'Session Reminders',
        preferences: 'General',
        accountInfo: '👤 Account Information',
        staffID: 'Staff ID',
        role: 'Role',
        created: 'Account Created',
        lastLogin: 'Last Login',
        preferencesLabel: 'Preferences',
        
        // Dashboards - Common
        dashboard: 'Dashboard',
        home: 'Home',
        profile: 'Profile',
        logout: 'Logout',
        welcome: 'Welcome',
        
        // Psychiatrist Dashboard
        psychiatristDashboard: 'Psychiatrist Dashboard',
        patients: 'Patients',
        appointments: 'Appointments',
        medications: 'Medications',
        reports: 'Reports',
        totalPatients: 'Total Patients',
        clinicalNotes: 'Clinical Notes',
        prescriptions: 'Prescriptions',
        myPatients: 'My Patients',
        patientID: 'Patient ID',
        diagnosed: 'Diagnosed',
        treatment: 'Treatment Plan',
        status: 'Status',
        lastVisit: 'Last Visit',
        clinicalNotesTab: 'Notes',
        reportsTab: 'Reports',
        noNotesYet: 'No clinical notes recorded yet',
        noReportsYet: 'No reports generated yet',
        addNote: 'Add Note',
        noPatients: 'No patients found',
        activeMeds: 'Active Meds',
        patientRecords: 'Patient Records',
        newPatient: '+ New Patient',
        searchPatients: 'Search patients...',
        diagnosis: 'Diagnosis',
        currentMedication: 'Current Medication',
        noAppointments: 'No appointments scheduled',
        scheduleAppointment: '📅 Schedule',
        clinicalNotesTitle: 'Clinical Notes',
        newNote: '📄 New Note',
        suspiciousActivityAlert: 'suspicious activity alert(s) require your attention',
        clinicalSummaries: 'Clinical summaries, diagnosis reports, and treatment progress documentation.',
        addNewPatient: 'Add New Patient',
        patientNamePlaceholder: 'Patient Name *',
        dateOfBirthPlaceholder: 'Date of Birth (YYYY-MM-DD) *',
        genderPlaceholder: 'Gender (M/F/Other) *',
        contactNumberPlaceholder: 'Contact Number',
        diagnosisPlaceholder: 'Diagnosis/ICD Code',
        cancel: 'Cancel',
        submit: 'Submit',
        addPatient: 'Add Patient',
        
        // Tab titles
        therapyNotes: 'Therapy Notes',
        alertTab: 'Alerts',
        
        // Section headers
        patientInformation: 'Patient Information',
        staffAccounts: 'Staff Accounts',
        
        // Common labels
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        active: 'Active',
        inactive: 'Inactive',
        highPriorityAlerts: 'High Priority Alerts',
        limitedToMedications: 'Limited to medication schedules and basic patient information. No therapy notes access.',
        
        // Nurse Medication Updates
        markAsAdministered: 'Mark as Administered',
        markAsPending: 'Mark as Pending',
        updateMedicationStatus: 'Update Medication Status',
        medicationName: 'Medication Name',
        patientNameLabel: 'Patient',
        timeLabel: 'Time',
        administratedSuccessfully: 'Medication marked as administered',
        confirmed: 'Confirmed',
        
        // Psychologist Dashboard
        psychologistDashboard: 'Psychologist Dashboard',
        assessments: 'Assessments',
        scheduledAssessments: 'Scheduled Assessments',
        assessmentType: 'Assessment Type',
        patient: 'Patient',
        scheduledDate: 'Scheduled Date',
        noAssessments: 'No assessments scheduled yet. Click "New Assessment" to schedule one.',
        availableAssessmentTools: 'Available Assessment Tools',
        clickToLearn: 'Click on any assessment tool below to learn more about it',
        newAssessment: 'New Assessment',
        
        // Therapist Dashboard
        therapistDashboard: 'Therapist Dashboard',
        accessLevel: 'Access Level',
        limitedAccess: 'Limited to therapy session logs and progress tracking only.',
        activeSessions: 'Active Sessions',
        sessionsCompleted: 'Sessions Completed',
        totalClients: 'Total Clients',
        averageProgress: 'Average Progress',
        sessionLogs: 'Session Logs',
        progressTracking: 'Progress Tracking',
        clientName: 'Client Name',
        sessionDate: 'Session Date',
        duration: 'Duration',
        minutes: 'min',
        notes: 'Notes',
        sessionsCompleted2: 'sessions completed',
        
        // Nurse Dashboard
        nurseDashboard: 'Nurse Dashboard',
        medicationSchedule: 'Medication Schedule',
        administered: 'Administered',
        pending: 'Pending',
        scheduled: 'Scheduled',
        vitals: 'Vitals',
        heartRate: 'Heart Rate',
        bpm: 'bpm',
        bloodPressure: 'Blood Pressure',
        lastChecked: 'Last checked',
        room: 'Room',
        medication: 'Medication',
        dosage: 'Dosage',
        time: 'Time',
        patientName: 'Patient Name',
        noPatients2: 'No patients assigned',
        
        // Admin Dashboard
        adminDashboard: 'Admin Dashboard',
        staff: 'Staff',
        auditLogs: 'Audit Logs',
        securityReports: 'Security Reports',
        systemHealth: 'System Health',
        staffManagement: 'Staff Management',
        name: 'Name',
        email: 'Email',
        lastActive: 'Last Active',
        auditLog: 'Audit Log',
        user: 'User',
        action: 'Action',
        timestamp: 'Timestamp',
        ipAddress: 'IP Address',
        failedLogins: 'Failed Logins',
        databaseStatus: 'Database Status',
        healthy: 'Healthy',
        activeSessions2: 'Active Sessions',
        unusualAccessPattern: 'Unusual access pattern',
        sessionTimeoutWarning: 'Session timeout warning',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      es: {
        // Settings
        settings: 'Configuración',
        general: 'General',
        language: 'Idioma',
        timezone: 'Zona Horaria',
        dateFormat: 'Formato de Fecha',
        save: 'Guardar Configuración',
        saved: '✓ Configuración guardada con éxito',
        error: '✗ Error al guardar la configuración',
        mfa: '🔐 Autenticación Multifactor',
        preferredMFA: 'Método MFA Preferido',
        backupMFA: 'Métodos MFA de Respaldo',
        biometric: 'Autenticación Biométrica',
        security: 'Seguridad',
        session: 'Seguridad de Sesión',
        autoLock: 'Tiempo de Bloqueo Automático',
        trustDevices: 'Recordar Dispositivos Confiables',
        devices: 'Dispositivos',
        notifications: 'Alertas',
        emailNotifications: 'Notificaciones por Correo',
        securityAlerts: 'Alertas de Seguridad',
        sessionReminders: 'Recordatorios de Sesión',
        preferences: 'General',
        accountInfo: '👤 Información de la Cuenta',
        staffID: 'ID de Personal',
        role: 'Función',
        created: 'Cuenta Creada',
        lastLogin: 'Último Acceso',
        preferencesLabel: 'Preferencias',
        
        // Dashboards - Common
        dashboard: 'Panel de Control',
        home: 'Inicio',
        profile: 'Perfil',
        logout: 'Cerrar Sesión',
        welcome: 'Bienvenido',
        
        // Psychiatrist Dashboard
        psychiatristDashboard: 'Panel de Psiquiatra',
        patients: 'Pacientes',
        appointments: 'Citas',
        medications: 'Medicamentos',
        reports: 'Informes',
        totalPatients: 'Total de Pacientes',
        clinicalNotes: 'Notas Clínicas',
        prescriptions: 'Prescripciones',
        myPatients: 'Mis Pacientes',
        patientID: 'ID del Paciente',
        diagnosed: 'Diagnosticado',
        treatment: 'Plan de Tratamiento',
        status: 'Estado',
        lastVisit: 'Última Visita',
        clinicalNotesTab: 'Notas',
        reportsTab: 'Informes',
        noNotesYet: 'Ninguna nota clínica registrada aún',
        noReportsYet: 'Ningún informe generado aún',
        addNote: 'Agregar Nota',
        noPatients: 'No se encontraron pacientes',
        activeMeds: 'Meds Activos',
        patientRecords: 'Registros de Pacientes',
        newPatient: '+ Nuevo Paciente',
        searchPatients: 'Buscar pacientes...',
        diagnosis: 'Diagnóstico',
        currentMedication: 'Medicamento Actual',
        noAppointments: 'No hay citas programadas',
        scheduleAppointment: '📅 Programar',
        clinicalNotesTitle: 'Notas Clínicas',
        newNote: '📄 Nueva Nota',
        suspiciousActivityAlert: 'alertas de actividad sospechosa requieren su atención',
        clinicalSummaries: 'Resúmenes clínicos, informes de diagnóstico y documentación del progreso del tratamiento.',
        addNewPatient: 'Agregar Nuevo Paciente',
        patientNamePlaceholder: 'Nombre del Paciente *',
        dateOfBirthPlaceholder: 'Fecha de Nacimiento (AAAA-MM-DD) *',
        genderPlaceholder: 'Género (M/F/Otro) *',
        contactNumberPlaceholder: 'Número de Contacto',
        diagnosisPlaceholder: 'Diagnóstico/Código ICD',
        cancel: 'Cancelar',
        submit: 'Enviar',
        addPatient: 'Agregar Paciente',
        
        // Tab titles
        therapyNotes: 'Notas de Terapia',
        alertTab: 'Alertas',
        
        // Section headers
        patientInformation: 'Información del Paciente',
        staffAccounts: 'Cuentas de Personal',
        
        // Common labels
        fullName: 'Nombre Completo',
        phoneNumber: 'Número de Teléfono',
        active: 'Activo',
        inactive: 'Inactivo',
        highPriorityAlerts: 'Alertas de Alta Prioridad',
        limitedToMedications: 'Limitado a horarios de medicamentos e información básica del paciente. Sin acceso a notas de terapia.',
        
        // Nurse Medication Updates
        markAsAdministered: 'Marcar como Administrado',
        markAsPending: 'Marcar como Pendiente',
        updateMedicationStatus: 'Actualizar Estado del Medicamento',
        medicationName: 'Nombre del Medicamento',
        patientNameLabel: 'Paciente',
        timeLabel: 'Hora',
        administratedSuccessfully: 'Medicamento marcado como administrado',
        confirmed: 'Confirmado',
        
        // Psychologist Dashboard
        psychologistDashboard: 'Panel de Psicólogo',
        assessments: 'Evaluaciones',
        scheduledAssessments: 'Evaluaciones Programadas',
        assessmentType: 'Tipo de Evaluación',
        patient: 'Paciente',
        scheduledDate: 'Fecha Programada',
        noAssessments: 'No hay evaluaciones programadas. Haga clic en "Nueva Evaluación" para programar una.',
        availableAssessmentTools: 'Herramientas de Evaluación Disponibles',
        clickToLearn: 'Haga clic en cualquier herramienta de evaluación para obtener más información',
        newAssessment: 'Nueva Evaluación',
        
        // Therapist Dashboard
        therapistDashboard: 'Panel de Terapeuta',
        accessLevel: 'Nivel de Acceso',
        limitedAccess: 'Limitado a registros de sesiones de terapia y seguimiento del progreso.',
        activeSessions: 'Sesiones Activas',
        sessionsCompleted: 'Sesiones Completadas',
        totalClients: 'Total de Clientes',
        averageProgress: 'Progreso Promedio',
        sessionLogs: 'Registros de Sesión',
        progressTracking: 'Seguimiento del Progreso',
        clientName: 'Nombre del Cliente',
        sessionDate: 'Fecha de Sesión',
        duration: 'Duración',
        minutes: 'min',
        notes: 'Notas',
        sessionsCompleted2: 'sesiones completadas',
        
        // Nurse Dashboard
        nurseDashboard: 'Panel de Enfermería',
        medicationSchedule: 'Horario de Medicamentos',
        administered: 'Administrado',
        pending: 'Pendiente',
        scheduled: 'Programado',
        vitals: 'Signos Vitales',
        heartRate: 'Frecuencia Cardíaca',
        bpm: 'lpm',
        bloodPressure: 'Presión Arterial',
        lastChecked: 'Última revisión',
        room: 'Sala',
        medication: 'Medicamento',
        dosage: 'Dosis',
        time: 'Hora',
        patientName: 'Nombre del Paciente',
        noPatients2: 'No hay pacientes asignados',
        
        // Admin Dashboard
        adminDashboard: 'Panel de Administrador',
        staff: 'Personal',
        auditLogs: 'Registros de Auditoría',
        securityReports: 'Informes de Seguridad',
        systemHealth: 'Salud del Sistema',
        staffManagement: 'Gestión de Personal',
        name: 'Nombre',
        email: 'Correo Electrónico',
        lastActive: 'Último Activo',
        auditLog: 'Registro de Auditoría',
        user: 'Usuario',
        action: 'Acción',
        timestamp: 'Marca de Tiempo',
        ipAddress: 'Dirección IP',
        failedLogins: 'Inicios de Sesión Fallidos',
        databaseStatus: 'Estado de la Base de Datos',
        healthy: 'Saludable',
        activeSessions2: 'Sesiones Activas',
        unusualAccessPattern: 'Patrón de acceso inusual',
        sessionTimeoutWarning: 'Advertencia de tiempo de espera de sesión',
        high: 'Alto',
        medium: 'Medio',
        low: 'Bajo',
      },
      fr: {
        // Settings
        settings: 'Paramètres',
        general: 'Général',
        language: 'Langue',
        timezone: 'Fuseau Horaire',
        dateFormat: 'Format de Date',
        save: 'Enregistrer les Paramètres',
        saved: '✓ Paramètres enregistrés avec succès',
        error: '✗ Erreur lors de l\'enregistrement des paramètres',
        mfa: '🔐 Authentification Multifacteur',
        preferredMFA: 'Méthode MFA Préférée',
        backupMFA: 'Méthodes MFA de Secours',
        biometric: 'Authentification Biométrique',
        security: 'Sécurité',
        session: 'Sécurité de Session',
        autoLock: 'Délai de Verrouillage Automatique',
        trustDevices: 'Se Souvenir des Appareils de Confiance',
        devices: 'Appareils',
        notifications: 'Alertes',
        emailNotifications: 'Notifications par E-mail',
        securityAlerts: 'Alertes de Sécurité',
        sessionReminders: 'Rappels de Session',
        preferences: 'Général',
        accountInfo: '👤 Informations du Compte',
        staffID: 'ID du Personnel',
        role: 'Rôle',
        created: 'Compte Créé',
        lastLogin: 'Dernière Connexion',
        preferencesLabel: 'Préférences',
        
        // Dashboards - Common
        dashboard: 'Tableau de Bord',
        home: 'Accueil',
        profile: 'Profil',
        logout: 'Déconnexion',
        welcome: 'Bienvenue',
        
        // Psychiatrist Dashboard
        psychiatristDashboard: 'Tableau de Bord Psychiatre',
        patients: 'Patients',
        appointments: 'Rendez-vous',
        medications: 'Médicaments',
        reports: 'Rapports',
        totalPatients: 'Total des Patients',
        clinicalNotes: 'Notes Cliniques',
        prescriptions: 'Prescriptions',
        myPatients: 'Mes Patients',
        patientID: 'ID du Patient',
        diagnosed: 'Diagnostiqué',
        treatment: 'Plan de Traitement',
        status: 'Statut',
        lastVisit: 'Dernière Visite',
        clinicalNotesTab: 'Notes',
        reportsTab: 'Rapports',
        noNotesYet: 'Aucune note clinique enregistrée pour le moment',
        noReportsYet: 'Aucun rapport généré pour le moment',
        addNote: 'Ajouter une Note',
        noPatients: 'Aucun patient trouvé',
        activeMeds: 'Meds Actifs',
        patientRecords: 'Dossiers des Patients',
        newPatient: '+ Nouveau Patient',
        searchPatients: 'Rechercher des patients...',
        diagnosis: 'Diagnostic',
        currentMedication: 'Médicament Actuel',
        noAppointments: 'Aucun rendez-vous programmé',
        scheduleAppointment: '📅 Programmer',
        clinicalNotesTitle: 'Notes Cliniques',
        newNote: '📄 Nouvelle Note',
        suspiciousActivityAlert: 'alertes d\'activité suspecte requièrent votre attention',
        clinicalSummaries: 'Résumés cliniques, rapports de diagnostic et documentation des progrès du traitement.',
        addNewPatient: 'Ajouter un Nouveau Patient',
        patientNamePlaceholder: 'Nom du Patient *',
        dateOfBirthPlaceholder: 'Date de Naissance (AAAA-MM-JJ) *',
        genderPlaceholder: 'Genre (M/F/Autre) *',
        contactNumberPlaceholder: 'Numéro de Contact',
        diagnosisPlaceholder: 'Diagnostic/Code CIM',
        cancel: 'Annuler',
        submit: 'Soumettre',
        addPatient: 'Ajouter un Patient',
        
        // Psychologist Dashboard
        psychologistDashboard: 'Tableau de Bord Psychologue',
        assessments: 'Évaluations',
        scheduledAssessments: 'Évaluations Programmées',
        assessmentType: 'Type d\'Évaluation',
        patient: 'Patient',
        scheduledDate: 'Date Prévue',
        noAssessments: 'Aucune évaluation programmée. Cliquez sur "Nouvelle Évaluation" pour en programmer une.',
        availableAssessmentTools: 'Outils d\'Évaluation Disponibles',
        clickToLearn: 'Cliquez sur n\'importe quel outil d\'évaluation pour en savoir plus',
        newAssessment: 'Nouvelle Évaluation',
        
        // Therapist Dashboard
        therapistDashboard: 'Tableau de Bord Thérapeute',
        accessLevel: 'Niveau d\'Accès',
        limitedAccess: 'Limité aux journaux de session de thérapie et au suivi des progrès.',
        activeSessions: 'Sessions Actives',
        sessionsCompleted: 'Sessions Complétées',
        totalClients: 'Total des Clients',
        averageProgress: 'Progrès Moyen',
        sessionLogs: 'Journaux de Session',
        progressTracking: 'Suivi des Progrès',
        clientName: 'Nom du Client',
        sessionDate: 'Date de Session',
        duration: 'Durée',
        minutes: 'min',
        notes: 'Notes',
        sessionsCompleted2: 'sessions complétées',
        
        // Nurse Dashboard
        nurseDashboard: 'Tableau de Bord Infirmière',
        medicationSchedule: 'Horaire des Médicaments',
        administered: 'Administré',
        pending: 'En Attente',
        scheduled: 'Programmé',
        vitals: 'Signes Vitaux',
        heartRate: 'Fréquence Cardiaque',
        bpm: 'bpm',
        bloodPressure: 'Tension Artérielle',
        lastChecked: 'Dernière vérification',
        room: 'Salle',
        medication: 'Médicament',
        dosage: 'Posologie',
        time: 'Heure',
        patientName: 'Nom du Patient',
        noPatients2: 'Aucun patient assigné',
        
        // Admin Dashboard
        adminDashboard: 'Tableau de Bord Administrateur',
        staff: 'Personnel',
        auditLogs: 'Journaux d\'Audit',
        securityReports: 'Rapports de Sécurité',
        systemHealth: 'Santé du Système',
        staffManagement: 'Gestion du Personnel',
        name: 'Nom',
        email: 'E-mail',
        lastActive: 'Actif en Dernier',
        auditLog: 'Journal d\'Audit',
        user: 'Utilisateur',
        action: 'Action',
        timestamp: 'Horodatage',
        ipAddress: 'Adresse IP',
        failedLogins: 'Connexions Échouées',
        databaseStatus: 'État de la Base de Données',
        healthy: 'Sain',
        activeSessions2: 'Sessions Actives',
        unusualAccessPattern: 'Modèle d\'accès inhabituel',
        sessionTimeoutWarning: 'Avertissement de dépassement de délai de session',
        high: 'Élevé',
        medium: 'Moyen',
        low: 'Bas',
      },
    };

    const langTranslations = translations[language] || translations.en;
    const result = langTranslations[key] || key;
    console.log(`🌐 t("${key}") with lang="${language}" → "${result}"`);
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
