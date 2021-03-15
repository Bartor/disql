# disQL
### Discord Query Language Bot

This is an experimental Discord bot based on a generated parser of a domain-specific grammar created for this purpose.

## What?

I use something which is called a [parser generator](https://en.wikipedia.org/wiki/Compiler-compiler), more precisely [pegjs](https://pegjs.org), which takes in a special input format called a grammar and outputs a code of a parser which is able to tokenize and interpret a "sentence" in a given grammar (or throw an error for an incorrect sentence).

## How does it work?

There's a file called [grammar.pegjs](./src/parser/grammar.pegjs) with the grammar definition inside and a script [generateParser.ts](./scripts/generateParser.ts), which loads this grammar file, uses the parser generator and outputs the created grammar as just another project file, from which the results are imported into the rest of the code.

## What's the status of the project?

It's currently in very, _very_ alpha-PoC stage, but it demonstrates that it can be done and work.
