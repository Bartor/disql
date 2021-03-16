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
    return new Value(
      "iterable",
      iterableValue.filter((value) =>
        this.args.filters.execute(value, this.context, message)
      )
    );
  }

  resolve(_, message: Message): Promise<any> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
