import { Message } from "discord.js";
import { ExecutionContext } from "../model/execution-context";
import { IterableSource, IterableValue } from "../model/iterables";
import { Filter, FilterUnion } from "./subcommands/filter";

export class ListArgs {
  constructor(
    public iterable: IterableSource,
    public filters: Filter | FilterUnion
  ) {}
}

export class ListCommand extends IterableSource {
  constructor(private args: ListArgs, private context: ExecutionContext) {
    super(args.iterable);
  }

  async execute(message: Message): Promise<IterableValue> {
    return (await this.args.iterable.execute(message)).filter((value) =>
      this.args.filters.execute(value, this.context)
    );
  }
}
