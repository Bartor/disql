import { Message } from "discord.js";
import { ExecutionContext } from "../../model/execution-context";
import { Value } from "../../model/value";

const operatorMap: Record<
  string,
  (target: Record<string, any>, key: string, value: any) => boolean | undefined
> = {
  "=": (target, key, value) => target[key] === value,
  "<>": (target, key, value) => target[key] !== value,
  ">": (target, key, value) => target[key] > value,
  "<": (target, key, value) => target[key] < value,
  ">=": (target, key, value) => target[key] >= value,
  "<=": (target, key, value) => target[key] <= value,
};

export class Filter {
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
    return operatorMap[this.op](targetValue, this.key, valueValue);
  }
}

export class FilterUnion {
  constructor(
    private lhs: Filter | FilterUnion,
    private op: "or" | "and",
    private rhs: Filter | FilterUnion
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

export class PassFilter {
  async execute(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
