export const PARSER_IMPORTS = `
import { FilterCommand, FilterArgs } from '../commands/filter';
import { DiscordChannel, DiscordUser, DiscordRole } from '../model/discord/resolvers';
import { MapCommand, MapArgs } from '../commands/map';
import { LengthCommand, LengthArgs } from '../commands/length';
import { GetCommand, GetArgs } from '../commands/get';
import { PrintCommand, PrintArgs } from '../commands/print';
import { RenameCommand, RenameArgs } from '../commands/rename';
import { AssignRoleCommand, AssignRoleArgs } from '../commands/assign-role';
import { RangeCommand, RangeArgs } from '../commands/range';

import { ExecutionContext } from '../model/execution-context';

import { Dict, DictArgs } from '../model/dict';
import { ValueArray } from '../model/array';
import { Comparison, ComparisonUnion } from '../model/comparisons';
import { Value } from '../model/values';
`;
