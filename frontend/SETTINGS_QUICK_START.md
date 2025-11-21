# Settings System - Quick Start Guide

## What Was Implemented

The NeuroLock Settings screen now has **fully functional persistent settings** with automatic loading and saving. 

### ✅ What Works Now

1. **Language, Timezone, Date Format Dropdowns**
   - Users can now select different values from the General tab
   - Selections actually change when tapped ✓

2. **Save Settings Button**
   - Clicking "Save Settings" now persists all user preferences
   - Settings are stored locally on the device using AsyncStorage
   - User sees success message: "✓ Settings saved successfully"

3. **Automatic Loading**
   - When user opens Settings screen, preferences are automatically loaded from storage
   - Previously saved values appear in dropdowns

4. **Persistent Across Sessions**
   - Settings survive app restarts
   - Each staff member has their own settings

## How It Works (Technical Overview)

### 1. When Settings Screen Opens
- `useEffect` hook runs on component mount
- `loadSettings()` function reads from AsyncStorage
- All state variables update with saved values

### 2. When User Changes Settings
- State updates immediately (dropdown shows new value)
- Changes are local only until "Save Settings" clicked

### 3. When User Clicks "Save Settings"
- `handleSaveSettings()` collects all current settings
- Packages them into a JSON object
- Saves to AsyncStorage with key: `user_settings_{staffId}`
- Shows success toast notification

### 4. Next Time Settings Screen Opens
- Same data is loaded and populated into dropdowns
- User sees their previous settings

## Files Changed

### Modified:
- `frontend/components/SettingsScreenNew.tsx`
  - Added AsyncStorage import
  - Added useEffect hook for loading
  - Implemented handleSaveSettings with persistence

### Created:
- `frontend/services/settingsService.ts` 
  - Utility functions for other components to use settings
  - Functions for formatting dates/times with user preferences
  - i18n translation support stub

### Documentation:
- `frontend/SETTINGS_IMPLEMENTATION.md` - Full technical documentation

## Using Settings in Other Components

If you want to use the user's saved localization preferences elsewhere in the app, use the settings service:

```typescript
import { 
  getUserLanguage, 
  getUserTimezone,
  formatDateWithUserPreference 
} from '../services/settingsService';

// Get user's language
const language = await getUserLanguage(staffId);

// Get user's timezone  
const timezone = await getUserTimezone(staffId);

// Format a date with their preference
const formatted = await formatDateWithUserPreference(new Date(), staffId);
// If they chose DD/MM/YYYY, this returns "02/10/2024"
// If they chose MM/DD/YYYY, this returns "10/02/2024"
```

## Testing It

1. **Test Settings Save:**
   - Open Settings screen
   - Go to General tab
   - Change Language to "Español"
   - Change Timezone to "Central (UTC-6)"
   - Change Date Format to "DD/MM/YYYY"
   - Click "Save Settings"
   - You should see: ✓ Settings saved successfully

2. **Test Settings Load:**
   - Close Settings screen
   - Go back to Settings
   - All values should be exactly as you set them

3. **Test Persistence:**
   - Set preferences and save
   - Close app completely
   - Reopen app
   - Navigate to Settings
   - Your preferences are still there ✓

## What's Stored

Each user's settings are stored as JSON:

```json
{
  "language": "es",
  "timezone": "America/Chicago", 
  "dateFormat": "DD/MM/YYYY",
  "preferredMFA": "authenticator",
  "backupMFAEnabled": true,
  "biometricEnabled": true,
  "emailNotifications": true,
  "securityAlerts": true,
  "sessionReminders": false,
  "autoLockTimeout": "15",
  "deviceTrust": true,
  "loginAlerts": true,
  "lastUpdated": "2024-10-02T14:30:00.000Z",
  "staffId": "STAFF-001",
  "userRole": "psychiatrist"
}
```

## Key Features

| Feature | Status |
|---------|--------|
| Save/Load from AsyncStorage | ✅ Done |
| Auto-load on screen open | ✅ Done |
| Persist across app sessions | ✅ Done |
| Language selection | ✅ Done |
| Timezone selection | ✅ Done |
| Date format selection | ✅ Done |
| Settings service for other components | ✅ Done |
| Date formatting with preferences | ✅ Done |
| Time formatting with timezone | ✅ Done |
| i18n stub for translations | ✅ Done |

## Known Limitations

1. **Language Selection Doesn't Translate UI Yet**
   - Setting language to Spanish/French saves the preference
   - But the rest of the app doesn't change language
   - (Full i18n implementation can be added later)

2. **Timezone Formatting Only Works with Date Service**
   - Dates displayed in dashboards won't auto-update to user timezone
   - They need to use the `formatTimeWithUserTimezone()` helper function
   - (Can be integrated into all date displays later)

## Next Steps (Optional Enhancements)

1. **Full Internationalization**
   - Implement i18n-js or similar library
   - Replace translation stub with real translations

2. **Global Settings Provider**
   - Create React Context with user settings
   - Make settings accessible throughout app
   - Components can subscribe to setting changes

3. **Backend Sync**
   - Send settings to backend for cloud sync
   - Allow settings to work across multiple devices
   - Add endpoint: `POST /api/settings/update`

4. **Apply Settings Throughout App**
   - Update all date displays to use user's date format
   - Update all timestamps to use user's timezone
   - Change UI language based on user preference
   - (Requires: Context provider + integration in each component)

## Debugging

### To Check Stored Settings:
```javascript
// In browser console or app debugger
import AsyncStorage from '@react-native-async-storage/async-storage';

const settings = await AsyncStorage.getItem('user_settings_STAFF-001');
console.log(JSON.parse(settings));
```

### To Clear Settings:
```javascript
await AsyncStorage.removeItem('user_settings_STAFF-001');
```

### To Update Specific Setting:
```javascript
import { updateUserSettings } from '../services/settingsService';

await updateUserSettings('STAFF-001', {
  language: 'fr',
  dateFormat: 'YYYY-MM-DD'
});
```

---

**Status:** ✅ Implementation Complete - Settings now persist and load correctly!
