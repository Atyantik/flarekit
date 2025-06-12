import { describe, it, expect } from 'vitest';
import { AuthenticationError } from '@/classes/AuthenticationError.class';
import { AuthorizationError } from '@/classes/AuthorizationError.class';
import { BusinessLogicError } from '@/classes/BusinessLogicError.class';
import { DatabaseError } from '@/classes/DatabaseError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';
import { NotFoundError } from '@/classes/NotFoundError.class';
import { SystemError } from '@/classes/SystemError.class';

const expectBase = (err: any, code: string, status: number) => {
  expect(err.code).toBe(code);
  expect(err.status).toBe(status);
  expect(typeof err.timestamp).toBe('string');
  expect(err.toJSON().code).toBe(code); // cover toJSON
};

describe('Custom error classes', () => {
  it('AuthenticationError factories', () => {
    const factories = [
      AuthenticationError.invalidCredentials,
      AuthenticationError.tokenExpired,
      AuthenticationError.tokenInvalid,
      AuthenticationError.missingCredentials,
      AuthenticationError.accountLocked,
      AuthenticationError.tooManyAttempts,
    ];
    factories.forEach((factory) => {
      const err = factory();
      expect(err.category).toBe('AUTHENTICATION');
      expectBase(err, err.code, 401);
    });
    factories.forEach((factory) => factory(undefined));
  });

  it('AuthorizationError factories', () => {
    const factories = [
      () => AuthorizationError.insufficientPermissions('res', 'act'),
      () => AuthorizationError.accessDenied('res'),
      () => AuthorizationError.roleRequired('ADMIN'),
      () => AuthorizationError.scopeInsufficient(['read']),
      () => AuthorizationError.resourceOwnershipRequired('id', 'user'),
      () => AuthorizationError.actionNotPermitted('do', 'res'),
      () => AuthorizationError.adminRequired(),
      () => AuthorizationError.accountSuspended('bad'),
      () => AuthorizationError.quotaExceeded('api'),
      () => AuthorizationError.temporarilyRestricted('reason'),
    ];
    factories.forEach((factory) => {
      const err = factory();
      expect(err.category).toBe('AUTHORIZATION');
      expectBase(err, err.code, 403);
    });
    // call without arguments
    AuthorizationError.insufficientPermissions();
    AuthorizationError.accessDenied();
    AuthorizationError.roleRequired('ADMIN');
    AuthorizationError.scopeInsufficient(['a']);
    AuthorizationError.resourceOwnershipRequired();
    AuthorizationError.actionNotPermitted('act');
    AuthorizationError.adminRequired();
    AuthorizationError.accountSuspended();
    AuthorizationError.quotaExceeded();
    AuthorizationError.temporarilyRestricted();
  });

  it('BusinessLogicError simple usage', () => {
    const err = new BusinessLogicError('BUSINESS', 'msg');
    expectBase(err, 'BUSINESS', 400);
  });

  it('DatabaseError factories', () => {
    const factories = [
      () => DatabaseError.connectionFailed('db'),
      () => DatabaseError.connectionTimeout('db', 1),
      () => DatabaseError.queryTimeout('q', 1),
      () => DatabaseError.syntaxError('q', 1),
      () => DatabaseError.constraintViolation('c', 't'),
      () => DatabaseError.uniqueViolation('f', 'v', 't'),
      () => DatabaseError.foreignKeyViolation('fk', 't'),
      () => DatabaseError.notNullViolation('f', 't'),
      () => DatabaseError.transactionFailed('bad'),
      () => DatabaseError.deadlockDetected('t'),
      () => DatabaseError.migrationFailed('m', 'r'),
      () => DatabaseError.schemaError('s', 'r'),
      () => DatabaseError.accessDenied('op', 'res'),
      () => DatabaseError.dataIntegrityError('desc', 't'),
      () => DatabaseError.poolExhausted(1, 1),
      () => DatabaseError.backupFailed('b', 'r'),
      () => DatabaseError.restoreFailed('b', 'r'),
      () => DatabaseError.replicationLag(1, 1),
      () => DatabaseError.diskSpaceExhausted('a', 'r'),
      () => DatabaseError.recordNotFound('t', 'id'),
    ];
    factories.forEach((factory) => {
      const err = factory();
      expect(err.category).toBe('DATABASE');
      expectBase(err, err.code, 500);
    });
    DatabaseError.connectionFailed();
    DatabaseError.connectionTimeout();
    DatabaseError.queryTimeout();
    DatabaseError.syntaxError();
    DatabaseError.constraintViolation('c');
    DatabaseError.uniqueViolation('f');
    DatabaseError.foreignKeyViolation('fk');
    DatabaseError.notNullViolation('f');
    DatabaseError.transactionFailed();
    DatabaseError.deadlockDetected();
    DatabaseError.migrationFailed('m');
    DatabaseError.schemaError('s');
    DatabaseError.accessDenied('op');
    DatabaseError.dataIntegrityError('desc');
    DatabaseError.poolExhausted();
    DatabaseError.backupFailed();
    DatabaseError.restoreFailed();
    DatabaseError.replicationLag(1);
    DatabaseError.diskSpaceExhausted();
    DatabaseError.recordNotFound('t', 'id');
  });

  it('ExternalServiceError factories', () => {
    const factories = [
      () => ExternalServiceError.serviceUnavailable('svc'),
      () => ExternalServiceError.timeout('svc', 1),
      () => ExternalServiceError.rateLimited('svc', 1),
      () => ExternalServiceError.invalidResponse('svc', 'json'),
      () => ExternalServiceError.authenticationFailed('svc'),
      () => ExternalServiceError.configurationError('svc', 'cfg'),
      () => ExternalServiceError.networkError('svc', '500'),
      () => ExternalServiceError.quotaExceeded('svc', 'quota'),
      () => ExternalServiceError.versionMismatch('svc', '1', '2'),
      () => ExternalServiceError.malformedRequest('svc', 'bad'),
      () => ExternalServiceError.partialFailure('svc', 1, 1),
      () => ExternalServiceError.circuitBreakerOpen('svc'),
      () => ExternalServiceError.maintenanceMode('svc', '1h'),
      () => ExternalServiceError.webhookDeliveryFailed('svc', 'url', 1),
    ];
    factories.forEach((factory) => {
      const err = factory();
      expect(err.category).toBe('EXTERNAL_SERVICE');
      expectBase(err, err.code, 502);
    });
    ExternalServiceError.serviceUnavailable('svc');
    ExternalServiceError.timeout('svc');
    ExternalServiceError.rateLimited('svc');
    ExternalServiceError.invalidResponse('svc');
    ExternalServiceError.authenticationFailed('svc');
    ExternalServiceError.configurationError('svc');
    ExternalServiceError.networkError('svc');
    ExternalServiceError.quotaExceeded('svc');
    ExternalServiceError.versionMismatch('svc');
    ExternalServiceError.malformedRequest('svc');
    ExternalServiceError.partialFailure('svc', 1, 1);
    ExternalServiceError.circuitBreakerOpen('svc');
    ExternalServiceError.maintenanceMode('svc');
    ExternalServiceError.webhookDeliveryFailed('svc');
  });

  it('NotFoundError and SystemError factories', () => {
    const nf = new NotFoundError('User', '1');
    expectBase(nf, 'RESOURCE_NOT_FOUND', 404);

    const sysFactories = [
      () => SystemError.outOfMemory('p', '1mb'),
      () => SystemError.cpuExhaustion(1, 1),
      () => SystemError.fileSystemError('read', '/path', 'fail'),
      () => SystemError.permissionDenied('res', 'op'),
      () => SystemError.diskSpaceFull('/', '1', '2'),
      () => SystemError.environmentVariableMissing('VAR'),
      () => SystemError.configurationError('path', 'bad'),
      () => SystemError.processKilled('proc', 'SIG', 1),
      () => SystemError.networkInterfaceError('eth', 'down'),
      () => SystemError.securityViolation('violation'),
      () => SystemError.resourceExhaustion('res', 1, 1),
      () => SystemError.osError('op', '1'),
      () => SystemError.runtimeError('node', '1', 'bad'),
      () => SystemError.dependencyMissing('dep', '1'),
      () => SystemError.temporaryDirectoryFull('/tmp'),
      () => SystemError.cronJobFailed('job', '* * *', 'bad'),
      () => SystemError.signalReceived('SIGINT', 'stop'),
      () => SystemError.watchdogTimeout('svc', 1),
      () => SystemError.containerError('ctr', 'bad'),
      () => SystemError.kernelPanic('bad'),
      () => SystemError.memoryLeak('comp', '1mb'),
    ];
    sysFactories.forEach((f) => {
      const err = f();
      expectBase(err, err.code, 500);
    });
    SystemError.outOfMemory();
    SystemError.cpuExhaustion();
    SystemError.fileSystemError('read');
    SystemError.permissionDenied('r');
    SystemError.diskSpaceFull();
    SystemError.environmentVariableMissing('VAR');
    SystemError.configurationError('path');
    SystemError.processKilled('proc');
    SystemError.networkInterfaceError('eth');
    SystemError.securityViolation('v');
    SystemError.resourceExhaustion('res');
    SystemError.osError('op');
    SystemError.runtimeError('node');
    SystemError.dependencyMissing('dep');
    SystemError.temporaryDirectoryFull();
    SystemError.cronJobFailed('job');
    SystemError.signalReceived('SIG');
    SystemError.watchdogTimeout('svc');
    SystemError.containerError('ctr');
    SystemError.kernelPanic();
    SystemError.memoryLeak('comp');
  });

  it('Constructor behavior for all error classes', () => {
    const originalError = new Error('Original error');

    // Test AuthenticationError constructor
    const authErr = new AuthenticationError('Custom auth error', {
      code: 'CUSTOM_AUTH_ERROR',
      details: [{ message: 'Invalid token format', code: 'INVALID_TOKEN' }],
      context: { userId: '123' },
      requestId: 'req-123',
      cause: originalError,
    });
    expect(authErr.message).toBe('Custom auth error');
    expect(authErr.code).toBe('CUSTOM_AUTH_ERROR');
    expect(authErr.status).toBe(401);
    expect(authErr.category).toBe('AUTHENTICATION');
    expect(authErr.details).toEqual([
      { message: 'Invalid token format', code: 'INVALID_TOKEN' },
    ]);
    expect(authErr.context).toEqual({ userId: '123' });
    expect(authErr.requestId).toBe('req-123');
    expect(authErr.cause).toBe(originalError);

    // Test AuthorizationError constructor
    const authzErr = new AuthorizationError('Custom authz error', {
      code: 'CUSTOM_AUTHZ_ERROR',
      details: [{ message: 'Missing role', code: 'MISSING_ROLE' }],
      context: { role: 'admin' },
      requestId: 'req-456',
      cause: originalError,
    });
    expect(authzErr.message).toBe('Custom authz error');
    expect(authzErr.code).toBe('CUSTOM_AUTHZ_ERROR');
    expect(authzErr.status).toBe(403);
    expect(authzErr.category).toBe('AUTHORIZATION');
    expect(authzErr.details).toEqual([
      { message: 'Missing role', code: 'MISSING_ROLE' },
    ]);
    expect(authzErr.context).toEqual({ role: 'admin' });
    expect(authzErr.requestId).toBe('req-456');
    expect(authzErr.cause).toBe(originalError);

    // Test BusinessLogicError constructor
    const businessErr = new BusinessLogicError(
      'CUSTOM_BUSINESS_ERROR',
      'Custom business error',
      { state: 'pending' },
    );
    expect(businessErr.message).toBe('Custom business error');
    expect(businessErr.code).toBe('CUSTOM_BUSINESS_ERROR');
    expect(businessErr.status).toBe(400);
    expect(businessErr.category).toBe('BUSINESS_LOGIC');
    expect(businessErr.context).toEqual({ state: 'pending' });

    // Test DatabaseError constructor
    const dbErr = new DatabaseError('Custom db error', {
      code: 'CUSTOM_DB_ERROR',
      details: [{ message: 'Connection failed', code: 'CONNECTION_FAILED' }],
      context: { db: 'main' },
      requestId: 'req-101',
      cause: originalError,
    });
    expect(dbErr.message).toBe('Custom db error');
    expect(dbErr.code).toBe('CUSTOM_DB_ERROR');
    expect(dbErr.status).toBe(500);
    expect(dbErr.category).toBe('DATABASE');
    expect(dbErr.details).toEqual([
      { message: 'Connection failed', code: 'CONNECTION_FAILED' },
    ]);
    expect(dbErr.context).toEqual({ db: 'main' });
    expect(dbErr.requestId).toBe('req-101');
    expect(dbErr.cause).toBe(originalError);

    // Test ExternalServiceError constructor
    const extErr = new ExternalServiceError('Custom external error', {
      code: 'CUSTOM_EXT_ERROR',
      details: [{ message: 'API timeout', code: 'API_TIMEOUT' }],
      context: { service: 'payment' },
      requestId: 'req-102',
      cause: originalError,
    });
    expect(extErr.message).toBe('Custom external error');
    expect(extErr.code).toBe('CUSTOM_EXT_ERROR');
    expect(extErr.status).toBe(502);
    expect(extErr.category).toBe('EXTERNAL_SERVICE');
    expect(extErr.details).toEqual([
      { message: 'API timeout', code: 'API_TIMEOUT' },
    ]);
    expect(extErr.context).toEqual({ service: 'payment' });
    expect(extErr.requestId).toBe('req-102');
    expect(extErr.cause).toBe(originalError);

    // Test NotFoundError constructor
    const notFoundErr = new NotFoundError('User', '123');
    expect(notFoundErr.message).toBe('User not found');
    expect(notFoundErr.code).toBe('RESOURCE_NOT_FOUND');
    expect(notFoundErr.status).toBe(404);
    expect(notFoundErr.category).toBe('NOT_FOUND');
    expect(notFoundErr.context).toEqual({
      resource: 'User',
      identifier: '123',
    });

    // Test SystemError constructor
    const sysErr = new SystemError('Custom system error', {
      code: 'CUSTOM_SYS_ERROR',
      details: [{ message: 'Memory limit exceeded', code: 'MEMORY_LIMIT' }],
      context: { memory: '1GB' },
      requestId: 'req-104',
      cause: originalError,
    });
    expect(sysErr.message).toBe('Custom system error');
    expect(sysErr.code).toBe('CUSTOM_SYS_ERROR');
    expect(sysErr.status).toBe(500);
    expect(sysErr.category).toBe('SYSTEM');
    expect(sysErr.details).toEqual([
      { message: 'Memory limit exceeded', code: 'MEMORY_LIMIT' },
    ]);
    expect(sysErr.context).toEqual({ memory: '1GB' });
    expect(sysErr.requestId).toBe('req-104');
    expect(sysErr.cause).toBe(originalError);
  });
});
