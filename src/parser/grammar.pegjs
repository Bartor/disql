start = command

command = list

// COMMANDS

list
    = 'list' __ args:list_args
        { return new ListCommand(args); }
list_args 
    = iterable:iterables filters:filters?
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

// CONSTANTS
unions
    = 'and' / 'or'
comparison
    = '>=' / '<=' / '=' / '<>' / '>' / '<' 
object_key
    = key:[a-zA-Z]+[a-zA-Z0-9]* 
        { return key.flat().join(''); }
value
    = number / string
string
    = '"' chars:[^"]+ '"' 
        { return chars.join(''); }
number
    = integral:('0' / [1-9][0-9]*) fraction:("." [0-9]*)? 
        { return Number.parseFloat(integral.flat().join('') + (fraction ?? []).flat().join('')); }
iterables 
    = 'users' / 'roles' / 'channels'
_
    = ' '*
__
    = ' '+