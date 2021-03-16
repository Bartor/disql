import { Message } from "discord.js";
import { ExecutionContext, Resolvable } from "./execution-context";
import { iterableObjects } from "./iterables";
import { inspect } from "util";

export class Value implements Resolvable {
  constructor(
    public readonly type:
      | "number"
      | "string"
      | "boolean"
      | "null"
      | "object"
      | "iterable" // special type for iteration commands results/iteration sources
      | "reference", // special type for ExecutionContext variable references
    public readonly value: string | number | boolean | null | object
  ) {}

  async resolve(context: ExecutionContext, message: Message): Promise<any> {
    let value: any;
    switch (this.type) {
      case "reference":
        value = context.resolveVariable(this.value as string);
        break;
      case "iterable":
        if (typeof this.value === "string") {
          value = await iterableObjects[this.value](message);
        } else {
          value = this.value;
        }
        break;
      default:
        value = this.value;
        break;
    }

    return value instanceof Value
      ? await value.resolve(context, message)
      : value;
  }

  public toString(): string {
    switch (this.type) {
      case "object":
        return inspect(this.value, false, null, false);
      case "string":
        return this.value as string;
      case "null":
        return "NULL";
      default:
        return this.value.toString();
    }
  }
}
