import { ResolvedValue, Value, ValueType } from "../model/values";

export const assertType = (type: string, wantedType: ValueType): ResolvedValue | undefined => {
  if (type !== wantedType)
    return ["error", `Expected ${wantedType}, got ${type}`];
};
