import { Collection, Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/values";

export class PrintArgs {
  constructor(public value: Value, public indent = 0) {}
}

export class PrintCommand implements Command, Resolvable {
  constructor(private args: PrintArgs, private context: ExecutionContext) {}

  private generateIndentation() {
    return Array.from({ length: this.args.indent }).fill(" ").join("");
  }

  async execute(message: Message): Promise<Value> {
    const [type, value] = await this.args.value.resolve(this.context, message);

    if (value === null) {
      return new Value("string", `${this.generateIndentation()}null`);
    }

    if (value === undefined) {
      return new Value("string", `${this.generateIndentation()}undefined`);
    }

    switch (type) {
      case "error":
        return new Value(
          "string",
          `${this.generateIndentation()}ERROR: ${value}`
        );
      case "iterable":
        if (value instanceof Collection) {
          return new Value(
            "string",
            `${this.generateIndentation()}[\n${value.array().join(",\n")}\n]`
          );
        } else {
          const results = [];
          for (let val of value) {
            if (val instanceof Value) {
              const newPrint = new PrintCommand(
                new PrintArgs(val, this.args.indent + 1),
                this.context
              );
              const [, newPrintResult] = await newPrint.resolve(
                this.context,
                message
              );
              results.push(`${this.generateIndentation()} ${newPrintResult}`);
            } else {
              results.push(`${this.generateIndentation()} ${val}`);
            }
          }
          return new Value("string", `[\n${results.join(",\n")}\n]`);
        }
      case "object":
        if ((value as object).toString === Object.prototype.toString) {
          const results = [];
          for (let [key, val] of Object.entries(value)) {
            if (val instanceof Value) {
              const newPrint = new PrintCommand(
                new PrintArgs(val, this.args.indent + 1),
                this.context
              );
              const [, newPrintResult] = await newPrint.resolve(
                this.context,
                message
              );
              results.push(
                `${this.generateIndentation()} ${key}: ${newPrintResult}`
              );
            } else {
              results.push(`${this.generateIndentation()} ${key}: ${val}`);
            }
          }
          return new Value(
            "string",
            `${this.generateIndentation()}{\n${results.join(",\n")}\n}`
          );
        } else {
          return new Value("string", `${this.generateIndentation()}${value}`);
        }
      case "string":
        return new Value("string", `${this.generateIndentation()}${value}`);
      default:
        return new Value("string", `${this.generateIndentation()}${value}`);
    }
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
