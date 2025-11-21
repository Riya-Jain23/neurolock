import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  // MFA settings
  preferredMFA?: string;
  backupMFAEnabled?: boolean;
  biometricEnabled?: boolean;

  // Notification settings
  emailNotifications?: boolean;
  securityAlerts?: boolean;
  sessionReminders?: boolean;

  // Localization settings
  language?: string;
  timezone?: string;
  dateFormat?: string;

  // Security settings
  autoLockTimeout?: string;
  deviceTrust?: boolean;
  loginAlerts?: boolean;

  // Metadata
  lastUpdated?: string;
  staffId?: string;
  userRole?: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  preferredMFA: 'authenticator',
  backupMFAEnabled: true,
  biometricEnabled: true,
  emailNotifications: true,
  securityAlerts: true,
  sessionReminders: false,
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  autoLockTimeout: '15',
  deviceTrust: true,
  loginAlerts: true,
};

/**
 * Get all settings for a user
 */
export const getUserSettings = async (staffId: string): Promise<UserSettings> => {
  try {
    const savedSettings = await AsyncStorage.getItem(`user_settings_${staffId}`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Get a specific setting for a user
 */
export const getSetting = async <K extends keyof UserSettings>(
  staffId: string,
  key: K
): Promise<UserSettings[K] | undefined> => {
  try {
    const settings = await getUserSettings(staffId);
    return settings[key];
  } catch (error) {
    console.error(`Error retrieving setting ${String(key)}:`, error);
    return DEFAULT_SETTINGS[key];
  }
};

/**
 * Get the user's preferred language
 */
export const getUserLanguage = async (staffId: string): Promise<string> => {
  const language = await getSetting(staffId, 'language');
  return language || 'en';
};

/**
 * Get the user's timezone
 */
export const getUserTimezone = async (staffId: string): Promise<string> => {
  const timezone = await getSetting(staffId, 'timezone');
  return timezone || 'America/New_York';
};

/**
 * Get the user's date format preference
 */
export const getUserDateFormat = async (staffId: string): Promise<string> => {
  const dateFormat = await getSetting(staffId, 'dateFormat');
  return dateFormat || 'MM/DD/YYYY';
};

/**
 * Format a date according to user's preferences
 */
export const formatDateWithUserPreference = async (
  date: Date | string,
  staffId: string
): Promise<string> => {
  const dateFormat = await getUserDateFormat(staffId);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Format a time according to user's timezone
 */
export const formatTimeWithUserTimezone = async (
  date: Date | string,
  staffId: string
): Promise<string> => {
  const timezone = await getUserTimezone(staffId);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateObj.toLocaleTimeString();
  }
};

/**
 * Get translated text (stub for future i18n implementation)
 */
export const getTranslation = async (
  key: string,
  staffId: string,
  defaultValue: string = key
): Promise<string> => {
  const language = await getUserLanguage(staffId);

  // Simple translation stub - can be expanded to use i18n library
  const translations: Record<string, Record<string, string>> = {
    es: {
      settings: 'Configuración',
      language: 'Idioma',
      timezone: 'Zona horaria',
      dateFormat: 'Formato de fecha',
      save: 'Guardar',
    },
    fr: {
      settings: 'Paramètres',
      language: 'Langue',
      timezone: 'Fuseau horaire',
      dateFormat: 'Format de date',
      save: 'Enregistrer',
    },
  };

  return translations[language]?.[key] || defaultValue;
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  staffId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> => {
  try {
    const currentSettings = await getUserSettings(staffId);
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...updates,
      lastUpdated: new Date().toISOString(),
      staffId,
    };

    await AsyncStorage.setItem(
      `user_settings_${staffId}`,
      JSON.stringify(updatedSettings)
    );

    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Clear all settings for a user
 */
export const clearUserSettings = async (staffId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`user_settings_${staffId}`);
  } catch (error) {
    console.error('Error clearing settings:', error);
  }
};
