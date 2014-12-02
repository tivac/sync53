[sync53](http://sync53.com/)
======
[![Dependency Status](https://david-dm.org/tivac/sync53.svg)](https://david-dm.org/tivac/sync53) [![npm version](https://badge.fury.io/js/sync53.svg)](http://badge.fury.io/js/sync53)
---
Update Route53 the right way, with a text config file that you can version. Use your existing revision control & user permissions, then let the tool convert your human-understandable config into all the right AWS jargon.

## Install

```
npm install -g sync53
```

## Usage

```
  Usage: sync53 [options] [command]

  Commands:

    import [options] [<zones>...]  Import DNS information from Route53
    check <config>                 Validate <config>
    diff <config> [<zones>...]     Diff current Route53 settings against <config>
    commit <config> [zones...]     Commit <config> to Route53
    clean <config> [<zones>...]    Compare <config> to Route53 & show stale records

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
