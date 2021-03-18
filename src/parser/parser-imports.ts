export const PARSER_IMPORTS = `
import { FilterCommand, FilterArgs } from '../commands/list';
import { FilterCase, FilterCaseUnion, PassFilterCase } from '../commands/subcommands/filter';
import { Value } from '../model/value';
import { ExecutionContext } from '../model/execution-context';
import { MapCommand, MapArgs } from '../commands/for-in-do';
import { LengthCommand, LengthArgs } from '../commands/length';
import { CollectCommand, CollectArgs, CollectField } from '../commands/collect';
import { GetCommand, GetArgs } from '../commands/get';
import { PrintCommand, PrintArgs } from '../commands/print';
import { RenameCommand, RenameArgs } from '../commands/rename';
import { RangeCommand, RangeArgs } from '../commands/range';
`;
