sync53
======

Update Route53 the right way, with a text config file that you can version.

## Usage

```
 Usage: sync53 [options] [command]

 Commands:

   import [options] [zones...]  Import DNS information from Route53
   check <file>                 Validate the config in <file>
   diff <file> [zones...]       Diff local config stored in <file> to current Route53 config
   commit <file> [zones...]     Commit local config stored in <file> to Route53

 Options:

   -h, --help             output usage information
   -V, --version          output the version number
   -v, --verbose          Verbose output
   --silent               Silent output (only errors)
   --proxy <proxy>        URL to proxy requests through
   -k, --key <key>        AWS Access Key
   -s, --secret <secret>  AWS Secret

```

If you define the `AWS_ACCESS_KEY_ID` &
`AWS_SECRET_ACCESS_KEY` in your environment you won't need to constantly specify them on the CLI.

`zones...` is available to optionally filter the zones being imported/exported, it does exact matching for now.

## TODO

1. Add a `cleanup` command to tell you which R53 records you should delete.
    - It will **not** automatically delete records (as a precaution).

## License
```
The MIT License (MIT)

Copyright (c) 2014 Patrick Cavit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
