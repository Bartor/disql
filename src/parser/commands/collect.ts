import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/value";

export class CollectField {
  constructor(public key: string, public value: Value) {}
}

export class CollectArgs {
  constructor(public fields: CollectField[]) {}
}

export class CollectCommand implements Command, Resolvable {
  constructor(private args: CollectArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const result: Record<string, any> = {};
    for (let field of this.args.fields) {
      [, result[field.key]] = await field.value.resolve(this.context, message);
    }
    return new Value("object", result);
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
