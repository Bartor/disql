import { Collection, Message } from "discord.js";
import { ExecutionContext, Resolvable } from "./execution-context";
import { iterableObjects } from "./iterables";

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

  static fromResolved(resolved: ResolvedValue): Value {
    return new Value(...resolved);
  }

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
          if (this.value instanceof Collection) {
            resolved = [this.type, this.value.array()];
          } else {
            resolved = [this.type, this.value];
          }
        }
        break;
      default:
        resolved = [this.type, this.value];
        break;
    }

    return resolved;
  }

  public toString() {
    if (this.value === null) {
      return "null";
    }

    if (this.value === undefined) {
      return "undefined";
    }

    switch (this.type) {
      case "error":
        return `ERROR: ${this.value}`;
      case "iterable":
        if (this.value instanceof Collection) {
          return `[\n${this.value.array().join(",\n")}\n]`;
        } else {
          return `[\n${(this.value as Array<any>).join(",\n")}\n]`;
        }
      case "object":
        if ((this.value as object).toString === Object.prototype.toString) {
          let result = "{\n";
          Object.entries(this.value).forEach(([key, value]) => {
            result += `\t${key}: ${value}\n`;
          });
          result += "}";
          return result;
        } else {
          return this.value.toString();
        }
      case "string":
        return this.value as string;
      default:
        return this.value.toString();
    }
  }
}
