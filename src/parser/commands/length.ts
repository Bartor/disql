import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/values";

export class LengthArgs {
  constructor(public value: Value) {}
}

export class LengthCommand implements Command, Resolvable {
  constructor(private args: LengthArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const [, value] = await this.args.value.resolve(this.context, message);
    return new Value("number", value.length ?? -1);
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
