import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { Value } from "../model/value";

export class RangeArgs {
  constructor(public to: Value, public from: Value, public step: Value) {}
}

export class RangeCommand implements Command, Resolvable {
  constructor(private args: RangeArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const [to, from, step] = await Promise.all([
      this.args.to.resolve(this.context, message),
      this.args.from.resolve(this.context, message),
      this.args.step.resolve(this.context, message),
    ]);

    if (
      typeof to !== "number" ||
      typeof from !== "number" ||
      typeof step !== "number"
    ) {
      throw "All range arguments must be numbers";
    }

    const negative = from > to;
    let current = from;
    const result = [];
    while ((negative && current > from) || (!negative && current < to)) {
      result.push(new Value("number", current));
      current += negative ? -step : step;
    }

    return new Value("iterable", result);
  }

  resolve(_, message: Message): Promise<Value> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
