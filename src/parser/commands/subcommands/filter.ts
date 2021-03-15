import { IterableSubcommand } from "../../model/command";
import { ExecutionContext } from "../../model/execution-context";
import { Value } from "../../model/value";

const operatorMap: Record<
  string,
  (
    target: Record<string, any>,
    key: string,
    value: any
  ) => boolean | undefined
> = {
  "=": (target, key, value) => target[key] === value,
  "<>": (target, key, value) => target[key] !== value,
  ">": (target, key, value) => target[key] > value,
  "<": (target, key, value) => target[key] < value,
  ">=": (target, key, value) => target[key] >= value,
  "<=": (target, key, value) => target[key] <= value,
};

export class Filter implements IterableSubcommand {
  constructor(private key: string, private op: string, private value: Value) {
    if (operatorMap[op] === undefined) throw `Unknown operator ${op}`;
  }

  execute(target: object, context: ExecutionContext): boolean {
    return operatorMap[this.op](target, this.key, this.value.resolve(context));
  }
}

export class FilterUnion implements IterableSubcommand {
  constructor(
    private lhs: Filter | FilterUnion,
    private op: "or" | "and",
    private rhs: Filter | FilterUnion
  ) {
    if (op !== "or" && op !== "and") {
      throw `Unknown operator ${op}`;
    }
  }

  execute(target: object, context: ExecutionContext): boolean {
    switch (this.op) {
      case "and":
        return (
          this.lhs.execute(target, context) && this.rhs.execute(target, context)
        );
      case "or":
        return (
          this.lhs.execute(target, context) || this.rhs.execute(target, context)
        );
    }
  }
}

export class PassFilter implements IterableSubcommand {
  execute() {
    return true;
  }
}
