export type DataErrorCode = "invalid_id" | "not_found" | "bad_request";

/**
 * Thrown by the data access layer for problems the API layer should turn into
 * a safe JSON error response (no stack traces, no internal details).
 */
export class DataError extends Error {
  readonly code: DataErrorCode;

  constructor(code: DataErrorCode, message: string) {
    super(message);
    this.name = "DataError";
    this.code = code;
  }
}

export const DATA_ERROR_STATUS: Record<DataErrorCode, number> = {
  invalid_id: 400,
  bad_request: 400,
  not_found: 404,
};
