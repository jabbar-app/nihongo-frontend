/**
 * Error Logger Utility
 * 
 * Provides centralized error logging with context, stack trace capture,
 * and structured logging for debugging and monitoring.
 * 
 * @module lib/error-logger
 */

import { ApplicationError, isApplicationError } from '@/types/errors/app-error';

/**
 * Error log entry with full context
 */
export interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  category?: string;
  code?: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
  userAgent?: string;
  url?: string;
}

/**
 * Error logger configuration
 */
export interface ErrorLoggerConfig {
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  maxLogSize?: number;
}

/**
 * Centralized error logger for the application
 * 
 * Handles logging of errors with context, stack traces, and optional
 * remote logging for monitoring and debugging.
 * 
 * @example
 * ```typescript
 * errorLogger.error(error, { userId: '123', action: 'login' });
 * ```
 */
class ErrorLogger {
  private config: Required<ErrorLoggerConfig>;
  private logs: ErrorLogEntry[] = [];

  constructor(config: ErrorLoggerConfig = {}) {
    this.config = {
      enableConsole: config.enableConsole ?? true,
      enableRemote: config.enableRemote ?? false,
      remoteEndpoint: config.remoteEndpoint ?? '/api/logs',
      maxLogSize: config.maxLogSize ?? 100,
    };
  }

  /**
   * Log an error with context
   * 
   * @param error - The error to log
   * @param context - Additional context information
   */
  error(error: unknown, context?: Record<string, unknown>): void {
    this.log('error', error, context);
  }

  /**
   * Log a warning
   * 
   * @param error - The error/warning to log
   * @param context - Additional context information
   */
  warn(error: unknown, context?: Record<string, unknown>): void {
    this.log('warn', error, context);
  }

  /**
   * Log info
   * 
   * @param error - The error/info to log
   * @param context - Additional context information
   */
  info(error: unknown, context?: Record<string, unknown>): void {
    this.log('info', error, context);
  }

  /**
   * Internal logging method
   */
  private log(
    level: 'error' | 'warn' | 'info',
    error: unknown,
    context?: Record<string, unknown>
  ): void {
    const entry = this.createLogEntry(level, error, context);
    
    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.config.maxLogSize) {
      this.logs.shift();
    }

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(level, entry);
    }

    // Send to remote endpoint
    if (this.config.enableRemote) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: 'error' | 'warn' | 'info',
    error: unknown,
    context?: Record<string, unknown>
  ): ErrorLogEntry {
    const appError = isApplicationError(error) ? error : null;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return {
      timestamp: new Date().toISOString(),
      level,
      category: appError?.category,
      code: appError?.code,
      message: errorMessage,
      context,
      stack: errorStack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  /**
   * Log to browser console
   */
  private logToConsole(
    level: 'error' | 'warn' | 'info',
    entry: ErrorLogEntry
  ): void {
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    const prefix = `[${entry.timestamp}] ${entry.code || entry.category || 'ERROR'}`;
    
    console[consoleMethod](prefix, entry.message, {
      category: entry.category,
      code: entry.code,
      context: entry.context,
      stack: entry.stack,
    });
  }

  /**
   * Send log entry to remote endpoint
   */
  private sendToRemote(entry: ErrorLogEntry): void {
    if (typeof window === 'undefined') {
      return; // Skip in server-side environment
    }

    // Use sendBeacon for reliability (doesn't require response)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.remoteEndpoint, JSON.stringify(entry));
    } else {
      // Fallback to fetch
      fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      }).catch((err) => {
        console.error('Failed to send error log to remote:', err);
      });
    }
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: 'error' | 'warn' | 'info'): ErrorLogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs filtered by category
   */
  getLogsByCategory(category: string): ErrorLogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger({
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/logs',
});

export default errorLogger;
