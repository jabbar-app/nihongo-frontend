/**
 * Application Error Types and Classes
 * 
 * Defines the standardized error interface and ApplicationError class
 * for consistent error handling throughout the application.
 * 
 * @module types/errors/app-error
 */

import { ErrorCategory, RecoveryAction } from './error-categories';

/**
 * Interface for standardized application errors
 * 
 * All errors in the application should conform to this interface
 * to ensure consistent error handling and user messaging.
 */
export interface AppError {
  /** The category of the error */
  category: ErrorCategory;
  
  /** User-friendly error message */
  message: string;
  
  /** Machine-readable error code for logging and debugging */
  code: string;
  
  /** HTTP status code (if applicable) */
  statusCode?: number;
  
  /** Additional error details for debugging */
  details?: Record<string, unknown>;
  
  /** Timestamp when the error occurred */
  timestamp: Date;
  
  /** Suggested recovery action for the error */
  recoveryAction?: RecoveryAction;
}

/**
 * Configuration object for creating ApplicationError instances
 */
export interface ApplicationErrorConfig {
  category: ErrorCategory;
  message: string;
  code: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  recoveryAction?: RecoveryAction;
}

/**
 * Standardized error class for all application errors
 * 
 * Extends Error to maintain compatibility with JavaScript error handling
 * while providing additional structured error information.
 * 
 * @example
 * ```typescript
 * throw new ApplicationError({
 *   category: ErrorCategory.VALIDATION,
 *   message: 'Email is required',
 *   code: 'VALIDATION_EMAIL_REQUIRED',
 * });
 * ```
 */
export class ApplicationError extends Error implements AppError {
  category: ErrorCategory;
  code: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  timestamp: Date;
  recoveryAction?: RecoveryAction;

  constructor(config: ApplicationErrorConfig) {
    super(config.message);
    
    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ApplicationError.prototype);
    
    this.name = 'ApplicationError';
    this.category = config.category;
    this.code = config.code;
    this.statusCode = config.statusCode;
    this.details = config.details;
    this.timestamp = new Date();
    this.recoveryAction = config.recoveryAction;
  }

  /**
   * Convert error to JSON for logging or transmission
   */
  toJSON() {
    return {
      name: this.name,
      category: this.category,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      recoveryAction: this.recoveryAction,
      stack: this.stack,
    };
  }

  /**
   * Convert error to string representation
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Type guard to check if an error is an ApplicationError
 * 
 * @param error - The error to check
 * @returns True if the error is an ApplicationError
 * 
 * @example
 * ```typescript
 * if (isApplicationError(error)) {
 *   console.log(error.category);
 * }
 * ```
 */
export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

/**
 * Convert any error to an ApplicationError
 * 
 * If the error is already an ApplicationError, returns it as-is.
 * Otherwise, wraps it in an ApplicationError with UNKNOWN category.
 * 
 * @param error - The error to convert
 * @returns An ApplicationError instance
 * 
 * @example
 * ```typescript
 * try {
 *   // some code
 * } catch (error) {
 *   const appError = toApplicationError(error);
 *   console.log(appError.category);
 * }
 * ```
 */
export function toApplicationError(error: unknown): ApplicationError {
  if (isApplicationError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return new ApplicationError({
    category: ErrorCategory.UNKNOWN,
    message,
    code: 'UNKNOWN_ERROR',
    details: stack ? { stack } : undefined,
  });
}
