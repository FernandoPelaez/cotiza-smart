export class ServiceError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "REQUEST_ERROR",
  ) {
    super(message);
  }
}
