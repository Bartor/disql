import { Value } from "./values";

export class ErrorValue extends Value {
  constructor(message: string) {
    super("error", message);
  }
}

export class UnhandledError extends Value {
  constructor(error: any) {
    super("error", "An unhandled error occurred; check console");
    console.error(error);
  }
}
