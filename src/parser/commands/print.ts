import { Command } from "../model/command";
import { ExecutionContext } from "../model/execution-context";
import { Value } from "../model/value";

export class PrintArgs {
  constructor(public value: Value, public fields: Value[]) {}
}

export class PrintCommand implements Command {
  constructor(private args: PrintArgs, private context: ExecutionContext) {}

  async execute(): Promise<string> {
    const value = this.args.value.resolve(this.context);
    if (this.args.fields === null) {
      return value.toString();
    } else {
      if (typeof value === "object") {
        let result = "";
        for (let field of this.args.fields) {
          const fieldName = field.resolve(this.context);
          result += `${fieldName}: ${value[fieldName] ?? "NULL"}\n`;
        }
        return result;
      } else {
        throw `Value ${value} is not an object and thus has no fields`;
      }
    }
  }
}
