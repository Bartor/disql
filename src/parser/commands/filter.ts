import { Message } from "discord.js";
import { assertType } from "../misc/assertType";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/values";

export class FilterArgs {
  constructor(
    public iterationVariable: string,
    public iterationTarget: Value,
    public compareResult: Value,
    public iteratorVariable?: string
  ) {}
}

export class FilterCommand implements Command, Resolvable {
  constructor(private args: FilterArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const [iterableType, iterable] = await this.args.iterationTarget.resolve(
      this.context,
      message
    );

    const iterationAssertion = assertType(iterableType, "iterable");
    if (iterationAssertion) return Value.fromResolved(iterationAssertion);

    const result = [];
    for (let [index, element] of iterable.entries()) {
      this.context.pushVariable(this.args.iterationVariable, element);
      if (this.args.iteratorVariable)
        this.context.pushVariable(
          this.args.iteratorVariable,
          new Value("number", index)
        );

      const [
        compareType,
        compareResult,
      ] = await this.args.compareResult.resolve(this.context, message);
      const compareAssertion = assertType(compareType, "boolean");
      if (compareAssertion) return Value.fromResolved(compareAssertion);

      if (compareResult) {
        result.push(element);
      }

      this.context.popVariable(this.args.iterationVariable);
      if (this.args.iteratorVariable)
        this.context.popVariable(this.args.iteratorVariable);
    }

    return new Value("iterable", result);
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
