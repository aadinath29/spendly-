/** An error carrying an HTTP status code, recognised by the error middleware. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const httpError = (status, message) => new ApiError(status, message);
