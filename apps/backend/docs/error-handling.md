# Error Handling System

A comprehensive, unified error handling system for the Flarekit backend built on Hono and Zod OpenAPI.

## Table of Contents

- [Overview](#overview)
- [Error Architecture](#error-architecture)
- [Error Types](#error-types)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Response Format](#response-format)
- [Migration Guide](#migration-guide)
- [Monitoring & Debugging](#monitoring--debugging)

## Overview

Our error handling system provides:

- ✅ **Unified Error Hierarchy**: All errors extend from `BaseError`
- ✅ **Consistent Response Format**: Same JSON structure across all error types
- ✅ **Rich Context**: Detailed error information for debugging
- ✅ **Request Tracking**: Unique request IDs for log correlation
- ✅ **Category-based Organization**: Clear error categorization
- ✅ **Production Safety**: Environment-aware error exposure
- ✅ **Type Safety**: Full TypeScript support

## Error Architecture

```
BaseError (Abstract)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── ValidationError (400)
├── NotFoundError (404)
├── BusinessLogicError (400)
├── ExternalServiceError (502)
├── DatabaseError (500)
└── SystemError (500)
```

### Base Error Properties

Every error includes:

```typescript
interface BaseErrorResponse {
  code: string; // Specific error code
  status: number; // HTTP status code
  category: ErrorCategory; // Error category
  message: string; // Human-readable message
  details: ErrorDetail[]; // Additional error details
  timestamp: string; // ISO timestamp
  requestId?: string; // Unique request identifier
}
```

## Error Types

### 1. AuthenticationError (401)

Use when the user's identity cannot be verified.

```typescript
import { AuthenticationError } from '@/classes/AuthenticationError.class';

// Basic usage
throw new AuthenticationError('Invalid credentials');

// Using factory methods
throw AuthenticationError.invalidCredentials();
throw AuthenticationError.tokenExpired();
throw AuthenticationError.tokenInvalid();
throw AuthenticationError.missingCredentials();
throw AuthenticationError.accountLocked();
throw AuthenticationError.tooManyAttempts();

// With context
throw AuthenticationError.invalidCredentials({
  attemptedUsername: 'user@example.com',
  loginAttempts: 3,
});
```

**When to use:**

- Invalid username/password
- Expired or invalid JWT tokens
- Missing authentication headers
- Failed OAuth authentication
- Account locked/suspended scenarios

### 2. AuthorizationError (403)

Use when the user is authenticated but lacks permission.

```typescript
import { AuthorizationError } from '@/classes/AuthorizationError.class';

// Basic usage
throw new AuthorizationError('Access denied');

// Using factory methods
throw AuthorizationError.insufficientPermissions('users', 'delete');
throw AuthorizationError.accessDenied('admin-panel');
throw AuthorizationError.roleRequired('ADMIN', 'USER');
throw AuthorizationError.scopeInsufficient(
  ['read:users', 'write:users'],
  ['read:users'],
);
throw AuthorizationError.resourceOwnershipRequired('post-123', 'user-456');
throw AuthorizationError.actionNotPermitted('delete', 'public-post');
throw AuthorizationError.adminRequired();
throw AuthorizationError.quotaExceeded('API calls', 1000, 1001);

// With context
throw AuthorizationError.insufficientPermissions('files', 'upload', {
  userPermissions: ['read'],
  requiredPermissions: ['read', 'write'],
  organizationId: 'org-123',
});
```

**When to use:**

- Role-based access control violations
- Resource ownership checks
- API scope limitations
- Permission-based denials
- Quota exceeded scenarios

### 3. ValidationError (400)

Use for input validation failures (automatically created for Zod errors).

```typescript
import { ValidationError } from '@/classes/ValidationError.class';

// Manual validation errors
throw new ValidationError('Upload validation failed', [
  { field: 'images', code: 'REQUIRED', message: 'Images are required' },
  {
    field: 'title',
    code: 'TOO_LONG',
    message: 'Title must be under 100 characters',
    value: 'very long title...',
  },
]);

// Single field validation
throw new ValidationError('Invalid email format', [
  {
    field: 'email',
    code: 'INVALID_FORMAT',
    message: 'Must be a valid email address',
    value: 'bad-email',
  },
]);
```

**When to use:**

- Manual input validation (Zod errors are handled automatically)
- Custom business validation rules
- File upload validation
- Complex validation scenarios

### 4. NotFoundError (404)

Use when a requested resource doesn't exist.

```typescript
import { NotFoundError } from '@/classes/NotFoundError.class';

// Basic usage
throw new NotFoundError('User not found');

// With context
throw new NotFoundError('User not found', {
  userId: 'user-123',
  searchCriteria: { email: 'user@example.com' },
});
```

**When to use:**

- Resource lookup failures
- Route not found scenarios
- Missing file/document requests

### 5. BusinessLogicError (400)

Use for business rule violations.

```typescript
import { BusinessLogicError } from '@/classes/BusinessLogicError.class';

// Basic usage
throw new BusinessLogicError('UPLOAD_SIZE_EXCEEDED', 'File size exceeds limit');

// With context
throw new BusinessLogicError(
  'INSUFFICIENT_BALANCE',
  'Insufficient account balance',
  {
    currentBalance: 50.0,
    requiredAmount: 100.0,
    currency: 'USD',
  },
);

// Common business logic scenarios
throw new BusinessLogicError(
  'ORDER_ALREADY_SHIPPED',
  'Cannot cancel shipped order',
);
throw new BusinessLogicError(
  'SUBSCRIPTION_EXPIRED',
  'Subscription required for this feature',
);
throw new BusinessLogicError(
  'DUPLICATE_SUBMISSION',
  'Request already processed',
);
```

**When to use:**

- Business rule violations
- Workflow state conflicts
- Domain-specific validation failures
- Custom application logic errors

### 6. ExternalServiceError (502)

Use for third-party service integration failures.

```typescript
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';

// Service availability
throw ExternalServiceError.serviceUnavailable('Stripe API');
throw ExternalServiceError.timeout('AWS S3', 30000);
throw ExternalServiceError.rateLimited('Twitter API', 900);

// Authentication and configuration
throw ExternalServiceError.authenticationFailed('Google OAuth');
throw ExternalServiceError.configurationError('SendGrid', 'API_KEY');

// Data and communication issues
throw ExternalServiceError.invalidResponse('Payment Gateway', 'JSON');
throw ExternalServiceError.networkError('Database Replica', 'ECONNREFUSED');

// Complex scenarios with context
throw ExternalServiceError.quotaExceeded('OpenAI API', 'tokens', {
  dailyLimit: 1000000,
  currentUsage: 1000001,
  resetTime: '2024-01-02T00:00:00Z',
});
```

**When to use:**

- API integration failures
- Third-party service timeouts
- External authentication failures
- Webhook delivery failures
- Service quota exceeded

### 7. DatabaseError (500)

Use for database operation failures.

```typescript
import { DatabaseError } from '@/classes/DatabaseError.class';

// Connection issues
throw DatabaseError.connectionFailed('user_db');
throw DatabaseError.connectionTimeout('analytics_db', 30000);
throw DatabaseError.poolExhausted(20, 20);

// Query problems
throw DatabaseError.queryTimeout('SELECT * FROM large_table...', 60000);
throw DatabaseError.syntaxError('SELCT * FROM users', 1);

// Data integrity violations
throw DatabaseError.uniqueViolation('email', 'user@example.com', 'users');
throw DatabaseError.foreignKeyViolation('user_id', 'users');
throw DatabaseError.notNullViolation('name', 'users');

// Transaction and concurrency
throw DatabaseError.transactionFailed('Serialization failure');
throw DatabaseError.deadlockDetected('orders');

// With rich context
throw DatabaseError.uniqueViolation('email', 'duplicate@example.com', 'users', {
  attemptedOperation: 'INSERT',
  existingRecordId: 'user-456',
  userId: 'current-user-789',
});
```

**When to use:**

- Database connection failures
- SQL constraint violations
- Transaction failures
- Migration errors
- Backup/restore failures

### 8. SystemError (500)

Use for infrastructure and system-level failures.

```typescript
import { SystemError } from '@/classes/SystemError.class';

// Memory and performance
throw SystemError.outOfMemory('worker-1', '8GB');
throw SystemError.cpuExhaustion(95, 80);
throw SystemError.memoryLeak('image-processor', '50MB/hour');

// File system issues
throw SystemError.fileSystemError(
  'write',
  '/var/logs/app.log',
  'Permission denied',
);
throw SystemError.permissionDenied('/etc/config', 'read');
throw SystemError.diskSpaceFull('/var', '100MB', '2GB');

// Configuration problems
throw SystemError.environmentVariableMissing('DATABASE_URL');
throw SystemError.configurationError('/etc/app.conf', 'Invalid JSON format');
throw SystemError.dependencyMissing('imagemagick', '7.0.0');

// Process management
throw SystemError.processKilled('worker-process', 'SIGKILL', 9);
throw SystemError.cronJobFailed('backup-job', '0 2 * * *', 'Script not found');
```

**When to use:**

- Infrastructure failures
- System resource exhaustion
- Configuration errors
- Process management issues
- Critical system failures

## Usage Examples

### In Route Handlers

```typescript
// apps/backend/src/routes/v1/users/userCreate.route.ts
import { AuthorizationError } from '@/classes/AuthorizationError.class';
import { BusinessLogicError } from '@/classes/BusinessLogicError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';

const handleUserCreate = async (c: Context<AppContext>) => {
  const userData = c.req.valid('json');

  // Check permissions
  if (!userData.hasPermission('create:users')) {
    throw AuthorizationError.insufficientPermissions('users', 'create');
  }

  // Business logic validation
  if (userData.age < 18) {
    throw new BusinessLogicError(
      'AGE_RESTRICTION',
      'Users must be 18 or older',
      {
        providedAge: userData.age,
        minimumAge: 18,
      },
    );
  }

  try {
    // External service call
    const emailValidation = await validateEmailService(userData.email);
    if (!emailValidation.valid) {
      throw ExternalServiceError.invalidResponse(
        'Email Validation Service',
        'boolean',
      );
    }

    // Create user...
    return c.json({ success: true, user: newUser });
  } catch (error) {
    if (error instanceof ServiceTimeout) {
      throw ExternalServiceError.timeout('Email Validation Service', 5000);
    }
    throw error; // Re-throw other errors
  }
};
```

### In Service Layer

```typescript
// packages/database/src/services/user.service.ts
import { DatabaseError } from '@/classes/DatabaseError.class';
import { NotFoundError } from '@/classes/NotFoundError.class';

export class UserService extends BaseService<UserInsert, UserSelect> {
  async getUserById(id: string): Promise<UserSelect> {
    try {
      const user = await this.getById(id);
      if (!user) {
        throw new NotFoundError('User not found', { userId: id });
      }
      return user;
    } catch (error) {
      if (error instanceof DrizzleError) {
        throw DatabaseError.connectionFailed('users_db', {
          operation: 'getUserById',
          userId: id,
          originalError: error.message,
        });
      }
      throw error;
    }
  }

  async createUser(userData: UserInsert): Promise<UserSelect> {
    try {
      return await this.create(userData);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw DatabaseError.uniqueViolation('email', userData.email, 'users', {
          operation: 'createUser',
          attemptedData: { email: userData.email, username: userData.username },
        });
      }
      throw DatabaseError.constraintViolation('unknown', 'users', {
        originalError: error.message,
        userData,
      });
    }
  }
}
```

### Error Chaining

```typescript
// Wrapping and re-throwing errors with additional context
try {
  await externalApiCall();
} catch (originalError) {
  throw new ExternalServiceError('API call failed', {
    code: 'PAYMENT_GATEWAY_ERROR',
    cause: originalError,
    context: {
      apiEndpoint: '/payments/process',
      paymentId: 'pay_123',
      retryAttempt: 2,
    },
  });
}
```

## Best Practices

### 1. Choose the Right Error Type

```typescript
// ❌ Wrong - Using generic error for specific scenarios
throw new Error('User cannot access this resource');

// ✅ Correct - Using specific error type
throw AuthorizationError.accessDenied('user-profile', {
  userId: 'user-123',
  resourceId: 'profile-456',
});
```

### 2. Provide Rich Context

```typescript
// ❌ Wrong - Minimal context
throw new DatabaseError('Query failed');

// ✅ Correct - Rich context for debugging
throw DatabaseError.queryTimeout('SELECT * FROM orders WHERE...', 30000, {
  tableName: 'orders',
  filters: { status: 'pending', userId: 'user-123' },
  resultCount: 50000,
  queryPlan: 'sequential_scan',
});
```

### 3. Use Factory Methods

```typescript
// ❌ Wrong - Manual error construction
throw new AuthenticationError('Token has expired', {
  code: 'TOKEN_EXPIRED',
  context: { tokenType: 'JWT' },
});

// ✅ Correct - Using factory method
throw AuthenticationError.tokenExpired({ tokenType: 'JWT' });
```

### 4. Handle Async Operations

```typescript
// ✅ Proper async error handling
const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadToS3(file);
    return result;
  } catch (error) {
    if (error.code === 'NetworkTimeout') {
      throw ExternalServiceError.timeout('AWS S3', 30000, {
        fileName: file.name,
        fileSize: file.size,
      });
    }
    throw ExternalServiceError.serviceUnavailable('AWS S3', {
      originalError: error.message,
    });
  }
};
```

### 5. Validate Early

```typescript
// ✅ Validate inputs early in handlers
const handleUserUpdate = async (c: Context<AppContext>) => {
  const userId = c.req.param('id');
  const updateData = c.req.valid('json');

  // Early validation
  if (!userId) {
    throw new ValidationError('User ID required', [
      { field: 'id', code: 'REQUIRED', message: 'User ID is required' },
    ]);
  }

  // Continue with business logic...
};
```

## Response Format

All errors return a consistent JSON structure:

```typescript
{
  "code": "VALIDATION_ERROR",
  "status": 400,
  "category": "VALIDATION",
  "message": "Request validation failed",
  "details": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Must be a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1703123456789_abc123def"
}
```

### Environment-Specific Responses

**Development Mode:**

```typescript
{
  "code": "DATABASE_ERROR",
  "status": 500,
  "category": "DATABASE",
  "message": "Connection failed",
  "details": [],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1703123456789_abc123def",
  "context": {
    "databaseName": "users_db",
    "connectionAttempts": 3
  },
  "stack": [
    "Error: Connection failed",
    "    at DatabaseService.connect (/app/services/db.js:45:12)",
    "    at async Handler (/app/routes/users.js:23:8)"
  ]
}
```

**Production Mode:**

```typescript
{
  "code": "DATABASE_ERROR",
  "status": 500,
  "category": "DATABASE",
  "message": "Connection failed",
  "details": [],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1703123456789_abc123def"
  // context and stack removed for security
}
```

## Migration Guide

### From Old ApiError/ServiceError

```typescript
// ❌ Old way
import { ApiError } from '@/classes/ApiError.class';
throw new ApiError(400, 'Invalid input');

// ✅ New way
import { ValidationError } from '@/classes/ValidationError.class';
throw new ValidationError('Invalid input', [
  { field: 'input', code: 'INVALID', message: 'Input validation failed' },
]);
```

### From Generic Errors

```typescript
// ❌ Old way
throw new Error('Database connection failed');

// ✅ New way
import { DatabaseError } from '@/classes/DatabaseError.class';
throw DatabaseError.connectionFailed('main_db');
```

### Update Route Handlers

```typescript
// ❌ Old pattern
const handler = async (c) => {
  try {
    // logic
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
};

// ✅ New pattern - Let error handler manage responses
const handler = async (c) => {
  // logic - errors are automatically handled by the global error handler
  if (someCondition) {
    throw AuthorizationError.accessDenied('resource');
  }
};
```

## Monitoring & Debugging

### Log Structure

All errors generate structured logs:

```json
{
  "requestId": "req_1703123456789_abc123def",
  "errorCode": "EXTERNAL_SERVICE_ERROR",
  "category": "EXTERNAL_SERVICE",
  "status": 502,
  "message": "Payment gateway timeout",
  "details": [],
  "context": {
    "serviceName": "Stripe",
    "timeoutMs": 30000
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "request": {
    "method": "POST",
    "path": "/api/v1/payments",
    "userAgent": "Mozilla/5.0...",
    "ip": "203.0.113.1"
  }
}
```

### Request Tracing

Use the `requestId` to trace errors across your application:

```bash
# Find all logs for a specific request
grep "req_1703123456789_abc123def" /var/log/app.log

# Filter by error category
grep '"category":"DATABASE"' /var/log/app.log
```

### Error Metrics

Monitor error patterns:

```typescript
// Example monitoring integration
const logError = (error: BaseError, requestId: string, c: Context) => {
  // Structured logging
  console.error(JSON.stringify(logData));

  // Metrics collection
  metrics.increment('errors.total', {
    category: error.category,
    code: error.code,
    status: error.status.toString(),
  });

  // Alert on critical errors
  if (error.status >= 500) {
    alerting.sendAlert('Critical Error', error.toJSON());
  }
};
```

## Error Codes Reference

### Authentication Errors (401)

- `AUTHENTICATION_ERROR` - Generic authentication failure
- `INVALID_CREDENTIALS` - Wrong username/password
- `TOKEN_EXPIRED` - Expired authentication token
- `TOKEN_INVALID` - Invalid token format
- `MISSING_CREDENTIALS` - No credentials provided
- `ACCOUNT_LOCKED` - Account suspended/locked
- `TOO_MANY_ATTEMPTS` - Rate limiting

### Authorization Errors (403)

- `AUTHORIZATION_ERROR` - Generic authorization failure
- `INSUFFICIENT_PERMISSIONS` - Lacking required permissions
- `ACCESS_DENIED` - Resource access denied
- `ROLE_REQUIRED` - Specific role needed
- `SCOPE_INSUFFICIENT` - OAuth scope limitations
- `RESOURCE_OWNERSHIP_REQUIRED` - Owner-only access
- `ACTION_NOT_PERMITTED` - Specific action blocked
- `ADMIN_REQUIRED` - Admin privileges needed
- `QUOTA_EXCEEDED` - Usage limits exceeded

### Validation Errors (400)

- `VALIDATION_ERROR` - Input validation failure

### Business Logic Errors (400)

- `BUSINESS_LOGIC_ERROR` - Generic business rule violation
- Custom codes based on your domain (e.g., `INSUFFICIENT_BALANCE`, `ORDER_ALREADY_SHIPPED`)

### External Service Errors (502)

- `EXTERNAL_SERVICE_ERROR` - Generic external service failure
- `SERVICE_UNAVAILABLE` - Service down/unreachable
- `SERVICE_TIMEOUT` - Request timeouts
- `SERVICE_RATE_LIMITED` - External rate limits
- `INVALID_RESPONSE_FORMAT` - Malformed responses
- `SERVICE_AUTH_FAILED` - Authentication issues
- `NETWORK_ERROR` - Connectivity issues

### Database Errors (500)

- `DATABASE_ERROR` - Generic database failure
- `CONNECTION_FAILED` - Connection issues
- `QUERY_TIMEOUT` - Query timeouts
- `CONSTRAINT_VIOLATION` - Data integrity violations
- `UNIQUE_VIOLATION` - Unique key conflicts
- `FOREIGN_KEY_VIOLATION` - Referential integrity
- `TRANSACTION_FAILED` - Transaction issues
- `MIGRATION_FAILED` - Schema migration problems

### System Errors (500)

- `SYSTEM_ERROR` - Generic system failure
- `OUT_OF_MEMORY` - Memory exhaustion
- `CPU_EXHAUSTION` - CPU overload
- `DISK_SPACE_FULL` - Storage exhaustion
- `FILE_SYSTEM_ERROR` - File system operations
- `ENV_VAR_MISSING` - Missing environment variables
- `CONFIGURATION_ERROR` - Config problems
- `UNEXPECTED_ERROR` - Unhandled exceptions

---

_This error handling system provides a robust foundation for building reliable, maintainable applications with excellent observability and debugging capabilities._
