# Server Utilities

## Email Service

The application uses SendGrid for sending transactional emails. The implementation consists of:

1. **sendgrid.ts**: Low-level utility functions for directly working with the SendGrid API.
2. **emailService.ts**: High-level service that provides specific email templates and functionality.

### Configuration

Two environment variables must be set:

- `SENDGRID_API_KEY`: Your SendGrid API key
- `SENDGRID_FROM_EMAIL`: The sender email address (must be verified in SendGrid)

### Available Email Templates

The `EmailService` class provides the following email types:

1. **Verification Emails**
   - Method: `sendVerificationCode(email, code)`
   - Used for: Email verification during account creation

2. **Welcome Emails**
   - Method: `sendWelcomeEmail(email, username)`
   - Used for: Onboarding after account verification

3. **Event Recommendations**
   - Method: `sendEventRecommendations(email, events)`
   - Used for: Personalized event suggestions

4. **Playlist Notifications**
   - Method: `sendPlaylistNotification(email, playlistName, eventName, spotifyUrl)`
   - Used for: Notifying users about newly created playlists

### Usage Example

```typescript
import { emailService } from '../utils/emailService';

// Send verification code
const success = await emailService.sendVerificationCode(
  'user@example.com',
  '123456'
);

// Check result
if (success) {
  console.log('Email sent successfully!');
} else {
  console.error('Failed to send email');
}
```

### Testing

You can test email functionality via the test endpoint:

```
POST /api/test/email
{
  "email": "recipient@example.com",
  "type": "verification|welcome|playlist|sendgrid-direct"
}
```

This endpoint is rate-limited for security.