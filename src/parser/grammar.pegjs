start = command

command = list

list = 'list' _ args:list_args { return new ListCommand(args); }

list_args = iterable:iterables { return new ListArgs(iterable); }

iterables = 'users' / 'roles' / 'channels'

_ = ' '+