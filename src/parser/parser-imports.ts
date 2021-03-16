export const PARSER_IMPORTS = `
import { ListCommand, ListArgs } from '../commands/list';
import { Filter, FilterUnion, PassFilter } from '../commands/subcommands/filter';
import { Value } from '../model/value';
import { ExecutionContext } from '../model/execution-context';
import { ForInDoCommand, ForInDoArgs } from '../commands/for-in-do';
import { LengthCommand, LengthArgs } from '../commands/length';
import { CollectCommand, CollectArgs, CollectField } from '../commands/collect';
import { GetCommand, GetArgs } from '../commands/get';
import { PrintCommand, PrintArgs } from '../commands/print';
`;
