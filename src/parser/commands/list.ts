import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { Value } from "../model/value";
import { Filter, FilterUnion } from "./subcommands/filter";

export class ListArgs {
  constructor(public iterable: Value, public filters: Filter | FilterUnion) {}
}

export class ListCommand implements Command, Resolvable {
  constructor(private args: ListArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const iterableValue = (await this.args.iterable.resolve(
      this.context,
      message
    )) as Array<Value>;
    const result = [];
    for (let value of iterableValue) {
      if (await this.args.filters.execute(value, this.context, message)) {
        result.push(value);
      }
    }
    return new Value("iterable", result);
  }

  resolve(_, message: Message): Promise<any> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
