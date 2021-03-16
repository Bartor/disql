import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { isValueType, Value } from "../model/value";

export class GetArgs {
  constructor(public value: Value, public field: string) {}
}

export class GetCommand implements Command, Resolvable {
  constructor(private args: GetArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const value = await this.args.value.resolve(this.context, message);
    const valueType = typeof value;
    if (isValueType(valueType)) {
      return new Value(valueType, value[this.args.field]);
    } else {
      return new Value("object", value[this.args.field]);
    }
  }

  resolve(_, message: Message): Promise<any> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
