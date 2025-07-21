# Frontend Monitoring Dashboard Integration

This document explains the frontend implementation for the monitoring dashboard functionality.

## Overview

The frontend has been enhanced to support automatic monitoring dashboard opening after successfully pushing intents with LOGS configuration.

## New Components

### 1. MonitoringButton Component
**File:** `src/components/common/MonitoringButton.tsx`

A reusable button component that opens monitoring dashboards in new tabs.

**Props:**
- `urls: string[]` - Array of monitoring dashboard URLs
- `className?: string` - Optional CSS classes
- `disabled?: boolean` - Optional disabled state

**Features:**
- Shows URL count in button text
- Loading state during dashboard opening
- Staggered tab opening to prevent popup blocking
- Handles empty URL arrays gracefully

### 2. MonitoringTest Component
**File:** `src/components/common/MonitoringTest.tsx`

Test component for development and debugging monitoring functionality.

## Enhanced Components

### 1. ReviewModal Component
**Enhanced:** `src/components/review/ReviewModal.tsx`

**New Features:**
- Button changes from "Push Configuration" to "Monitor" after successful push
- Stores monitoring URLs from backend response
- Shows monitoring button count when available
- Provides "Done" button to close after monitoring

**New State:**
- `isPushed` - Tracks if intent was successfully pushed
- `monitoringUrls` - Stores URLs for monitoring dashboards
- `isMonitoring` - Tracks if monitoring dashboards are being opened

### 2. ChatPage Component
**Enhanced:** `src/pages/ChatPage.tsx`

**New Features:**
- Displays monitoring button in success notification
- Stores monitoring URLs from review modal
- Extended success message display duration

**New State:**
- `monitoringUrls` - Stores URLs for persistent access

## Type Definitions

### New Types in `src/types/intent.ts`

```typescript
export interface MonitoringConfig {
  urls: string[];
  configGenerated: boolean;
  reason?: string;
}

export interface PushIntentResponse {
  success: boolean;
  message: string;
  intentId?: string;
  monitoring?: MonitoringConfig;
}
```

## Service Updates

### IntentService Enhanced
**File:** `src/services/intentService.ts`

**Changes:**
- Updated `pushIntent` return type to `PushIntentResponse`
- Handles `monitoring` field from backend response
- Passes monitoring URLs to frontend components

## User Flow

1. **Create Intent:** User creates intent with LOGS configuration
2. **Review & Push:** User clicks "Review & Push" button
3. **Push Configuration:** User clicks "Push Configuration" in modal
4. **Backend Processing:** 
   - Intent pushed to network
   - JSON config file generated
   - Script executed to generate monitoring URLs
5. **Frontend Response:**
   - Button changes to "Monitor (X dashboards)"
   - Success message shows monitoring button
6. **Open Monitoring:** User clicks monitor button
   - Multiple tabs open with monitoring dashboards
   - Modal closes automatically

## Configuration Requirements

### Intent Structure for Monitoring

```json
{
  "intent": "Monitor database activity",
  "config": {
    "intent_id": "intent_123",
    "user_role": "admin",
    "LOGS": {
      "filters": [
        {
          "application": "DB",
          "time_window": "30s",
          "ports": "3306,3307"
        }
      ]
    }
  }
}
```

### Backend Response Structure

```json
{
  "message": "Configuration processed successfully",
  "intent_id": "intent_123",
  "monitoring": {
    "urls": [
      "http://localhost:3000/d/545b4595.../network-qos-overview?viewPanel=17&from=now-30s&to=now",
      "http://localhost:3000/d/545b4595.../network-qos-overview?viewPanel=18&from=now-30s&to=now"
    ],
    "configGenerated": true
  }
}
```

## Development & Testing

### Testing the MonitoringButton

1. Use the `MonitoringTest` component for development testing
2. Import and add to any page for testing:

```tsx
import MonitoringTest from '../components/common/MonitoringTest';

// Add to component render
<MonitoringTest />
```

### Manual Testing Steps

1. Create intent with LOGS configuration
2. Push intent through review modal
3. Verify button changes to "Monitor"
4. Click monitor button
5. Verify dashboards open in new tabs
6. Check browser console for logged URLs

### Debug Information

- Check browser console for monitoring button clicks
- Verify backend response includes monitoring field
- Check network tab for API responses
- Ensure popup blocking is disabled for testing

## Browser Compatibility

- **Modern Browsers:** Full support (Chrome, Firefox, Safari, Edge)
- **Popup Blocking:** Users may need to allow popups for monitoring functionality
- **Tab Opening:** Uses `window.open()` with `noopener,noreferrer` for security

## Security Considerations

- URLs are validated before opening
- New tabs opened with security flags
- No sensitive data passed in URL parameters
- Monitoring URLs use localhost (development) or configured monitoring server

## Future Enhancements

1. **Dashboard Embedding:** Embed dashboards in modal instead of new tabs
2. **URL Validation:** More robust URL validation and sanitization
3. **Monitoring History:** Store and display previously opened monitoring sessions
4. **Custom Time Windows:** Allow users to modify time windows before opening
5. **Dashboard Grouping:** Group related dashboards in single window
