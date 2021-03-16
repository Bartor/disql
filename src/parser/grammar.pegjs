// Initialize a default execution context
{
const context = new ExecutionContext();
}

start = command

command = list / for / print / length
// COMMANDS

// list - takes an IterableSource, allows filters and returns IterableSource 
list
    = 'list' __ args:list_args
        { return new ListCommand(args, context); }
list_args 
    = iterable:iterable_value filters:filters?
        { return new ListArgs(iterable, filters ?? new PassFilter()); }
filters
    = __ 'where' __ filter:filter_union
        { return filter; }
filter_union
    = '(' _ lhs:filter_union __ op:unions __ rhs:filter_union _ ')'
        { return new FilterUnion(lhs, op, rhs); }
    / filter
filter 
    = key:object_key _ op:comparison _ value:value 
        { return new Filter(key, op, value); }
    / op:comparison _ value:value
        { return new Filter(null, op, value); }

// for .. in .. do - binds a Value<reference> to ExecutionContext for each item of IterableSource
for
    = 'for' __ args:for_args
        { return new ForInDoCommand(args, context); }
for_args
    = iteration_variable:object_key __ 'in' __ iteration_target:iterable_value __ 'do' __ command:command
        { return new ForInDoArgs(iteration_variable, iteration_target, command); }

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

// RELATED TO COMMANDS
iterable_value
    // These return Value<iterable> instances
    = list
    / for
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
    // These return Value<iterable> instances
    = iterable_value
    / print
    / length
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