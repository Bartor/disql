import { Message } from "discord.js";
import { assertType } from "../misc/assertType";
import { ExecutionContext, Resolvable } from "./execution-context";
import { ResolvedValue, Value } from "./values";

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

export class Comparison implements Resolvable {
  constructor(private lhs: Value, private op: string, private rhs: Value) {
    if (operatorMap[op] === undefined) throw `Unknown operator ${op}`;
  }

  async resolve(
    context: ExecutionContext,
    message: Message
  ): Promise<ResolvedValue> {
    const [, lhsValue] = await this.lhs.resolve(context, message);
    const [, rhsValue] = await this.rhs.resolve(context, message);

    return ["boolean", operatorMap[this.op](lhsValue, rhsValue)];
  }
}

export class ComparisonUnion implements Resolvable {
  constructor(
    private lhs: Value,
    private op: "or" | "and",
    private rhs: Value
  ) {
    if (op !== "or" && op !== "and") {
      throw `Unknown operator ${op}`;
    }
  }

  async resolve(
    context: ExecutionContext,
    message: Message
  ): Promise<ResolvedValue> {
    const [lhsType, lhsValue] = await this.lhs.resolve(context, message);

    if (lhsType !== "boolean") {
      return ["error", `Value of type ${lhsType} cannot be used in a union`];
    }
    const lhsAssertion = assertType(lhsType, "boolean");
    if (lhsAssertion) return lhsAssertion;

    switch (this.op) {
      case "and":
        if (lhsValue === false) {
          return ["boolean", false];
        }
        const [rhsType, rhsValue] = await this.rhs.resolve(context, message);
        const rhsAssertion = assertType(rhsType, "boolean");
        if (rhsAssertion) return rhsAssertion;

        return ["boolean", lhsValue && rhsValue];
      case "or":
        if (lhsValue === true) {
          return ["boolean", true];
        }

        const [rhsType_, rhsValue_] = await this.rhs.resolve(context, message);
        const rhsAssertion_ = assertType(rhsType_, "boolean");
        if (rhsAssertion_) return rhsAssertion_;

        return ["boolean", lhsValue || rhsValue_];
    }
  }
}
