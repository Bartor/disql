import { Value } from "./values";

export class ErrorValue extends Value {
  constructor(message: string) {
    super("error", message);
  }
}
