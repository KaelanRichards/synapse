export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'OPERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorMetadata {
  code: ErrorCode;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export class APIError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public metadata?: Omit<ErrorMetadata, 'code' | 'message'>,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  static fromError(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Error) {
      // Handle network errors
      if ('NetworkError' === error.name) {
        return new APIError(
          'Network error occurred',
          'NETWORK_ERROR',
          undefined,
          error
        );
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        return new APIError(
          error.message,
          'VALIDATION_ERROR',
          undefined,
          error
        );
      }

      return new APIError(error.message, 'OPERATION_FAILED', undefined, error);
    }

    return new APIError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }

  toJSON(): ErrorMetadata {
    return {
      code: this.code,
      message: this.message,
      ...(this.metadata || {}),
    };
  }

  static isAPIError(error: unknown): error is APIError {
    return error instanceof APIError;
  }
}
