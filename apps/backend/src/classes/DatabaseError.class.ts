import { BaseError, ErrorCategory } from './BaseError.class';

export class DatabaseError extends BaseError {
  readonly code = 'DATABASE_ERROR';
  readonly status = 500;
  readonly category = ErrorCategory.DATABASE;

  constructor(
    message: string = 'Database error',
    options: {
      code?: string;
      details?: Array<{
        field?: string;
        code?: string;
        message: string;
        value?: any;
      }>;
      context?: Record<string, any>;
      requestId?: string;
      cause?: Error;
    } = {},
  ) {
    super(message, {
      details: options.details,
      context: options.context,
      requestId: options.requestId,
      cause: options.cause,
    });

    // Allow custom error codes for specific database errors
    if (options.code) {
      (this as any).code = options.code;
    }
  }

  // Factory methods for common database errors
  static connectionFailed(
    databaseName?: string,
    context?: Record<string, any>,
  ) {
    const message = databaseName
      ? `Failed to connect to database: ${databaseName}`
      : 'Failed to connect to database';

    return new DatabaseError(message, {
      code: 'CONNECTION_FAILED',
      context: { databaseName, ...context },
    });
  }

  static connectionTimeout(
    databaseName?: string,
    timeoutMs?: number,
    context?: Record<string, any>,
  ) {
    const message = timeoutMs
      ? `Database connection timed out after ${timeoutMs}ms`
      : 'Database connection timed out';

    return new DatabaseError(message, {
      code: 'CONNECTION_TIMEOUT',
      context: { databaseName, timeoutMs, ...context },
    });
  }

  static queryTimeout(
    query?: string,
    timeoutMs?: number,
    context?: Record<string, any>,
  ) {
    const message = timeoutMs
      ? `Query timed out after ${timeoutMs}ms`
      : 'Query timed out';

    return new DatabaseError(message, {
      code: 'QUERY_TIMEOUT',
      context: { query: query?.substring(0, 200), timeoutMs, ...context },
    });
  }

  static syntaxError(
    query?: string,
    position?: number,
    context?: Record<string, any>,
  ) {
    const message = position
      ? `SQL syntax error at position ${position}`
      : 'SQL syntax error';

    return new DatabaseError(message, {
      code: 'SYNTAX_ERROR',
      context: { query: query?.substring(0, 200), position, ...context },
    });
  }

  static constraintViolation(
    constraintName: string,
    tableName?: string,
    context?: Record<string, any>,
  ) {
    const message = tableName
      ? `Constraint violation: ${constraintName} on table ${tableName}`
      : `Constraint violation: ${constraintName}`;

    return new DatabaseError(message, {
      code: 'CONSTRAINT_VIOLATION',
      context: { constraintName, tableName, ...context },
    });
  }

  static uniqueViolation(
    field: string,
    value?: any,
    tableName?: string,
    context?: Record<string, any>,
  ) {
    const message = tableName
      ? `Unique constraint violation: ${field} already exists in ${tableName}`
      : `Unique constraint violation: ${field} already exists`;

    return new DatabaseError(message, {
      code: 'UNIQUE_VIOLATION',
      context: { field, value, tableName, ...context },
    });
  }

  static foreignKeyViolation(
    foreignKey: string,
    referencedTable?: string,
    context?: Record<string, any>,
  ) {
    const message = referencedTable
      ? `Foreign key violation: ${foreignKey} references non-existent record in ${referencedTable}`
      : `Foreign key violation: ${foreignKey}`;

    return new DatabaseError(message, {
      code: 'FOREIGN_KEY_VIOLATION',
      context: { foreignKey, referencedTable, ...context },
    });
  }

  static notNullViolation(
    field: string,
    tableName?: string,
    context?: Record<string, any>,
  ) {
    const message = tableName
      ? `Not null constraint violation: ${field} in table ${tableName}`
      : `Not null constraint violation: ${field}`;

    return new DatabaseError(message, {
      code: 'NOT_NULL_VIOLATION',
      context: { field, tableName, ...context },
    });
  }

  static transactionFailed(reason?: string, context?: Record<string, any>) {
    const message = reason
      ? `Transaction failed: ${reason}`
      : 'Transaction failed';

    return new DatabaseError(message, {
      code: 'TRANSACTION_FAILED',
      context: { reason, ...context },
    });
  }

  static deadlockDetected(tableName?: string, context?: Record<string, any>) {
    const message = tableName
      ? `Deadlock detected on table: ${tableName}`
      : 'Deadlock detected';

    return new DatabaseError(message, {
      code: 'DEADLOCK_DETECTED',
      context: { tableName, ...context },
    });
  }

  static migrationFailed(
    migrationName: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message = reason
      ? `Migration failed: ${migrationName} - ${reason}`
      : `Migration failed: ${migrationName}`;

    return new DatabaseError(message, {
      code: 'MIGRATION_FAILED',
      context: { migrationName, reason, ...context },
    });
  }

  static schemaError(
    schemaName?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      schemaName && reason
        ? `Schema error in ${schemaName}: ${reason}`
        : schemaName
          ? `Schema error in ${schemaName}`
          : `Schema error: ${reason || 'Unknown schema issue'}`;

    return new DatabaseError(message, {
      code: 'SCHEMA_ERROR',
      context: { schemaName, reason, ...context },
    });
  }

  static accessDenied(
    operation: string,
    resource?: string,
    context?: Record<string, any>,
  ) {
    const message = resource
      ? `Access denied: Cannot ${operation} on ${resource}`
      : `Access denied: Cannot ${operation}`;

    return new DatabaseError(message, {
      code: 'ACCESS_DENIED',
      context: { operation, resource, ...context },
    });
  }

  static dataIntegrityError(
    description: string,
    tableName?: string,
    context?: Record<string, any>,
  ) {
    const message = tableName
      ? `Data integrity error in ${tableName}: ${description}`
      : `Data integrity error: ${description}`;

    return new DatabaseError(message, {
      code: 'DATA_INTEGRITY_ERROR',
      context: { description, tableName, ...context },
    });
  }

  static poolExhausted(
    maxConnections?: number,
    currentConnections?: number,
    context?: Record<string, any>,
  ) {
    const message = maxConnections
      ? `Connection pool exhausted: ${currentConnections}/${maxConnections} connections in use`
      : 'Connection pool exhausted';

    return new DatabaseError(message, {
      code: 'POOL_EXHAUSTED',
      context: { maxConnections, currentConnections, ...context },
    });
  }

  static backupFailed(
    backupName?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      backupName && reason
        ? `Backup failed: ${backupName} - ${reason}`
        : backupName
          ? `Backup failed: ${backupName}`
          : `Backup failed: ${reason || 'Unknown error'}`;

    return new DatabaseError(message, {
      code: 'BACKUP_FAILED',
      context: { backupName, reason, ...context },
    });
  }

  static restoreFailed(
    backupName?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      backupName && reason
        ? `Restore failed: ${backupName} - ${reason}`
        : backupName
          ? `Restore failed: ${backupName}`
          : `Restore failed: ${reason || 'Unknown error'}`;

    return new DatabaseError(message, {
      code: 'RESTORE_FAILED',
      context: { backupName, reason, ...context },
    });
  }

  static replicationLag(
    lagMs: number,
    threshold?: number,
    context?: Record<string, any>,
  ) {
    const message = threshold
      ? `Replication lag of ${lagMs}ms exceeds threshold of ${threshold}ms`
      : `Replication lag detected: ${lagMs}ms`;

    return new DatabaseError(message, {
      code: 'REPLICATION_LAG',
      context: { lagMs, threshold, ...context },
    });
  }

  static diskSpaceExhausted(
    availableSpace?: string,
    requiredSpace?: string,
    context?: Record<string, any>,
  ) {
    const message =
      availableSpace && requiredSpace
        ? `Disk space exhausted: ${availableSpace} available, ${requiredSpace} required`
        : 'Disk space exhausted';

    return new DatabaseError(message, {
      code: 'DISK_SPACE_EXHAUSTED',
      context: { availableSpace, requiredSpace, ...context },
    });
  }

  static recordNotFound(
    tableName: string,
    identifier: string | number,
    context?: Record<string, any>,
  ) {
    return new DatabaseError(
      `Record not found in ${tableName} with identifier: ${identifier}`,
      {
        code: 'RECORD_NOT_FOUND',
        context: { tableName, identifier, ...context },
      },
    );
  }
}
