import { BaseError, ErrorCategory } from './BaseError.class';

export class SystemError extends BaseError {
  readonly code = 'SYSTEM_ERROR';
  readonly status = 500;
  readonly category = ErrorCategory.SYSTEM;

  constructor(
    message: string = 'System error',
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

    // Allow custom error codes for specific system errors
    if (options.code) {
      (this as any).code = options.code;
    }
  }

  // Factory methods for common system errors
  static outOfMemory(
    processId?: string,
    memoryUsage?: string,
    context?: Record<string, any>,
  ) {
    const message = memoryUsage
      ? `Out of memory: ${memoryUsage} used`
      : 'Out of memory';

    return new SystemError(message, {
      code: 'OUT_OF_MEMORY',
      context: { processId, memoryUsage, ...context },
    });
  }

  static cpuExhaustion(
    cpuUsage?: number,
    threshold?: number,
    context?: Record<string, any>,
  ) {
    const message =
      cpuUsage && threshold
        ? `CPU exhaustion: ${cpuUsage}% usage exceeds ${threshold}% threshold`
        : 'CPU exhaustion detected';

    return new SystemError(message, {
      code: 'CPU_EXHAUSTION',
      context: { cpuUsage, threshold, ...context },
    });
  }

  static fileSystemError(
    operation: string,
    path?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      path && reason
        ? `File system error: Cannot ${operation} ${path} - ${reason}`
        : path
          ? `File system error: Cannot ${operation} ${path}`
          : `File system error: Cannot ${operation}`;

    return new SystemError(message, {
      code: 'FILE_SYSTEM_ERROR',
      context: { operation, path, reason, ...context },
    });
  }

  static permissionDenied(
    resource: string,
    operation?: string,
    context?: Record<string, any>,
  ) {
    const message = operation
      ? `Permission denied: Cannot ${operation} ${resource}`
      : `Permission denied: Access to ${resource}`;

    return new SystemError(message, {
      code: 'PERMISSION_DENIED',
      context: { resource, operation, ...context },
    });
  }

  static diskSpaceFull(
    path?: string,
    availableSpace?: string,
    requiredSpace?: string,
    context?: Record<string, any>,
  ) {
    const message =
      path && availableSpace && requiredSpace
        ? `Disk space full at ${path}: ${availableSpace} available, ${requiredSpace} required`
        : path
          ? `Disk space full at ${path}`
          : 'Disk space full';

    return new SystemError(message, {
      code: 'DISK_SPACE_FULL',
      context: { path, availableSpace, requiredSpace, ...context },
    });
  }

  static environmentVariableMissing(
    variableName: string,
    context?: Record<string, any>,
  ) {
    return new SystemError(
      `Required environment variable missing: ${variableName}`,
      {
        code: 'ENV_VAR_MISSING',
        context: { variableName, ...context },
      },
    );
  }

  static configurationError(
    configPath?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      configPath && reason
        ? `Configuration error in ${configPath}: ${reason}`
        : configPath
          ? `Configuration error in ${configPath}`
          : `Configuration error: ${reason || 'Invalid configuration'}`;

    return new SystemError(message, {
      code: 'CONFIGURATION_ERROR',
      context: { configPath, reason, ...context },
    });
  }

  static processKilled(
    processName?: string,
    signal?: string,
    exitCode?: number,
    context?: Record<string, any>,
  ) {
    const message =
      processName && signal
        ? `Process ${processName} killed with signal ${signal}`
        : processName
          ? `Process ${processName} terminated unexpectedly`
          : 'Process terminated unexpectedly';

    return new SystemError(message, {
      code: 'PROCESS_KILLED',
      context: { processName, signal, exitCode, ...context },
    });
  }

  static networkInterfaceError(
    interfaceName?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      interfaceName && reason
        ? `Network interface error on ${interfaceName}: ${reason}`
        : interfaceName
          ? `Network interface error on ${interfaceName}`
          : `Network interface error: ${reason || 'Unknown network issue'}`;

    return new SystemError(message, {
      code: 'NETWORK_INTERFACE_ERROR',
      context: { interfaceName, reason, ...context },
    });
  }

  static securityViolation(violation: string, context?: Record<string, any>) {
    return new SystemError(`Security violation detected: ${violation}`, {
      code: 'SECURITY_VIOLATION',
      context: { violation, ...context },
    });
  }

  static resourceExhaustion(
    resourceType: string,
    limit?: number,
    current?: number,
    context?: Record<string, any>,
  ) {
    const message =
      limit && current
        ? `${resourceType} exhausted: ${current}/${limit} in use`
        : `${resourceType} exhausted`;

    return new SystemError(message, {
      code: 'RESOURCE_EXHAUSTION',
      context: { resourceType, limit, current, ...context },
    });
  }

  static osError(
    operation: string,
    errorCode?: string,
    context?: Record<string, any>,
  ) {
    const message = errorCode
      ? `OS error during ${operation}: ${errorCode}`
      : `OS error during ${operation}`;

    return new SystemError(message, {
      code: 'OS_ERROR',
      context: { operation, errorCode, ...context },
    });
  }

  static runtimeError(
    runtime: string,
    version?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      version && reason
        ? `${runtime} ${version} runtime error: ${reason}`
        : runtime && reason
          ? `${runtime} runtime error: ${reason}`
          : `${runtime} runtime error`;

    return new SystemError(message, {
      code: 'RUNTIME_ERROR',
      context: { runtime, version, reason, ...context },
    });
  }

  static dependencyMissing(
    dependency: string,
    version?: string,
    context?: Record<string, any>,
  ) {
    const message = version
      ? `Missing dependency: ${dependency} ${version}`
      : `Missing dependency: ${dependency}`;

    return new SystemError(message, {
      code: 'DEPENDENCY_MISSING',
      context: { dependency, version, ...context },
    });
  }

  static temporaryDirectoryFull(
    tempPath?: string,
    context?: Record<string, any>,
  ) {
    const message = tempPath
      ? `Temporary directory full: ${tempPath}`
      : 'Temporary directory full';

    return new SystemError(message, {
      code: 'TEMP_DIR_FULL',
      context: { tempPath, ...context },
    });
  }

  static cronJobFailed(
    jobName: string,
    schedule?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      schedule && reason
        ? `Cron job ${jobName} (${schedule}) failed: ${reason}`
        : schedule
          ? `Cron job ${jobName} (${schedule}) failed`
          : `Cron job ${jobName} failed: ${reason || 'Unknown error'}`;

    return new SystemError(message, {
      code: 'CRON_JOB_FAILED',
      context: { jobName, schedule, reason, ...context },
    });
  }

  static signalReceived(
    signal: string,
    action?: string,
    context?: Record<string, any>,
  ) {
    const message = action
      ? `Received signal ${signal}: ${action}`
      : `Received signal ${signal}`;

    return new SystemError(message, {
      code: 'SIGNAL_RECEIVED',
      context: { signal, action, ...context },
    });
  }

  static watchdogTimeout(
    service?: string,
    timeoutMs?: number,
    context?: Record<string, any>,
  ) {
    const message =
      service && timeoutMs
        ? `Watchdog timeout for ${service} after ${timeoutMs}ms`
        : service
          ? `Watchdog timeout for ${service}`
          : `Watchdog timeout: ${timeoutMs || 'unknown'}ms`;

    return new SystemError(message, {
      code: 'WATCHDOG_TIMEOUT',
      context: { service, timeoutMs, ...context },
    });
  }

  static containerError(
    containerName?: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    const message =
      containerName && reason
        ? `Container error in ${containerName}: ${reason}`
        : containerName
          ? `Container error in ${containerName}`
          : `Container error: ${reason || 'Unknown container issue'}`;

    return new SystemError(message, {
      code: 'CONTAINER_ERROR',
      context: { containerName, reason, ...context },
    });
  }

  static kernelPanic(reason?: string, context?: Record<string, any>) {
    const message = reason
      ? `Kernel panic: ${reason}`
      : 'Kernel panic detected';

    return new SystemError(message, {
      code: 'KERNEL_PANIC',
      context: { reason, ...context },
    });
  }

  static memoryLeak(
    component?: string,
    memoryGrowth?: string,
    context?: Record<string, any>,
  ) {
    const message =
      component && memoryGrowth
        ? `Memory leak detected in ${component}: ${memoryGrowth} growth`
        : component
          ? `Memory leak detected in ${component}`
          : `Memory leak detected: ${memoryGrowth || 'Unknown growth rate'}`;

    return new SystemError(message, {
      code: 'MEMORY_LEAK',
      context: { component, memoryGrowth, ...context },
    });
  }
}
