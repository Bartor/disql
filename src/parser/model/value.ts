import { Base, Message } from "discord.js";
import { ExecutionContext, Resolvable } from "./execution-context";
import { iterableObjects } from "./iterables";
import { inspect } from "util";

export type ValueType =
  | "number"
  | "string"
  | "boolean"
  | "null"
  | "object"
  | "error" // special type for execution errors
  | "iterable" // special type for iteration commands results/iteration sources
  | "reference"; // special type for ExecutionContext variable references

export function isValueType(value: string): value is ValueType {
  const allowedKey = [
    "number",
    "string",
    "boolean",
    "null",
    "object",
    "error", // special type for execution errors
    "iterable", // special type for iteration commands results/iteration sources
    "reference", // special type for ExecutionContext variable references
  ];

  return allowedKey.includes(value);
}

export type ResolvedValue = [type: ValueType, value: any];

export class Value implements Resolvable {
  constructor(
    public readonly type: ValueType,
    public readonly value: string | number | boolean | null | object
  ) {}

  async resolve(
    context: ExecutionContext,
    message: Message
  ): Promise<ResolvedValue> {
    let resolved: ResolvedValue;
    switch (this.type) {
      case "reference":
        resolved = await context
          .resolveVariable(this.value as string)
          .resolve(context, message);
        break;
      case "iterable":
        if (typeof this.value === "string") {
          resolved = ["iterable", iterableObjects[this.value](message)];
        } else {
          resolved = [this.type, this.value];
        }
        break;
      default:
        resolved = [this.type, this.value];
        break;
    }

    return resolved;
  }

  public toString(): string {
    switch (this.type) {
      case "error":
        return `ERROR: ${this.value}`;
      case "iterable":
        return `[\n${(this.value as Array<Value>).join("\n")}\n]`;
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
