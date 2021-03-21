![disQL logo](./logo.png)

### Discord Query Language Bot

Have you ever wanted to manage your Discord guilds in a SQL-like fashion? No? Oh well, anyway...

## What?

This is a bot which enables you to use a custom, domain-specific query language designed for no-coding management purposes. Wanna add nicknames to all users in a given channel? Just type `/map member in get "members" from #channel into rename member to "New nickname!"` (command syntax is WIP and a subject to change)!

## Prerequisites

This project uses Node 14 and npm 6.

## Installing & running

1. Clone this repository.
2. Run `npm i` to install packages.
3. After installation, you will be prompted to enter your bot API token. This can be found on [Discord dev portal](https://discord.com/developers/applications) in your selected app under "Bot" tab.
4. Run `npm run start` to initialize the bot.

## How does it work?

I use something which is called a [parser generator](https://en.wikipedia.org/wiki/Compiler-compiler), more precisely [pegjs](https://pegjs.org), which takes in a special input format called a grammar and outputs a code of a parser. A parser is a special type of function which takes some string input, tokenizes, recognizes patters defined in grammar and runs code applicable to those patterns.

There's a file called [grammar.pegjs](./src/parser/grammar.pegjs) with the grammar definition inside and a script [generateParser.ts](./scripts/generateParser.ts), which loads this grammar file, uses the parser generator and outputs the created grammar as just another project file, from which the results are imported into the rest of the code.

When a message comes in, it's parsed by the parser function and outputs a command, which is then executed and its result sent back to the user.

## But HOW does it work?
1. A message comes in.
2. Parser builds an AST (abstract syntax tree) from the message contents, which consists of nested `Commands`, `Values` and their arguments. It initializes an `ExecutionContext` which holds any command-runtime variable references. Classes used in AST are defined in [parser](./src/parser) subdirectories.
3. The root `Command` is executed. It calls `resolve` on any of its `Value`-type arguments, which leads to its child being executed and so on. The result values go up in the execution tree, carrying information about the query, as well as the errors.