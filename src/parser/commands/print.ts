import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/values";

export class PrintArgs {
  constructor(public value: Value, public fields: Value[]) {}
}

export class PrintCommand implements Command, Resolvable {
  constructor(private args: PrintArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const [, value] = await this.args.value.resolve(this.context, message);
    if (this.args.fields === null) {
      return new Value("string", (value ?? "NULL").toString());
    } else {
      if (typeof value === "object") {
        let result = [];
        for (let field of this.args.fields) {
          const [, fieldName] = await field.resolve(this.context, message);
          result.push(value[fieldName] ?? "NULL");
        }
        return new Value("string", result.join("\n"));
      } else {
        return new Value(
          "error",
          `Value ${value} is not an object and thus has no fields`
        );
      }
    }
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
