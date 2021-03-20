export const PARSER_IMPORTS = `
import { FilterCommand, FilterArgs } from '../commands/filter';
import { Value } from '../model/values';
import { Comparison, ComparisonUnion } from '../model/comparisons';
import { ExecutionContext } from '../model/execution-context';
import { MapCommand, MapArgs } from '../commands/map';
import { LengthCommand, LengthArgs } from '../commands/length';
import { CollectCommand, CollectArgs, CollectField } from '../commands/collect';
import { GetCommand, GetArgs } from '../commands/get';
import { PrintCommand, PrintArgs } from '../commands/print';
import { RenameCommand, RenameArgs } from '../commands/rename';
import { RangeCommand, RangeArgs } from '../commands/range';
`;
