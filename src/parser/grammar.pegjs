// Initializes a default, empty execution context
{
const context = new ExecutionContext();
}

start 
    = command
command
    = '(' expression:command_expression ')'
        { return expression; }
    / '(' expression:command ')'
        { return expression; }
    / command_expression
command_expression
    = filter / map / print / length / get / rename / range 

// COMMANDS

// filter <variable>[, <index>] in <iterable> on <boolean> - filters given iterable based on boolean expression value 
filter
    = 'filter' __ args:filter_args
        { return new FilterCommand(args, context); }
filter_args 
    = iteration_variable:object_key _ ',' _ index_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'on' __ value:value
        { return new FilterArgs(iteration_variable, iteration_target, value, index_variable); }
    / iteration_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'on' __ value:value
        { return new FilterArgs(iteration_variable, iteration_target, value); }

// map <value> [, <index>] in <iterable> into <command> - runs command for each value and returns its result as a new iterable
map
    = 'map' __ args:map_args
        { return new MapCommand(args, context); }
map_args
    = iteration_variable:object_key _ ',' _ index_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'into' __ command:command
        { return new MapArgs(iteration_variable, iteration_target, command, index_variable); }
    / iteration_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'into' __ command:command
        { return new MapArgs(iteration_variable, iteration_target, command); }

// print <value> - returns the value converted to string
print
    = 'print' __ args:print_args
        { return new PrintCommand(args, context); }
print_args
    = value:value
        { return new PrintArgs(value); }

// length <value> - returns length of a value if applicable, -1 otherwise
length
    = 'length' __ args:legnth_args
        { return new LengthCommand(args, context); }
legnth_args
    = value:value
        { return new LengthArgs(value); }

// get <key> from <value> - returns a value under object's key
get
    = 'get' __ args:get_args
        { return new GetCommand(args, context); }
get_args
    = key:value __ 'from' __ value:value 
        { return new GetArgs(value, key); }

// rename <value> to <value> - renames a User, Channel or Role to new (nick)name
rename
    = 'rename' __ args:rename_args
        { return new RenameCommand(args, context); }
rename_args
    = object:value __ 'to' __ newName:value
        { return new RenameArgs(object, newName); }

// range <to> [step <step = 1>]
// range <from> to <to> [step <step = 1>] - creates an iterable of numbers from value to value with a given step
range
    = 'range' __ args:range_args
        { return new RangeCommand(args, context); }
range_args
    = from:value __ 'to' __ to:value __ 'step' __ step:value
        { return new RangeArgs(to, from, step); }
    / from:value __ 'to' __ to:value
        { return new RangeArgs(to, from, new Value('number', 1)); }
    / to:value __ 'step' __ step:value
        { return new RangeArgs(to, new Value('number', 0), step); }
    / to:value
        { return new RangeArgs(to, new Value('number', 0), new Value('number', 1)); }

// EXPRESSIONS

iterable_value
    = '(' expression:iterable_expression ')'
        { return expression; }
    / '(' expression:iterable_value ')'
        { return expression; }
    / iterable_expression

iterable_expression
    // Commands/expressions which return an iterable
    = filter
    / map
    / range
    / get
    / array
    // Literals
    / 'users'
        { return new Value('iterable', 'users'); }
    / 'roles'
        { return new Value('iterable', 'roles'); }
    / 'channels'
        { return new Value('iterable', 'channels'); }

// { <key1>: <value1>, ... } - contructs a dictionary
dict
    = '{' _ args:dict_args _ '}'
        { return new Dict(args); }
dict_args
    = fields:dict_some_fields?
        { return new DictArgs(fields); }
dict_some_fields
    = head:dict_field _ ',' _ tail:dict_some_fields
        { return [head, ...tail]; }
    / field:dict_field
        { return [field]; }
dict_field
    = key:object_key _ ':' _ value:value
        { return {[key]: value}; }

// [<value1>, <value2>, <value3>, ...] - contructs an array
array
    = '[' _ args:array_args _ ']'
        { return new ValueArray(args); }
array_args
    = elements:array_some_elements?
        { return elements ?? []; }
array_some_elements
    = head:array_element _ ',' _ tail:array_some_elements
        { return [head, ...tail]; }
    / element:array_element
        { return [element]; }
array_element
    = value

// <boolean> and/or <boolean> - constructs a logical union of booleans
comparison_union
    = '(' _ lhs:comparison_union __ op:unions __ rhs:comparison_union ')'
        { return new ComparisonUnion(lhs, op, rhs); }
    / comparison
unions
    = 'and' / 'or'

// <boolean> <op> <boolean> - comparison of booleans
comparison
    = 'is' __ lhs:value __ op:comparison_operator __ rhs:value 
        { return new Comparison(lhs, op, rhs); }
comparison_operator
    = '>=' / '<=' / '=' / '<>' / '>' / '<' / 'in'

// VALUES
value
    = '(' expression:value_expression ')'
        { return expression; }
    / '(' expression:value ')'
        { return expression; }
    / value_expression
value_expression
    // Commands that return a value
    = iterable_value
    / print
    / length
    / dict
    / get
    / array
    // Literals
    / discord_value
    / boolean
    / null
        { return new Value('null', null); }
    / reference:object_key
        { return new Value('reference', reference); }
    / str:string 
        { return new Value('string', str); }
    / num:number
        { return new Value('number', num); }
// Parses @ and # from messages
discord_value
    = '<@' id:[0-9]+ '>'
        { return new DiscordUser(id.join('')); }
    / '<@!' id:[0-9]+ '>'
        { return new DiscordUser(id.join('')); }
    / '<#' id:[0-9]+ '>'
        { return new DiscordChannel(id.join('')); }
    / '<@&' id:[0-9]+ '>'
        { return new DiscordRole(id.join('')); }
boolean
    // Commands that return booleans
    = comparison
    / comparison_union
    // Literals
    / 'true'
        { return new Value('boolean', true); }
    / 'false'
        { return new Value('boolean', false); }
null
    = 'null'
object_key
    = key:[_$a-zA-Z]+[_$a-zA-Z0-9]* 
        { return key.flat().join(''); }
string
    = '"' chars:[^"]+ '"' 
        { return chars.join(''); }
    / "'" chars:[^']+ "'"
        { return chars.join(''); }
number
    = sign:'-'? integral:('0' / [1-9][0-9]*) fraction:("." [0-9]*)? 
        { 
            const result = Number.parseFloat((Array.isArray(integral) ? integral.flat().join('') : integral) + (fraction ?? []).flat().join(''));
            if (sign === null) {
                return result;
            } else {
                return -result;
            }
        }
_
    = ' '*
__
    = ' '+