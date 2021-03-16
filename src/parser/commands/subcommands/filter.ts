import { Message } from "discord.js";
import { ExecutionContext } from "../../model/execution-context";
import { Value } from "../../model/value";

const operatorMap: Record<
  string,
  (compare: any, compareWith: any) => boolean | undefined
> = {
  "=": (compare, compareWith) => compare === compareWith,
  "<>": (compare, compareWith) => compare !== compareWith,
  ">": (compare, compareWith) => compare > compareWith,
  "<": (compare, compareWith) => compare < compareWith,
  ">=": (compare, compareWith) => compare >= compareWith,
  "<=": (compare, compareWith) => compare <= compareWith,
};

export class FilterCase {
  constructor(private key: string, private op: string, private value: Value) {
    if (operatorMap[op] === undefined) throw `Unknown operator ${op}`;
  }

  async execute(
    target: Value,
    context: ExecutionContext,
    message: Message
  ): Promise<boolean> {
    const targetValue = await target.resolve(context, message);
    const valueValue = await this.value.resolve(context, message);

    if (this.key === null) {
      return operatorMap[this.op](targetValue, valueValue);
    } else {
      return operatorMap[this.op](targetValue[this.key], valueValue);
    }
  }
}

export class FilterCaseUnion {
  constructor(
    private lhs: FilterCase | FilterCaseUnion,
    private op: "or" | "and",
    private rhs: FilterCase | FilterCaseUnion
  ) {
    if (op !== "or" && op !== "and") {
      throw `Unknown operator ${op}`;
    }
  }

  async execute(
    target: Value,
    context: ExecutionContext,
    message: Message
  ): Promise<boolean> {
    switch (this.op) {
      case "and":
        return (
          (await this.lhs.execute(target, context, message)) &&
          (await this.rhs.execute(target, context, message))
        );
      case "or":
        return (
          (await this.lhs.execute(target, context, message)) ||
          (await this.rhs.execute(target, context, message))
        );
    }
  }
}

export class PassFilterCase {
  async execute(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
