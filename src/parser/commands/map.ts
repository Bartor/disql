import { Message } from "discord.js";
import { assertType } from "../misc/assertType";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/values";

export class MapArgs {
  constructor(
    public variableIdentifier: string,
    public iterationTarget: Value,
    public command: Command,
    public indexIdentifier?: string
  ) {}
}

export class MapCommand implements Command, Resolvable {
  constructor(private args: MapArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const result = [];
    const [iterableType, iterable] = await this.args.iterationTarget.resolve(
      this.context,
      message
    );

    const iterableAssertion = assertType(iterableType, "iterable");
    if (iterableAssertion) return Value.fromResolved(iterableAssertion);

    for (let [index, element] of iterable.entries()) {
      this.context.pushVariable(this.args.variableIdentifier, element);
      if (this.args.indexIdentifier) {
        this.context.pushVariable(
          this.args.indexIdentifier,
          new Value("number", index)
        );
      }
      result.push(await this.args.command.execute(message));
      if (this.args.indexIdentifier) {
        this.context.popVariable(this.args.indexIdentifier);
      }
      this.context.popVariable(this.args.variableIdentifier);
    }
    return new Value("iterable", result);
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
