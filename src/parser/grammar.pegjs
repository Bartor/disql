// Initialize a default execution context
{
const context = new ExecutionContext();
}

start = command

command = list / for / print
// COMMANDS

// list - takes an ITERABLE and generates (filtered) ITERABLE 
list
    = 'list' __ args:list_args
        { return new ListCommand(args, context); }
list_args 
    = iterable:iterable filters:filters?
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

// for .. in .. do - binds a VARIABLE as an item of ITERABLE and exectus COMMAND
for
    = 'for' __ args:for_args
        { return new ForInDoCommand(args, context); }
for_args
    = iteration_variable:object_key __ 'in' __ iteration_target:iterable __ 'do' __ command:command
        { return new ForInDoArgs(iteration_variable, iteration_target, command); }

// print - converts value to string
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

// RELATED TO COMMANDS
iterable
    = 'users'
        { return new IterableSource('users'); }
    / 'roles'
        { return new IterableSource('roles'); }
    / 'channels'
        { return new IterableSource('channels'); }
    / list
unions
    = 'and' / 'or'
comparison
    = '>=' / '<=' / '=' / '<>' / '>' / '<' 

// VALUES
value
    = num:number
        { return new Value('number', num); }
    / str:string 
        { return new Value('string', str); }
    / reference:object_key
        { return new Value('reference', reference); }
object_key
    = key:[a-zA-Z]+[a-zA-Z0-9]* 
        { return key.flat().join(''); }
string
    = '"' chars:[^"]+ '"' 
        { return chars.join(''); }
    / "'" chars:[^']+ "'"
        { return chars.join(''); }
number
    = integral:('0' / [1-9][0-9]*) fraction:("." [0-9]*)? 
        { return Number.parseFloat(integral.flat().join('') + (fraction ?? []).flat().join('')); }
_
    = ' '*
__
    = ' '+