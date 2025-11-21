# NeuroLock Settings System Implementation

## Overview

The NeuroLock Settings system now provides persistent storage for user preferences including localization (language, timezone, date format), MFA settings, notifications, and security preferences. All settings are automatically loaded when the Settings screen opens and saved to device storage.

## Features Implemented

### 1. **Persistent Settings Storage**
- Settings are stored locally using AsyncStorage
- Each user has their own settings profile using their `staffId`
- Settings persist across app sessions

### 2. **Localization Support**
- **Language**: English (en), Spanish (es), French (fr)
- **Timezone**: Multiple timezone options (Eastern, Central, etc.)
- **Date Format**: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD

### 3. **Automatic Loading**
- Settings automatically load from storage when SettingsScreenNew opens
- Component uses `useEffect` hook to load on mount

### 4. **Settings Service**
- New `settingsService.ts` provides utility functions for accessing and managing settings throughout the app

## Files Modified/Created

### Modified:
- `frontend/components/SettingsScreenNew.tsx`
  - Added `useEffect` for loading settings on mount
  - Updated `handleSaveSettings()` to persist data to AsyncStorage
  - Added loading state management with `isSaving` flag

### Created:
- `frontend/services/settingsService.ts`
  - Centralized settings management utilities
  - Functions for getting/setting individual preferences
  - Helpers for formatting dates and times based on user preferences
  - i18n stub for translation support

## Usage Examples

### In SettingsScreenNew.tsx (Already Implemented)

Settings are automatically loaded when component mounts:
```typescript
useEffect(() => {
  loadSettings();
}, []);
```

When user clicks "Save Settings", all settings are persisted:
```typescript
const handleSaveSettings = async () => {
  // ... save logic
  await AsyncStorage.setItem(`user_settings_${staffId}`, JSON.stringify(settingsData));
  showToast('✓ Settings saved successfully');
};
```

### Using Settings Service in Other Components

```typescript
import { 
  getUserSettings,
  getUserLanguage,
  getUserTimezone,
  formatDateWithUserPreference,
  formatTimeWithUserTimezone 
} from '../services/settingsService';

// Get all settings for a user
const settings = await getUserSettings(staffId);

// Get specific settings
const language = await getUserLanguage(staffId);
const timezone = await getUserTimezone(staffId);

// Format dates/times with user preferences
const formattedDate = await formatDateWithUserPreference(new Date(), staffId);
const formattedTime = await formatTimeWithUserTimezone(new Date(), staffId);
```

## Data Structure

Settings are stored as JSON in AsyncStorage with the key `user_settings_{staffId}`:

```json
{
  "preferredMFA": "authenticator",
  "backupMFAEnabled": true,
  "biometricEnabled": true,
  "emailNotifications": true,
  "securityAlerts": true,
  "sessionReminders": false,
  "language": "en",
  "timezone": "America/New_York",
  "dateFormat": "MM/DD/YYYY",
  "autoLockTimeout": "15",
  "deviceTrust": true,
  "loginAlerts": true,
  "lastUpdated": "2024-10-02T14:30:00.000Z",
  "staffId": "STAFF-001",
  "userRole": "psychiatrist"
}
```

## Testing the Implementation

1. **Settings Are Saved:**
   - Open Settings screen
   - Change Language, Timezone, or Date Format
   - Click "Save Settings"
   - You should see: ✓ Settings saved successfully

2. **Settings Persist:**
   - Close the Settings screen
   - Go back to Settings
   - Values should remain as you set them (loaded from AsyncStorage)

3. **Settings Work Across Restarts:**
   - Set a preference and save
   - Close the app completely
   - Reopen the app and navigate to Settings
   - Your preference is still there

## Future Enhancements

1. **Internationalization (i18n)**
   - Implement full translation system using i18n-js or similar
   - Replace `getTranslation()` stub with actual i18n library

2. **Backend Sync**
   - Optionally sync settings to backend for cross-device support
   - Use `api.ts` to POST settings to `/api/settings/update`

3. **Real-time Updates**
   - Implement Settings Context to update app-wide when settings change
   - Use React Context API to provide settings to entire component tree

4. **Settings Export/Import**
   - Allow users to export settings as JSON file
   - Allow users to import settings from file

## API Reference

### settingsService.ts Functions

#### `getUserSettings(staffId: string): Promise<UserSettings>`
Get all user settings. Returns default settings if none found.

#### `getSetting<K extends keyof UserSettings>(staffId: string, key: K): Promise<UserSettings[K] | undefined>`
Get a specific setting value.

#### `getUserLanguage(staffId: string): Promise<string>`
Get user's language preference. Defaults to 'en'.

#### `getUserTimezone(staffId: string): Promise<string>`
Get user's timezone. Defaults to 'America/New_York'.

#### `getUserDateFormat(staffId: string): Promise<string>`
Get user's date format preference. Defaults to 'MM/DD/YYYY'.

#### `formatDateWithUserPreference(date: Date | string, staffId: string): Promise<string>`
Format a date according to user's date format preference.

#### `formatTimeWithUserTimezone(date: Date | string, staffId: string): Promise<string>`
Format a time according to user's timezone preference.

#### `getTranslation(key: string, staffId: string, defaultValue?: string): Promise<string>`
Get translated text (stub for i18n implementation).

#### `updateUserSettings(staffId: string, updates: Partial<UserSettings>): Promise<UserSettings>`
Update specific settings for a user.

#### `clearUserSettings(staffId: string): Promise<void>`
Clear all settings for a user (reset to defaults).

## Default Settings

All settings have sensible defaults:

| Setting | Default |
|---------|---------|
| language | 'en' |
| timezone | 'America/New_York' |
| dateFormat | 'MM/DD/YYYY' |
| preferredMFA | 'authenticator' |
| backupMFAEnabled | true |
| biometricEnabled | true |
| emailNotifications | true |
| securityAlerts | true |
| sessionReminders | false |
| autoLockTimeout | '15' |
| deviceTrust | true |
| loginAlerts | true |

## Troubleshooting

### Settings Not Persisting
1. Check AsyncStorage is installed: `npm list @react-native-async-storage/async-storage`
2. Verify staffId is being passed correctly to route params
3. Check browser/device console for AsyncStorage errors

### Settings Not Loading
1. Verify loadSettings() is called in useEffect
2. Check that the settings key format is correct: `user_settings_${staffId}`
3. Verify AsyncStorage contains the key (use React DevTools to inspect)

### Date/Time Not Formatting Correctly
1. Ensure staffId is available and correct
2. Check timezone string is valid (use Intl.DateTimeFormat.supportedLocalesOf())
3. Verify date object is valid Date instance

## Implementation Status

✅ **Completed:**
- Persistent storage to AsyncStorage
- Settings loading on component mount
- Save functionality with error handling
- Settings service with utility functions
- Date/time formatting helpers
- i18n translation stub

🚧 **To Do (Future):**
- Full i18n implementation
- Backend sync
- Settings context provider
- Settings export/import
- Real-time app-wide setting updates
