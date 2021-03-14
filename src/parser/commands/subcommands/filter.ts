import { IterableSubcommand } from "../../model/command";

const operatorMap: Record<
  string,
  (
    target: Record<string, any>,
    key: string,
    value: string | number
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
  constructor(
    private key: string,
    private op: string,
    private value: string | number
  ) {
    if (operatorMap[op] === undefined) throw `Unknown operator ${op}`;
  }

  execute(target: object): boolean {
    return operatorMap[this.op](target, this.key, this.value);
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

  execute(target: object): boolean {
    switch (this.op) {
      case "and":
        return this.lhs.execute(target) && this.rhs.execute(target);
      case "or":
        return this.lhs.execute(target) || this.rhs.execute(target);
    }
  }
}

export class PassFilter implements IterableSubcommand {
  execute() { 
    return true;
  }
}