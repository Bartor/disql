// Initialize a default execution context
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

// list - takes an IterableSource, allows filters and returns IterableSource 
filter
    = 'filter' __ args:filter_args
        { return new FilterCommand(args, context); }
filter_args 
    = iteration_variable:object_key _ ',' _ index_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'on' __ value:value
        { return new FilterArgs(iteration_variable, iteration_target, value, index_variable); }
    / iteration_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'on' __ value:value
        { return new FilterArgs(iteration_variable, iteration_target, value); }

comparison_union
    = '(' _ lhs:comparison_union __ op:unions __ rhs:comparison_union ')'
        { return new ComparisonUnion(lhs, op, rhs); }
    / comparison

// _ <op> y - takes an Value and compares it to a value
comparison
    = 'is' __ lhs:value __ op:comparison_operator __ rhs:value 
        { return new Comparison(lhs, op, rhs); }

// map .. in .. to - binds a Value<reference> to ExecutionContext for each item of IterableSource
map
    = 'map' __ args:map_args
        { return new MapCommand(args, context); }
map_args
    = iteration_variable:object_key _ ',' _ index_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'into' __ command:command
        { return new MapArgs(iteration_variable, iteration_target, command, index_variable); }
    / iteration_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'into' __ command:command
        { return new MapArgs(iteration_variable, iteration_target, command); }

// print - converts Value<any> to Value<string>
print
    = 'print' __ args:print_args
        { return new PrintCommand(args, context); }
print_args
    = value:value
        { return new PrintArgs(value); }

// length - return Value<number> of length of Value
length
    = 'length' __ args:legnth_args
        { return new LengthCommand(args, context); }
legnth_args
    = value:value
        { return new LengthArgs(value); }

// get - returns field value
get
    = 'get' __ args:get_args
        { return new GetCommand(args, context); }
get_args
    = key:value __ 'from' __ value:value 
        { return new GetArgs(value, key); }

// rename - universal renaming tool
rename
    = 'rename' __ args:rename_args
        { return new RenameCommand(args, context); }
rename_args
    = object:value __ 'to' __ newName:value
        { return new RenameArgs(object, newName); }

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
    
// RELATED TO COMMANDS
iterable_value
    = '(' expression:iterable_expression ')'
        { return expression; }
    / '(' expression:iterable_value ')'
        { return expression; }
    / iterable_expression

iterable_expression
    // These return Value<iterable> instances
    = filter
    / map
    / range
    / get
    / array
    // Thesre return predefined Value<iterable> instance
    / 'users'
        { return new Value('iterable', 'users'); }
    / 'roles'
        { return new Value('iterable', 'roles'); }
    / 'channels'
        { return new Value('iterable', 'channels'); }
unions
    = 'and' / 'or'
comparison_operator
    = '>=' / '<=' / '=' / '<>' / '>' / '<' / 'in'

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

// VALUES
value
    = '(' expression:value_expression ')'
        { return expression; }
    / '(' expression:value ')'
        { return expression; }
    / value_expression
value_expression
    // These return Value<iterable> instances
    = iterable_value
    / print
    / length
    / dict
    / get
    / array
    // These return regular Value instances
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
    // These resturn Value<boolean> instances
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