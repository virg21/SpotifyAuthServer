# Middleware Components

## Rate Limiting

The application implements API rate limiting to protect against abuse and ensure service availability.

### Configuration

Rate limits are defined in `rateLimiter.ts` and applied to different types of routes:

1. **Standard Limiter**
   - 100 requests per 15 minutes per IP
   - Applied to general purpose endpoints

2. **Auth Limiter**
   - 10 requests per hour per IP
   - Applied to authentication endpoints (login/register)

3. **Verification Limiter**
   - 5 requests per hour per IP
   - Applied to email/phone verification endpoints

4. **Recovery Limiter**
   - 3 requests per hour per IP
   - Applied to password recovery endpoints

5. **API Limiter**
   - 30 requests per 15 minutes per IP
   - Applied to computation-heavy API endpoints

### Environment Configuration

Rate limiting is automatically enabled in production environments. For development environments, you can force enable rate limiting by setting the `FORCE_RATE_LIMIT=true` environment variable.

### Error Responses

When a rate limit is exceeded, the client will receive a 429 (Too Many Requests) response with a JSON error message:

```json
{
  "status": "error",
  "message": "Too many requests, please try again later."
}
```

### How to Apply

To apply a rate limiter to a route, import the appropriate limiter function from `rateLimiter.ts` and add it as middleware:

```typescript
import { getAuthLimiter } from '../middleware/rateLimiter';

router.post('/login', getAuthLimiter(), loginController);
```

Note that each limiter is a function that must be called when used as middleware.