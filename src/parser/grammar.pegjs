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
    = filter / map / print / length / collect / get

// COMMANDS

// list - takes an IterableSource, allows filters and returns IterableSource 
filter
    = 'filter' __ args:filter_args
        { return new FilterCommand(args, context); }
filter_args 
    = iterable:iterable_value filters:filters?
        { return new FilterArgs(iterable, filters ?? new PassFilterCase()); }
filters
    = __ 'on' __ filter:filter_union
        { return filter; }
filter_union
    = '(' _ lhs:filter_union __ op:unions __ rhs:filter_union _ ')'
        { return new FilterCaseUnion(lhs, op, rhs); }
    / filter_case
filter_case 
    = key:object_key _ op:comparison _ value:value 
        { return new FilterCase(key, op, value); }
    / op:comparison _ value:value
        { return new FilterCase(null, op, value); }

// map .. in .. to - binds a Value<reference> to ExecutionContext for each item of IterableSource
map
    = 'map' __ args:map_args
        { return new MapCommand(args, context); }
map_args
    = iteration_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'to' __ command:command
        { return new MapArgs(iteration_variable, iteration_target, command); }

// print - converts Value<any> to Value<string>
print
    = 'print' __ args:print_args
        { return new PrintCommand(args, context); }
print_args
    = value:value _ fields:print_object_fields?
        { return new PrintArgs(value, fields); }
print_object_fields
    = '(' _ fields:print_some_fields? _ ')'
        { return fields; }
print_some_fields
    = head:print_field _ ',' _ tail:print_some_fields
        { return [head, ...tail]; }
    / field:print_field
        { return [field]; }
print_field
    = value

// length - return Value<number> of length of Value
length
    = 'length' __ args:legnth_args
        { return new LengthCommand(args, context); }
legnth_args
    = value:value
        { return new LengthArgs(value); }

// colect - returns a map of properties/values pairs
collect
    = 'collect' __ args:collect_args
        { return new CollectCommand(args, context); }
collect_args
    = '{' _ fields:collect_some_fields? _ '}'
        { return new CollectArgs(fields); }
collect_some_fields
    = head:collect_field _ ',' _ tail:collect_some_fields
        { return [head, ...tail]; }
    / field:collect_field
        { return [field]; }
collect_field
    = key:object_key _ ':' _ value:value
        { return new CollectField(key, value); }

// get - returns field value
get
    = 'get' __ args:get_args
        { return new GetCommand(args, context); }
get_args
    = key:object_key __ 'from' __ value:value 
        { return new GetArgs(value, key); }


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
    // Thesre return predefined Value<iterable> instance
    / 'users'
        { return new Value('iterable', 'users'); }
    / 'roles'
        { return new Value('iterable', 'roles'); }
    / 'channels'
        { return new Value('iterable', 'channels'); }
unions
    = 'and' / 'or'
comparison
    = '>=' / '<=' / '=' / '<>' / '>' / '<' 

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
    / collect
    / get
    // These return regular Value instances
    / num:number
        { return new Value('number', num); }
    / str:string 
        { return new Value('string', str); }
    / boolean:boolean
        { return new Value('boolean', boolean); }
    / null 
        { return new Value('null', null); }
    / reference:object_key
        { return new Value('reference', reference); }
boolean
    = 'true'
        { return true; }
    / 'false'
        { return false; }
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
    = integral:('0' / [1-9][0-9]*) fraction:("." [0-9]*)? 
        { return Number.parseFloat((Array.isArray(integral) ? integral.flat().join('') : integral) + (fraction ?? []).flat().join('')); }
_
    = ' '*
__
    = ' '+