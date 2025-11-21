# How to Use Settings in Dashboard Components

## Overview

The new `settingsService.ts` provides utilities for using user preferences throughout the app. This guide shows how to integrate settings into existing components.

## Example 1: Display Date with User's Format Preference

### Before (Static Format)
```typescript
// Component displays date in hardcoded format
const orderDate = "2024-10-02";
<Text>{orderDate}</Text>  // Always shows YYYY-MM-DD
```

### After (User Preference)
```typescript
import { formatDateWithUserPreference } from '../services/settingsService';

// In component
const [formattedDate, setFormattedDate] = useState('');

useEffect(() => {
  const formatDate = async () => {
    const formatted = await formatDateWithUserPreference('2024-10-02', staffId);
    setFormattedDate(formatted);
  };
  formatDate();
}, [staffId]);

<Text>{formattedDate}</Text>
// If user chose MM/DD/YYYY: "10/02/2024"
// If user chose DD/MM/YYYY: "02/10/2024"
// If user chose YYYY-MM-DD: "2024-10-02"
```

## Example 2: Display Time with User's Timezone

### Before (Local Time)
```typescript
const timestamp = new Date();
<Text>{timestamp.toLocaleTimeString()}</Text>  // User's local time
```

### After (Respects User's Timezone Preference)
```typescript
import { formatTimeWithUserTimezone } from '../services/settingsService';

const [formattedTime, setFormattedTime] = useState('');

useEffect(() => {
  const formatTime = async () => {
    const formatted = await formatTimeWithUserTimezone(new Date(), staffId);
    setFormattedTime(formatted);
  };
  formatTime();
}, [staffId]);

<Text>{formattedTime}</Text>
// Format respects user's selected timezone
```

## Example 3: Get User's Language Preference

### Code
```typescript
import { getUserLanguage } from '../services/settingsService';

const [userLanguage, setUserLanguage] = useState('en');

useEffect(() => {
  const getLanguage = async () => {
    const lang = await getUserLanguage(staffId);
    setUserLanguage(lang);
  };
  getLanguage();
}, [staffId]);

// Use the language variable
if (userLanguage === 'es') {
  // Show Spanish content
} else if (userLanguage === 'fr') {
  // Show French content
} else {
  // Show English content
}
```

## Example 4: Get All User Settings

### Code
```typescript
import { getUserSettings } from '../services/settingsService';

const [settings, setSettings] = useState(null);

useEffect(() => {
  const loadSettings = async () => {
    const userSettings = await getUserSettings(staffId);
    setSettings(userSettings);
  };
  loadSettings();
}, [staffId]);

// Access any setting
if (settings) {
  console.log('Date Format:', settings.dateFormat);
  console.log('Timezone:', settings.timezone);
  console.log('Language:', settings.language);
  console.log('Auto Lock Timeout:', settings.autoLockTimeout);
}
```

## Example 5: Integrating into a Dashboard Component

Here's a complete example of adding date formatting to a dashboard that shows orders:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { formatDateWithUserPreference } from '../services/settingsService';

interface Order {
  id: string;
  productName: string;
  orderDate: string;
  amount: number;
}

interface DashboardProps {
  navigation: any;
  route: any;
  staffId: string;
}

export function OrdersDashboard({ navigation, route, staffId }: DashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [formattedOrders, setFormattedOrders] = useState<(Order & { displayDate: string })[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // Fetch orders from API
    const data: Order[] = [
      { id: '1', productName: 'Medication A', orderDate: '2024-10-02', amount: 150 },
      { id: '2', productName: 'Medication B', orderDate: '2024-09-28', amount: 200 },
    ];
    setOrders(data);

    // Format dates based on user preference
    const formatted = await Promise.all(
      data.map(async (order) => ({
        ...order,
        displayDate: await formatDateWithUserPreference(order.orderDate, staffId),
      }))
    );
    setFormattedOrders(formatted);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={formattedOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.productName}</Text>
            <Text>{item.displayDate}</Text>
            <Text>${item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

## Example 6: Creating a Custom Hook for Settings

For repeated use of settings, create a custom hook:

```typescript
// hooks/useUserSettings.ts
import { useEffect, useState } from 'react';
import { getUserSettings, UserSettings } from '../services/settingsService';

export function useUserSettings(staffId: string) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const userSettings = await getUserSettings(staffId);
      setSettings(userSettings);
      setLoading(false);
    };
    loadSettings();
  }, [staffId]);

  return { settings, loading };
}
```

### Usage in Components:
```typescript
import { useUserSettings } from '../hooks/useUserSettings';

export function MyComponent({ staffId }: { staffId: string }) {
  const { settings, loading } = useUserSettings(staffId);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Language: {settings?.language}</Text>
      <Text>Timezone: {settings?.timezone}</Text>
      <Text>Date Format: {settings?.dateFormat}</Text>
    </View>
  );
}
```

## Example 7: Updating Settings from Components

If you want to update settings from other components:

```typescript
import { updateUserSettings } from '../services/settingsService';

// Update specific settings
const updateMySettings = async () => {
  const updated = await updateUserSettings(staffId, {
    language: 'fr',
    timezone: 'America/Los_Angeles',
  });
  console.log('Updated settings:', updated);
};

<Button onPress={updateMySettings}>Change Language to French</Button>
```

## Integration Checklist

When adding settings support to a component:

- [ ] Import the required function(s) from `settingsService`
- [ ] Add state variable(s) for formatted data
- [ ] Add `useEffect` to load/format data on mount or when dependencies change
- [ ] Use the formatted value in your render/display
- [ ] Test that changes in Settings screen affect the component display
- [ ] Handle loading state if needed

## Common Patterns

### Pattern 1: Format All Dates in an Array
```typescript
const dateArray = ['2024-10-01', '2024-10-02', '2024-10-03'];
const formatted = await Promise.all(
  dateArray.map(date => formatDateWithUserPreference(date, staffId))
);
```

### Pattern 2: Show Formatted Date and Time Together
```typescript
const formattedDate = await formatDateWithUserPreference(now, staffId);
const formattedTime = await formatTimeWithUserTimezone(now, staffId);
const display = `${formattedDate} ${formattedTime}`;
```

### Pattern 3: Conditional UI Based on Language
```typescript
const language = await getUserLanguage(staffId);
const message = language === 'es' 
  ? 'Cita programada'
  : language === 'fr'
  ? 'Rendez-vous programmé'
  : 'Appointment scheduled';
```

### Pattern 4: Create Reusable Date Display Component
```typescript
interface DateDisplayProps {
  date: Date | string;
  staffId: string;
  style?: any;
}

export function FormattedDateDisplay({ date, staffId, style }: DateDisplayProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const format = async () => {
      const formatted = await formatDateWithUserPreference(date, staffId);
      setFormattedDate(formatted);
    };
    format();
  }, [date, staffId]);

  return <Text style={style}>{formattedDate}</Text>;
}

// Usage in any component:
<FormattedDateDisplay date={new Date()} staffId={staffId} />
```

## Performance Tips

1. **Batch Load Settings**: Load once in a parent component and pass down
   ```typescript
   const { settings } = useUserSettings(staffId);
   // Pass settings as prop to child components
   ```

2. **Memoize Formatted Dates**: Avoid reformatting same date multiple times
   ```typescript
   const memoizedFormattedDate = useMemo(
     () => formatDateWithUserPreference(date, staffId),
     [date, staffId]
   );
   ```

3. **Use useCallback for Format Functions**:
   ```typescript
   const formatDate = useCallback(
     (date: string) => formatDateWithUserPreference(date, staffId),
     [staffId]
   );
   ```

## Troubleshooting

### "Settings returning undefined"
- Check staffId is passed correctly
- Verify AsyncStorage contains data for that staffId
- Use the service's `loadSettings()` debug helper

### "Dates not formatting"
- Ensure date string is valid format (ISO 8601 recommended: "2024-10-02")
- Check date object is valid `new Date()` instance
- Verify timezone string exists in user's settings

### "Null/undefined errors"
- Always check if settings are loaded before using
- Use optional chaining: `settings?.dateFormat ?? 'MM/DD/YYYY'`
- Add loading states to prevent render before data arrives

---

For more details, see `SETTINGS_IMPLEMENTATION.md`
