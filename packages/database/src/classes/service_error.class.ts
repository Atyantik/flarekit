export class ServiceError extends Error {
  status: number;
  details?: any[];

  constructor(status: number, message: string, details?: any[]) {
    super(message);
    this.status = status;
    this.details = details || [];
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      details: this.details,
    };
  }
}
